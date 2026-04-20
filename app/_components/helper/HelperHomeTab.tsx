import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, ActivityIndicator, View } from "react-native";

import { useHelperAssignment } from "../../_context/HelperAssignmentContext";
import HelperBusRouteCard from "./HelperBusRouteCard";
import HelperAttendanceSummaryCard from "./HelperAttendanceSummaryCard";
import HelperQuickActions from "./HelperQuickActions";
import { countAttendanceStatuses } from "./attendanceCounts";
import { Theme } from "../../_theme/theme";

type Props = {
  onOpenRfidAttendance?: () => void;
  onOpenManualAttendance?: () => void;
  onOpenAttendanceSheet?: () => void;
};

export default function HelperHomeTab({
  onOpenRfidAttendance,
  onOpenManualAttendance,
  onOpenAttendanceSheet,
}: Props) {
  const { assignment, rosterStudents, rosterLoading, rosterError } = useHelperAssignment();

  const counts = useMemo(() => countAttendanceStatuses(rosterStudents), [rosterStudents]);

  if (!assignment) return null;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {rosterLoading ? (
        <View style={styles.rosterBanner}>
          <ActivityIndicator color={Theme.text} />
          <Text style={styles.rosterBannerText}>Loading student roster…</Text>
        </View>
      ) : null}
      {rosterError ? (
        <Text style={styles.rosterError} accessibilityRole="alert">
          {rosterError}
        </Text>
      ) : null}
      <HelperBusRouteCard assignment={assignment} liveStudentCount={rosterStudents.length} />
      <HelperAttendanceSummaryCard
        onBoard={counts.present}
        pending={counts.pending}
        absent={counts.absent}
        onOpenSheet={onOpenAttendanceSheet}
      />
      <HelperQuickActions
        onRfidPress={onOpenRfidAttendance}
        onManualPress={onOpenManualAttendance}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 112,
  },
  rosterBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    paddingVertical: 10,
  },
  rosterBannerText: {
    fontSize: 14,
    fontWeight: "600",
    color: Theme.textSecondary,
  },
  rosterError: {
    fontSize: 13,
    fontWeight: "600",
    color: Theme.danger,
    marginBottom: 12,
  },
});
