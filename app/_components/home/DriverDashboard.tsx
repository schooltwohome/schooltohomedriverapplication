import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import TripSetupWizard from "../driver-trip/TripSetupWizard";
import LiveTripDashboard from "../driver-trip/LiveTripDashboard";
import { captureTripStartSnapshot } from "../driver-trip/tripStartLocation";
import { TripData } from "../driver-trip/types";
import { useAppSelector } from "../../../store/hooks";
import { assignmentToBusRoute } from "../../../lib/mapAssignment";

interface DriverDashboardProps {
  onLiveTripChange?: (live: boolean) => void;
}

export default function DriverDashboard({ onLiveTripChange }: DriverDashboardProps) {
  const me = useAppSelector((s) => s.auth.me);
  const prefill = useMemo<Partial<TripData> | null>(() => {
    if (!me?.assignment?.route) return null;
    const { bus, route } = assignmentToBusRoute(me.assignment);
    return { bus, route, schedule: null };
  }, [me?.assignment]);

  const [isLive, setIsLive] = useState(false);
  const [activeTripData, setActiveTripData] = useState<TripData | null>(null);

  useEffect(() => {
    onLiveTripChange?.(isLive);
  }, [isLive, onLiveTripChange]);

  const handleStartTrip = async (data: TripData) => {
    const tripStart = await captureTripStartSnapshot();
    setActiveTripData({ ...data, tripStart });
    setIsLive(true);
  };

  const handleEndTrip = () => {
    setIsLive(false);
    setActiveTripData(null);
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
