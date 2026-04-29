import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogOut } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Theme } from "../../_theme/theme";
import { TripData, TripCoords } from "./types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { logoutThunk } from "../../../store/slices/authSlice";
import { useLiveLocationReporter } from "../../hooks/useLiveLocationReporter";
import { getRouteStopsLive, postTripStopCompleted } from "../../../services/driverHelperApi";
import type { RouteStopsLiveResponse } from "../../../services/driverHelperApi";
import LiveTripHeader from "./live/LiveTripHeader";
import CurrentStopCard from "./live/CurrentStopCard";
import NextStopRow from "./live/NextStopRow";
import RouteProgressTimeline, { TimelineStop } from "./live/RouteProgressTimeline";
import BottomActions from "./live/BottomActions";
import TripNavigationModal from "./live/TripNavigationModal";

interface Props {
  tripData: TripData;
  onEndTrip: () => void;
}

type RouteStop = {
  id: string;
  name: string;
  time: string;
  students: number;
  coordinate: TripCoords;
  navigateEnabled: boolean;
};

function mapApiStopToRouteStop(
  s: RouteStopsLiveResponse["stops"][number]
): RouteStop {
  const lat = Number(s.latitude);
  const lng = Number(s.longitude);
  const valid =
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    !(lat === 0 && lng === 0);
  return {
    id: s.id,
    name: s.stop_name,
    time: "—",
    students: s.students_count,
    coordinate: valid ? { latitude: lat, longitude: lng } : { latitude: 0, longitude: 0 },
    navigateEnabled: valid,
  };
}

function buildTimeline(stops: RouteStop[], currentIndex: number): TimelineStop[] {
  const pastEnd = currentIndex >= stops.length;
  return stops.map((s, i) => {
    let status: TimelineStop["status"];
    if (pastEnd) status = "completed";
    else if (i < currentIndex) status = "completed";
    else if (i === currentIndex) status = "current";
    else status = "upcoming";
    return { id: s.id, name: s.name, time: s.time, students: s.students, status };
  });
}

function formatElapsed(startedAtMs: number): string {
  const sec = Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function LiveTripDashboard({ tripData, onEndTrip }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const token = useAppSelector((s) => s.auth.token);

  const handleSignOut = () => {
    Alert.alert(
      "Sign out",
      "You will return to the sign-in screen. End the trip first if you are still driving.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: async () => {
            await dispatch(logoutThunk());
            router.replace("/screens/Auth/LoginScreen");
          },
        },
      ]
    );
  };
  const rawBusId = tripData.bus?.id ? Number(tripData.bus.id) : NaN;
  const busIdForApi = Number.isFinite(rawBusId) ? rawBusId : null;
  useLiveLocationReporter(true, token, busIdForApi);

  const routeId = tripData.route?.id ?? null;
  const busName = tripData.bus?.name || "Bus";
  const tripStart = tripData.tripStart;
  const startedAtMs = tripStart?.startedAtMs ?? Date.now();

  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [stopsLoading, setStopsLoading] = useState(true);
  const [stopsError, setStopsError] = useState<string | null>(null);

  const loadStops = useCallback(async () => {
    if (!token || !routeId) {
      setRouteStops([]);
      setStopsLoading(false);
      setStopsError(!routeId ? "No route selected for this trip." : null);
      return;
    }
    setStopsLoading(true);
    setStopsError(null);
    try {
      const res = await getRouteStopsLive(token, routeId);
      setRouteStops(res.stops.map(mapApiStopToRouteStop));
    } catch (e) {
      setStopsError(e instanceof Error ? e.message : "Could not load route stops");
      setRouteStops([]);
    } finally {
      setStopsLoading(false);
    }
  }, [token, routeId]);

  useEffect(() => {
    loadStops();
  }, [loadStops]);

  const totalStudentsOnStops = useMemo(
    () => routeStops.reduce((sum, s) => sum + s.students, 0),
    [routeStops]
  );
  const routeTotalFromPicker = tripData.route?.studentsCount ?? 0;
  const boardedDenominator = Math.max(totalStudentsOnStops, routeTotalFromPicker);

  const [elapsed, setElapsed] = useState(() => formatElapsed(startedAtMs));
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setElapsed(formatElapsed(startedAtMs));
    }, 1000);
    return () => clearInterval(t);
  }, [startedAtMs]);

  useEffect(() => {
    setCurrentStopIndex((i) =>
      routeStops.length === 0 ? 0 : Math.min(i, routeStops.length - 1)
    );
  }, [routeStops.length]);

  const timelineStops = useMemo(
    () => buildTimeline(routeStops, currentStopIndex),
    [routeStops, currentStopIndex]
  );

  const currentStop = routeStops[currentStopIndex];
  const nextStop = routeStops[currentStopIndex + 1];
  const routeComplete =
    routeStops.length === 0 || currentStopIndex >= routeStops.length;

  const stopsFraction = routeComplete
    ? `${routeStops.length}/${routeStops.length}`
    : `${currentStopIndex + 1}/${routeStops.length}`;

  const boardedFraction =
    boardedDenominator > 0 ? `0/${boardedDenominator}` : "0/0";

  const tripStartedLine = tripStart
    ? `Started ${new Date(tripStart.startedAtMs).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })} · ${tripStart.driverLocation ? "Start GPS saved" : "Start GPS unavailable"}`
    : undefined;

  const handleContinue = () => {
    if (routeComplete || routeStops.length === 0) return;
    const tid = tripData.tripId?.trim();
    const stopId = currentStop?.id;
    if (token && tid && stopId) {
      void (async () => {
        try {
          await postTripStopCompleted(token, tid, stopId);
        } catch (e) {
          const msg =
            e instanceof Error ? e.message : "Could not record stop on the server";
          Alert.alert(
            "Stop update",
            `${msg}\n\nThe route will still advance. Parents may not have been notified.`
          );
        }
      })();
    }
    setCurrentStopIndex((i) => Math.min(i + 1, routeStops.length));
  };

  const continueLabel = routeComplete
    ? routeStops.length === 0
      ? "No stops on route"
      : "Route finished"
    : currentStopIndex === routeStops.length - 1
      ? "Complete final stop"
      : "Continue to next stop";

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.signOutRow,
          { paddingTop: Math.max(insets.top, 6) },
        ]}
      >
        <TouchableOpacity
          style={styles.signOutPill}
          onPress={handleSignOut}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <LogOut size={18} color={Theme.text} />
          <Text style={styles.signOutPillText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <LiveTripHeader
        busName={busName}
        elapsedTime={elapsed}
        stopsFraction={stopsFraction}
        boardedFraction={boardedFraction}
        tripStartedLine={tripStartedLine}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {stopsLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Theme.yellowDark} />
            <Text style={styles.loadingHint}>Loading route…</Text>
          </View>
        ) : null}

        {!stopsLoading && stopsError ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{stopsError}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadStops} accessibilityRole="button">
              <Text style={styles.retryBtnText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!stopsLoading && !stopsError && routeStops.length === 0 ? (
          <View style={styles.doneCard}>
            <Text style={styles.doneTitle}>No stops on this route</Text>
            <Text style={styles.doneSubtitle}>
              Add stops to the route in the admin app, then start the trip again.
            </Text>
          </View>
        ) : null}

        {!stopsLoading && !stopsError && routeStops.length > 0 && !routeComplete && currentStop ? (
          <>
            <CurrentStopCard
              stopTime={currentStop.time}
              stopName={currentStop.name}
              studentsCount={currentStop.students}
              navigateEnabled={currentStop.navigateEnabled}
              onNavigate={() => setNavOpen(true)}
            />

            {nextStop ? (
              <NextStopRow nextStopName={nextStop.name} eta="—" />
            ) : (
              <View style={styles.finalRow}>
                <Text style={styles.finalLabel}>Next stop</Text>
                <Text style={styles.finalTitle}>This is the last stop on the route</Text>
              </View>
            )}
          </>
        ) : null}

        {!stopsLoading && !stopsError && routeStops.length > 0 && routeComplete ? (
          <View style={styles.doneCard}>
            <Text style={styles.doneTitle}>All stops completed</Text>
            <Text style={styles.doneSubtitle}>You can end the trip when the bus is clear.</Text>
          </View>
        ) : null}

        {!stopsLoading && !stopsError && routeStops.length > 0 ? (
          <RouteProgressTimeline stops={timelineStops} />
        ) : null}
      </ScrollView>

      <BottomActions
        onEndTrip={onEndTrip}
        onContinue={handleContinue}
        continueLabel={continueLabel}
        continueDisabled={routeComplete || routeStops.length === 0 || stopsLoading}
      />

      {!routeComplete && currentStop?.navigateEnabled ? (
        <TripNavigationModal
          visible={navOpen}
          onClose={() => setNavOpen(false)}
          stopCoordinate={currentStop.coordinate}
          stopName={currentStop.name}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.bg,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  signOutRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  signOutPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: Theme.bgMuted,
    borderWidth: 1.5,
    borderColor: Theme.border,
  },
  signOutPillText: {
    fontSize: 14,
    fontWeight: "800",
    color: Theme.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 12,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 10,
  },
  loadingHint: {
    fontSize: 14,
    color: Theme.textMuted,
    fontWeight: "600",
  },
  banner: {
    backgroundColor: Theme.bgMuted,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  bannerText: {
    fontSize: 14,
    color: Theme.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  retryBtn: {
    alignSelf: "flex-start",
    backgroundColor: Theme.yellowSoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.yellow,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: Theme.text,
  },
  finalRow: {
    backgroundColor: Theme.yellowSurface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: Theme.yellow,
  },
  finalLabel: {
    fontSize: 12,
    color: Theme.textSecondary,
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  finalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Theme.text,
  },
  doneCard: {
    backgroundColor: Theme.bg,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: Theme.border,
    marginBottom: 16,
  },
  doneTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: Theme.text,
    marginBottom: 8,
  },
  doneSubtitle: {
    fontSize: 15,
    color: Theme.textSecondary,
    lineHeight: 22,
    fontWeight: "600",
  },
});
