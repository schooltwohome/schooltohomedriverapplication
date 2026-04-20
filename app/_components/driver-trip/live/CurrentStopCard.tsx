import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Navigation } from "lucide-react-native";

import { Theme } from "../../../_theme/theme";

interface Props {
  stopTime: string;
  stopName: string;
  studentsCount: number;
  onNavigate: () => void;
  /** When false, hides Navigate (e.g. missing coordinates). */
  navigateEnabled?: boolean;
}

export default function CurrentStopCard({
  stopTime,
  stopName,
  studentsCount,
  onNavigate,
  navigateEnabled = true,
}: Props) {
  return (
    <View style={styles.currentStopCard}>
      <View style={styles.accent} />
      <View style={styles.cardInner}>
        <View style={styles.currentStopHeaderRow}>
          <View style={styles.inProgressBadge}>
            <Text style={styles.inProgressText}>In progress</Text>
          </View>
          <Text style={styles.currentStopTime}>{stopTime}</Text>
        </View>

        <Text style={styles.currentStopName}>{stopName}</Text>
        <Text style={styles.currentStopStudents}>{studentsCount} students waiting</Text>

        {navigateEnabled ? (
          <TouchableOpacity style={styles.navigateButton} activeOpacity={0.88} onPress={onNavigate}>
            <Navigation size={18} color={Theme.text} />
            <Text style={styles.navigateButtonText}>Navigate</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.navigateUnavailable}>Map needs valid coordinates for this stop.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  currentStopCard: {
    borderRadius: 22,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: Theme.border,
    backgroundColor: Theme.bg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  accent: {
    height: 4,
    backgroundColor: Theme.yellow,
    width: "100%",
  },
  cardInner: {
    padding: 20,
  },
  currentStopHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  inProgressBadge: {
    backgroundColor: Theme.yellowSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.yellow,
  },
  inProgressText: {
    color: Theme.text,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  currentStopTime: {
    fontSize: 14,
    fontWeight: "700",
    color: Theme.textSecondary,
  },
  currentStopName: {
    fontSize: 22,
    fontWeight: "900",
    color: Theme.text,
    marginBottom: 4,
  },
  currentStopStudents: {
    fontSize: 15,
    color: Theme.textSecondary,
    fontWeight: "600",
    marginBottom: 20,
  },
  navigateButton: {
    backgroundColor: Theme.yellow,
    flexDirection: "row",
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: Theme.yellowDark,
  },
  navigateButtonText: {
    color: Theme.text,
    fontSize: 16,
    fontWeight: "900",
  },
  navigateUnavailable: {
    fontSize: 14,
    fontWeight: "600",
    color: Theme.textMuted,
    textAlign: "center",
    paddingVertical: 14,
  },
});
