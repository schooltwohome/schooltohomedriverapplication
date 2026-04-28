import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Radio, PenLine } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { Theme } from "../../_theme/theme";
import { useHelperAssignment } from "../../_context/HelperAssignmentContext";
import { AttendanceStatus } from "./rosterTypes";
import HelperStudentRosterRow from "./HelperStudentRosterRow";
import { countAttendanceStatuses } from "./attendanceCounts";
import { useAppSelector } from "../../../store/hooks";
import { useHelperNfcAttendance } from "../../../hooks/useHelperNfcAttendance";

function nextStatus(current: AttendanceStatus): AttendanceStatus {
  if (current === "present") return "pending";
  if (current === "pending") return "absent";
  return "present";
}

type NfcUiState = {
  type: "idle" | "listening" | "processing" | "success" | "error";
  text?: string;
};

/** Passed when navigating from Home (e.g. “RFID attendance”) so we can auto-start scanning. */
export type HelperAttendanceBootstrap = { autoStartRfid: boolean; id: number };

type Props = {
  bootstrap?: HelperAttendanceBootstrap | null;
  onBootstrapConsumed?: () => void;
};

export default function HelperAttendanceTab({ bootstrap, onBootstrapConsumed }: Props) {
  const token = useAppSelector((s) => s.auth.token);
  const { assignment, rosterStudents, setStudentAttendance, refetchRoster } = useHelperAssignment();
  const [nfcListening, setNfcListening] = useState(false);
  const [nfcUi, setNfcUi] = useState<NfcUiState>({ type: "idle" });

  const onNfcStatus = useCallback((msg: NfcUiState) => {
    setNfcUi(msg);
    if (msg.type === "success") {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (msg.type === "error") {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, []);

  const onMarkedPresent = useCallback(
    async (payload: { studentUuid: string; status: AttendanceStatus; boardedAt?: string | null }) => {
      setStudentAttendance(payload.studentUuid, {
        status: payload.status,
        boardedAt: payload.status === "present" ? (payload.boardedAt ?? null) : null,
      });
      await refetchRoster();
    },
    [setStudentAttendance, refetchRoster]
  );

  const busIdNum = useMemo(() => {
    if (!assignment) return null;
    const n = Number(assignment.bus.id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [assignment]);

  const routeIdNum = useMemo(() => {
    if (!assignment) return null;
    const n = Number(assignment.route.id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [assignment]);

  useHelperNfcAttendance({
    enabled: nfcListening && !!token && busIdNum != null,
    token,
    routeIdNum,
    busIdNum,
    mode: "real",
    onAttendanceChanged: onMarkedPresent,
    onStatus: onNfcStatus,
  });

  useEffect(() => {
    if (!bootstrap) return;
    setNfcListening(bootstrap.autoStartRfid);
    setNfcUi({ type: "idle" });
    onBootstrapConsumed?.();
  }, [bootstrap, onBootstrapConsumed]);

  const openManual = useCallback(() => {
    Alert.alert(
      "Manual mode",
      "Tap any student row below to cycle Present → Pending → Absent."
    );
  }, []);

  const onRowPress = useCallback(
    (id: string, status: AttendanceStatus) => {
      const newStatus = nextStatus(status);
      setStudentAttendance(id, {
        status: newStatus,
        boardedAt: newStatus === "present" ? new Date().toISOString() : null,
      });
      void refetchRoster();
    },
    [setStudentAttendance, refetchRoster]
  );

  const toggleNfc = useCallback(() => {
    setNfcListening((v) => !v);
    setNfcUi({ type: "idle" });
  }, []);

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

      <TouchableOpacity
        style={[styles.tile, styles.tilePrimary, nfcListening && styles.tileActive]}
        activeOpacity={0.9}
        onPress={toggleNfc}
      >
        <Radio size={24} color={Theme.bg} />
        <View style={styles.tileText}>
          <Text style={styles.tileTitle}>
            {nfcListening ? "Stop RFID marking" : "Start RFID marking"}
          </Text>
          <Text style={styles.tileBody}>
            {nfcListening
              ? "Hold student RFID cards to the phone — each tap marks present on the active trip."
              : "Turn on, then tap each student RFID; the app sends the card ID to the server."}
          </Text>
        </View>
        {nfcListening && nfcUi.type === "processing" ? (
          <ActivityIndicator color={Theme.text} />
        ) : null}
      </TouchableOpacity>

      {nfcListening ? (
        <View style={styles.nfcBanner}>
          {nfcUi.type === "success" ? (
            <Text style={styles.nfcSuccess}>{nfcUi.text}</Text>
          ) : nfcUi.type === "error" ? (
            <Text style={styles.nfcError}>{nfcUi.text}</Text>
          ) : nfcUi.type === "processing" ? (
            <Text style={styles.nfcInfo}>{nfcUi.text}</Text>
          ) : (
            <Text style={styles.nfcInfo}>
              {nfcUi.text ?? "Listening for RFID — hold the phone near a student card."}
            </Text>
          )}
        </View>
      ) : null}

      <TouchableOpacity style={styles.tile} activeOpacity={0.9} onPress={openManual}>
        <PenLine size={24} color={Theme.text} />
        <View style={styles.tileText}>
          <Text style={[styles.tileTitle, styles.tileTitleDark]}>Manual marking</Text>
          <Text style={styles.tileBodyDark}>Fallback when RFID hardware is not available.</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>All students</Text>
        <Text style={styles.listHint}>Tap a row to change status, or use RFID above</Text>
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
  tileActive: {
    borderWidth: 2.5,
    borderColor: Theme.text,
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
  nfcBanner: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: Theme.bg,
    borderWidth: 1.5,
    borderColor: Theme.border,
  },
  nfcInfo: {
    fontSize: 14,
    fontWeight: "600",
    color: Theme.textSecondary,
    lineHeight: 20,
  },
  nfcSuccess: {
    fontSize: 14,
    fontWeight: "700",
    color: Theme.success,
    lineHeight: 20,
  },
  nfcError: {
    fontSize: 14,
    fontWeight: "600",
    color: Theme.danger,
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
