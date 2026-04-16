import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface DashboardCardProps {
  title: string;
  status: string;
  progress: string;
}

export default function DashboardCard({ title, status, progress }: DashboardCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{status}</Text>
          <Text style={styles.statLabel}>Current Mode</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{progress}</Text>
          <Text style={styles.statLabel}>Mock Pass</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0F172A",
    padding: 24,
    borderRadius: 24,
    marginTop: 10,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  cardTitle: {
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#ffffff20",
    marginHorizontal: 20,
  },
});
