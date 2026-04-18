import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ClipboardCheck } from "lucide-react-native";

interface Props {
  onBoard?: number;
  pending?: number;
  absent?: number;
  onOpenSheet?: () => void;
}

export default function HelperAttendanceSummaryCard({
  onBoard = 0,
  pending = 0,
  absent = 0,
  onOpenSheet,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance snapshot</Text>
        <View style={styles.livePill}>
          <View style={styles.pulseDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{onBoard}</Text>
          <Text style={styles.statLabel}>On board</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, styles.statAbsent]}>{absent}</Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.cta} activeOpacity={0.88} onPress={onOpenSheet}>
        <ClipboardCheck size={20} color="#FFFFFF" />
        <Text style={styles.ctaText}>Open attendance sheet</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#64748B",
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  liveText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F172A",
    textTransform: "uppercase",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
  },
  statAbsent: {
    color: "#F59E0B",
  },
  statLabel: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#F1F5F9",
  },
  cta: {
    backgroundColor: "#0D9488",
    flexDirection: "row",
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
