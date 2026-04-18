import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import TripSetupWizard from "../driver-trip/TripSetupWizard";
import LiveTripDashboard from "../driver-trip/LiveTripDashboard";
import { captureTripStartSnapshot } from "../driver-trip/tripStartLocation";
import { TripData } from "../driver-trip/types";

interface DriverDashboardProps {
  onLiveTripChange?: (live: boolean) => void;
}

export default function DriverDashboard({ onLiveTripChange }: DriverDashboardProps) {
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
        <TripSetupWizard onComplete={handleStartTrip} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
