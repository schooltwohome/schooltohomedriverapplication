import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { Theme } from "../../../theme/theme";

interface Props {
  busName: string;
  elapsedTime: string;
  stopsFraction: string;
  boardedFraction: string;
  tripStartedLine?: string;
}

export default function LiveTripHeader({
  busName,
  elapsedTime,
  stopsFraction,
  boardedFraction,
  tripStartedLine,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.accentTop} />
      <View style={styles.headerBanner}>
        <View style={styles.bannerTopRow}>
          <Text style={styles.bannerTitle}>Trip live</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
        <Text style={styles.bannerSubtitle}>{busName}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{elapsedTime}</Text>
            <Text style={styles.statLabel}>Elapsed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stopsFraction}</Text>
            <Text style={styles.statLabel}>Stops</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{boardedFraction}</Text>
            <Text style={styles.statLabel}>Boarded</Text>
          </View>
        </View>
        {tripStartedLine ? <Text style={styles.startedLine}>{tripStartedLine}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 20,
  },
  accentTop: {
    height: 4,
    backgroundColor: Theme.yellow,
    borderRadius: 2,
    marginBottom: -2,
  },
  headerBanner: {
    backgroundColor: Theme.bg,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    borderColor: Theme.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 4,
  },
  bannerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: Theme.text,
    letterSpacing: -0.3,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.yellowSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: Theme.yellow,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Theme.danger,
  },
  liveText: {
    color: Theme.text,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  bannerSubtitle: {
    fontSize: 15,
    color: Theme.textSecondary,
    fontWeight: "700",
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: Theme.yellowSurface,
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Theme.yellow,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "900",
    color: Theme.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Theme.textSecondary,
    fontWeight: "700",
  },
  statDivider: {
    width: 1,
    backgroundColor: Theme.border,
  },
  startedLine: {
    marginTop: 14,
    fontSize: 12,
    fontWeight: "700",
    color: Theme.textMuted,
    textAlign: "center",
  },
});
