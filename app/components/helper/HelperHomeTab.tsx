import React, { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, Alert } from "react-native";

import { useHelperAssignment } from "../../context/HelperAssignmentContext";
import HelperBusRouteCard from "./HelperBusRouteCard";
import HelperAttendanceSummaryCard from "./HelperAttendanceSummaryCard";
import HelperQuickActions from "./HelperQuickActions";
import { countAttendanceStatuses } from "./attendanceCounts";

export default function HelperHomeTab() {
  const { assignment, rosterStudents } = useHelperAssignment();

  const showStub = useCallback((title: string) => {
    Alert.alert(title, "Connect this action to your RFID reader and roster API.");
  }, []);

  const handleRfid = useCallback(() => {
    showStub("RFID attendance");
  }, [showStub]);

  const handleManual = useCallback(() => {
    showStub("Manual attendance");
  }, [showStub]);

  const handleSheet = useCallback(() => {
    showStub("Attendance sheet");
  }, [showStub]);

  const counts = useMemo(() => countAttendanceStatuses(rosterStudents), [rosterStudents]);

  if (!assignment) return null;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <HelperBusRouteCard assignment={assignment} />
      <HelperAttendanceSummaryCard
        onBoard={counts.present}
        pending={counts.pending}
        absent={counts.absent}
        onOpenSheet={handleSheet}
      />
      <HelperQuickActions onRfidPress={handleRfid} onManualPress={handleManual} />
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
});
