import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Radio, PenLine } from "lucide-react-native";

import { Theme } from "../../theme/theme";
import { useHelperAssignment } from "../../context/HelperAssignmentContext";
import { AttendanceStatus } from "./rosterTypes";
import HelperStudentRosterRow from "./HelperStudentRosterRow";
import { countAttendanceStatuses } from "./attendanceCounts";

function nextStatus(current: AttendanceStatus): AttendanceStatus {
  if (current === "present") return "pending";
  if (current === "pending") return "absent";
  return "present";
}

export default function HelperAttendanceTab() {
  const { assignment, rosterStudents, setStudentAttendance } = useHelperAssignment();

  const openRfid = useCallback(() => {
    Alert.alert("RFID mode", "Scans will mark students present when linked to your roster.");
  }, []);

  const openManual = useCallback(() => {
    Alert.alert(
      "Manual mode",
      "Tap any student row below to cycle Present → Pending → Absent (demo)."
    );
  }, []);

  const onRowPress = useCallback(
    (id: string, status: AttendanceStatus) => {
      setStudentAttendance(id, nextStatus(status));
    },
    [setStudentAttendance]
  );

  const totals = countAttendanceStatuses(rosterStudents);

  if (!assignment) return null;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>Attendance</Text>
      <Text style={styles.sub}>
        {assignment.route.name} · {rosterStudents.length} students · {totals.present} present ·{" "}
        {totals.pending} pending · {totals.absent} absent
      </Text>

      <TouchableOpacity style={[styles.tile, styles.tilePrimary]} activeOpacity={0.9} onPress={openRfid}>
        <Radio size={24} color={Theme.bg} />
        <View style={styles.tileText}>
          <Text style={styles.tileTitle}>RFID marking</Text>
          <Text style={styles.tileBody}>Primary flow — scan to mark present.</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tile} activeOpacity={0.9} onPress={openManual}>
        <PenLine size={24} color={Theme.text} />
        <View style={styles.tileText}>
          <Text style={[styles.tileTitle, styles.tileTitleDark]}>Manual marking</Text>
          <Text style={styles.tileBodyDark}>Fallback when RFID is not available.</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>All students</Text>
        <Text style={styles.listHint}>Tap a row to update presence (demo)</Text>
      </View>

      <View style={styles.listCard}>
        {rosterStudents.map((s, index) => (
          <TouchableOpacity
            key={s.id}
            activeOpacity={0.75}
            onPress={() => onRowPress(s.id, s.status)}
          >
            <HelperStudentRosterRow
              student={s}
              isLast={index === rosterStudents.length - 1}
            />
          </TouchableOpacity>
        ))}
      </View>
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
  heading: {
    fontSize: 22,
    fontWeight: "900",
    color: Theme.text,
    marginBottom: 6,
  },
  sub: {
    fontSize: 14,
    color: Theme.textSecondary,
    fontWeight: "600",
    marginBottom: 18,
    lineHeight: 20,
  },
  tile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Theme.bg,
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Theme.border,
  },
  tilePrimary: {
    backgroundColor: Theme.yellow,
    borderColor: Theme.yellowDark,
  },
  tileText: {
    flex: 1,
  },
  tileTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Theme.text,
    marginBottom: 4,
  },
  tileTitleDark: {
    color: Theme.text,
  },
  tileBody: {
    fontSize: 14,
    color: Theme.textSecondary,
    fontWeight: "600",
    lineHeight: 20,
  },
  tileBodyDark: {
    fontSize: 14,
    color: Theme.textSecondary,
    fontWeight: "600",
    lineHeight: 20,
  },
  listHeader: {
    marginTop: 8,
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: Theme.text,
  },
  listHint: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: Theme.textMuted,
  },
  listCard: {
    backgroundColor: Theme.bg,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Theme.border,
    paddingHorizontal: 12,
    paddingTop: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
});
