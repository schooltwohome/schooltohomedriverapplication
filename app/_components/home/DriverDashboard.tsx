import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, AppState, View, StyleSheet } from "react-native";
import TripSetupWizard from "../driver-trip/TripSetupWizard";
import LiveTripDashboard from "../driver-trip/LiveTripDashboard";
import { captureTripStartSnapshot } from "../driver-trip/tripStartLocation";
import { TripData } from "../driver-trip/types";
import { publishCurrentLocationOnce } from "../../hooks/useLiveLocationReporter";
import { useAppSelector } from "../../../store/hooks";
import { assignmentToBusRoute } from "../../../lib/mapAssignment";
import {
  getMyActiveTrip,
  postDriverTripCancel,
  postDriverTripComplete,
  postDriverTripStart,
} from "../../../services/driverHelperApi";
import { ApiHttpError } from "../../../services/http";

interface DriverDashboardProps {
  onLiveTripChange?: (live: boolean) => void;
}

export default function DriverDashboard({ onLiveTripChange }: DriverDashboardProps) {
  const me = useAppSelector((s) => s.auth.me);
  const token = useAppSelector((s) => s.auth.token);
  const prefill = useMemo<Partial<TripData> | null>(() => {
    if (!me?.assignment?.route) return null;
    const { bus, route } = assignmentToBusRoute(me.assignment);
    return { bus, route, schedule: null };
  }, [me?.assignment]);

  const [isLive, setIsLive] = useState(false);
  const [activeTripData, setActiveTripData] = useState<TripData | null>(null);

  const loadActiveTripFromServer = useCallback(async () => {
    if (!token) {
      setIsLive(false);
      setActiveTripData(null);
      return;
    }
    // Never kick a driver out of the live trip screen due to background refreshes.
    // On Android APK builds, permission prompts can cause AppState transitions that
    // would otherwise bounce the UI back to the wizard immediately after start/resume.
    if (isLive) return;
    try {
      const active = await getMyActiveTrip(token);
      // Trip setup screens handle the "active trip" gate themselves (Resume/Abort).
      // This refresh is only to clear state when the user is signed out.
      void active;
    } catch {
      /* Keep current UI on transient errors so we do not kick a live driver back to the wizard offline. */
    }
  }, [token, isLive]);

  useEffect(() => {
    void loadActiveTripFromServer();
  }, [loadActiveTripFromServer]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void loadActiveTripFromServer();
    });
    return () => sub.remove();
  }, [loadActiveTripFromServer]);

  useEffect(() => {
    onLiveTripChange?.(isLive);
  }, [isLive, onLiveTripChange]);

  const handleStartTrip = async (data: TripData) => {
    const busId = data.bus?.id != null ? Number(data.bus.id) : NaN;
    const routeId = data.route?.id != null ? Number(data.route.id) : NaN;

    let serverTripId: string | undefined;
    if (!token) {
      Alert.alert("Trip start", "You are not signed in. Please sign in to start a live trip.");
      return;
    }
    if (!Number.isFinite(busId) || !Number.isFinite(routeId)) {
      Alert.alert("Trip start", "Bus or route is missing. Please reselect and try again.");
      return;
    }
    try {
      const startRes = await postDriverTripStart(token, { busId, routeId });
      const rawId = startRes?.trip?.id;
      serverTripId =
        rawId !== undefined && rawId !== null ? String(rawId) : undefined;
      void publishCurrentLocationOnce(token, busId).catch(() => {
        /* keep trip-start UX non-blocking if first GPS publish fails */
      });
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Could not register trip start on the server";
      if (e instanceof ApiHttpError && e.status === 409) {
        Alert.alert("Route unavailable", msg);
        return;
      }
      Alert.alert("Could not start trip", msg);
      return;
    }

    const tripStartPromise = captureTripStartSnapshot();
    const tripStart = await tripStartPromise;
    setActiveTripData({
      ...data,
      tripStart,
      ...(serverTripId ? { tripId: serverTripId } : {}),
    });
    setIsLive(true);
  };

  const handleResumeTrip = (data: TripData) => {
    setActiveTripData(data);
    setIsLive(true);
  };

  const handleEndTrip = () => {
    const busId = activeTripData?.bus?.id != null ? Number(activeTripData.bus.id) : undefined;
    const routeId = activeTripData?.route?.id != null ? Number(activeTripData.route.id) : undefined;

    Alert.alert("End trip", "How do you want to end this trip?", [
      { text: "Keep driving", style: "cancel" },
      {
        text: "Cancel trip",
        style: "destructive",
        onPress: async () => {
          if (token) {
            try {
              await postDriverTripCancel(token, { busId, routeId });
            } catch (e) {
              const msg = e instanceof Error ? e.message : "Could not cancel the trip on the server";
              Alert.alert("Cancel trip", msg);
              return;
            }
          }
          setIsLive(false);
          setActiveTripData(null);
        },
      },
      {
        text: "Complete trip",
        onPress: async () => {
          if (token) {
            try {
              await postDriverTripComplete(token, { busId, routeId });
            } catch (e) {
              const msg = e instanceof Error ? e.message : "Could not complete the trip on the server";
              Alert.alert("Complete trip", msg);
              return;
            }
          }
          setIsLive(false);
          setActiveTripData(null);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {isLive && activeTripData ? (
        <LiveTripDashboard tripData={activeTripData} onEndTrip={handleEndTrip} />
      ) : (
        <TripSetupWizard
          key={me?.assignment?.bus.id ?? "trip-setup"}
          prefill={prefill}
          onComplete={handleStartTrip}
          onResumeActiveTrip={handleResumeTrip}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
