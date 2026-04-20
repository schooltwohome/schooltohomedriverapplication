import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { Theme } from "../../../_theme/theme";

const ClockIcon = () => (
  <View style={styles.clockIconContainer}>
    <View style={styles.clockIconHandV} />
    <View style={styles.clockIconHandH} />
  </View>
);

interface Props {
  nextStopName: string;
  eta: string;
}

export default function NextStopRow({ nextStopName, eta }: Props) {
  return (
    <View style={styles.nextStopRow}>
      <View style={styles.nextStopInfo}>
        <Text style={styles.nextStopLabel}>Next stop</Text>
        <Text style={styles.nextStopName}>{nextStopName}</Text>
      </View>
      <View style={styles.nextStopEta}>
        <ClockIcon />
        <Text style={styles.etaText}>{eta}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nextStopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Theme.yellowSurface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: Theme.yellow,
  },
  nextStopInfo: {
    flex: 1,
  },
  nextStopLabel: {
    fontSize: 12,
    color: Theme.textSecondary,
    fontWeight: "800",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  nextStopName: {
    fontSize: 16,
    fontWeight: "900",
    color: Theme.text,
  },
  nextStopEta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.yellowSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Theme.yellow,
  },
  etaText: {
    fontSize: 13,
    fontWeight: "900",
    color: Theme.text,
  },
  clockIconContainer: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Theme.yellowDark,
    justifyContent: "center",
    alignItems: "center",
  },
  clockIconHandV: {
    width: 1.5,
    height: 4,
    backgroundColor: Theme.yellowDark,
    position: "absolute",
    top: 2,
  },
  clockIconHandH: {
    width: 4,
    height: 1.5,
    backgroundColor: Theme.yellowDark,
    position: "absolute",
    top: 5,
    left: 6,
  },
});
