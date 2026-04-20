import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MapPin, CheckCircle2, Circle } from "lucide-react-native";

import { Theme } from "../../../_theme/theme";

export interface TimelineStop {
  id: string;
  name: string;
  time: string;
  students: number;
  status: "completed" | "current" | "upcoming";
}

interface Props {
  stops: TimelineStop[];
}

export default function RouteProgressTimeline({ stops }: Props) {
  return (
    <>
      <Text style={styles.sectionTitle}>Route progress</Text>
      <View style={styles.timelineContainer}>
        {stops.map((stop, index) => {
          const isLast = index === stops.length - 1;
          const isCompleted = stop.status === "completed";
          const isCurrent = stop.status === "current";

          return (
            <View key={stop.id} style={styles.timelineItem}>
              <View style={styles.timelineIconColumn}>
                {isCompleted ? (
                  <CheckCircle2 size={24} color={Theme.success} />
                ) : isCurrent ? (
                  <View style={styles.currentIconWrapper}>
                    <MapPin size={16} color={Theme.text} />
                  </View>
                ) : (
                  <Circle size={24} color={Theme.borderStrong} />
                )}
                {!isLast && (
                  <View
                    style={[styles.timelineLine, isCompleted && styles.timelineLineCompleted]}
                  />
                )}
              </View>

              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineStopName,
                    isCompleted && styles.timelineStopNameCompleted,
                    isCurrent && styles.timelineStopNameCurrent,
                  ]}
                >
                  {stop.name}
                </Text>
                <Text style={styles.timelineStopDetails}>
                  {stop.time} · {stop.students} students
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: Theme.textSecondary,
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: 4,
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: "row",
  },
  timelineIconColumn: {
    width: 32,
    alignItems: "center",
  },
  currentIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.yellow,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Theme.yellowDark,
    shadowColor: Theme.yellowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Theme.border,
    marginVertical: 4,
  },
  timelineLineCompleted: {
    backgroundColor: Theme.success,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
    paddingLeft: 12,
    paddingTop: 2,
  },
  timelineStopName: {
    fontSize: 16,
    fontWeight: "700",
    color: Theme.textMuted,
    marginBottom: 4,
  },
  timelineStopNameCompleted: {
    textDecorationLine: "line-through",
    color: Theme.textMuted,
  },
  timelineStopNameCurrent: {
    color: Theme.text,
    fontWeight: "900",
    textDecorationLine: "none",
  },
  timelineStopDetails: {
    fontSize: 13,
    color: Theme.textSecondary,
    fontWeight: "600",
  },
});
