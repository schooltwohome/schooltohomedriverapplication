import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Theme } from "../../theme/theme";
import { TripData, TripCoords } from "./types";
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
};

/** Demo route coordinates (replace with API-driven stops when backend is ready). */
const ROUTE_STOPS: RouteStop[] = [
  {
    id: "1",
    name: "Green Valley Apartments",
    time: "7:00 AM",
    students: 5,
    coordinate: { latitude: 12.9275, longitude: 77.621 },
  },
  {
    id: "2",
    name: "Sunrise Colony",
    time: "7:10 AM",
    students: 4,
    coordinate: { latitude: 12.9342, longitude: 77.6088 },
  },
  {
    id: "3",
    name: "Park View Road",
    time: "7:20 AM",
    students: 6,
    coordinate: { latitude: 12.9428, longitude: 77.5975 },
  },
  {
    id: "4",
    name: "Lake Side Estate",
    time: "7:30 AM",
    students: 3,
    coordinate: { latitude: 12.9515, longitude: 77.5895 },
  },
  {
    id: "5",
    name: "Hill Top Society",
    time: "7:40 AM",
    students: 4,
    coordinate: { latitude: 12.9588, longitude: 77.582 },
  },
  {
    id: "6",
    name: "City Center Mall",
    time: "7:50 AM",
    students: 6,
    coordinate: { latitude: 12.9716, longitude: 77.5946 },
  },
];

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
  const busName = tripData.bus?.name || "Bus #SB-042";
  const tripStart = tripData.tripStart;
  const startedAtMs = tripStart?.startedAtMs ?? Date.now();

  const [elapsed, setElapsed] = useState(() => formatElapsed(startedAtMs));
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setElapsed(formatElapsed(startedAtMs));
    }, 1000);
    return () => clearInterval(t);
  }, [startedAtMs]);

  const timelineStops = useMemo(
    () => buildTimeline(ROUTE_STOPS, currentStopIndex),
    [currentStopIndex]
  );

  const currentStop = ROUTE_STOPS[currentStopIndex];
  const nextStop = ROUTE_STOPS[currentStopIndex + 1];
  const routeComplete = currentStopIndex >= ROUTE_STOPS.length;

  const stopsFraction = routeComplete
    ? `${ROUTE_STOPS.length}/${ROUTE_STOPS.length}`
    : `${currentStopIndex + 1}/${ROUTE_STOPS.length}`;

  const tripStartedLine = tripStart
    ? `Started ${new Date(tripStart.startedAtMs).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })} · ${tripStart.driverLocation ? "Start GPS saved" : "Start GPS unavailable"}`
    : undefined;

  const handleContinue = () => {
    if (routeComplete) return;
    setCurrentStopIndex((i) => Math.min(i + 1, ROUTE_STOPS.length));
  };

  const continueLabel = routeComplete
    ? "Route finished"
    : currentStopIndex === ROUTE_STOPS.length - 1
      ? "Complete final stop"
      : "Continue to next stop";

  return (
    <View style={styles.container}>
      <LiveTripHeader
        busName={busName}
        elapsedTime={elapsed}
        stopsFraction={stopsFraction}
        boardedFraction="9/24"
        tripStartedLine={tripStartedLine}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {!routeComplete && currentStop ? (
          <>
            <CurrentStopCard
              stopTime={currentStop.time}
              stopName={currentStop.name}
              studentsCount={currentStop.students}
              onNavigate={() => setNavOpen(true)}
            />

            {nextStop ? (
              <NextStopRow nextStopName={nextStop.name} eta="~10 min" />
            ) : (
              <View style={styles.finalRow}>
                <Text style={styles.finalLabel}>Next stop</Text>
                <Text style={styles.finalTitle}>This is the last stop on the route</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.doneCard}>
            <Text style={styles.doneTitle}>All stops completed</Text>
            <Text style={styles.doneSubtitle}>You can end the trip when the bus is clear.</Text>
          </View>
        )}

        <RouteProgressTimeline stops={timelineStops} />
      </ScrollView>

      <BottomActions
        onEndTrip={onEndTrip}
        onContinue={handleContinue}
        continueLabel={continueLabel}
        continueDisabled={routeComplete}
      />

      {!routeComplete && currentStop ? (
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 12,
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
