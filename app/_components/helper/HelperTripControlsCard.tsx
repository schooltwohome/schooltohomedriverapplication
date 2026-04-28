import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { UserPlus, Square } from "lucide-react-native";

import { Theme } from "../../_theme/theme";
import { useAppSelector } from "../../../store/hooks";
import {
  useHelperAssignment,
  type HelperAssignment,
} from "../../_context/HelperAssignmentContext";
import {
  postDriverTripCancel,
  postDriverTripComplete,
  postHelperTripJoin,
} from "../../../services/driverHelperApi";
type Props = {
  assignment: HelperAssignment;
};

export default function HelperTripControlsCard({ assignment }: Props) {
  const token = useAppSelector((s) => s.auth.token);
  const { refetchRoster, clearAssignment } = useHelperAssignment();
  const [busyAction, setBusyAction] = useState<null | "join" | "end">(null);
  const busy = busyAction !== null;

  const busId = useMemo(() => {
    const n = Number(assignment.bus.id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [assignment.bus.id]);

  const routeId = useMemo(() => {
    const n = Number(assignment.route.id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [assignment.route.id]);

  const afterOk = useCallback(async () => {
    await refetchRoster();
  }, [refetchRoster]);

  const onJoinTrip = useCallback(async () => {
    if (!token || busId == null || routeId == null) return;
    setBusyAction("join");
    try {
      await postHelperTripJoin(token, { busId, routeId });
      await afterOk();
      Alert.alert("Joined trip", "You are registered on the active trip for this bus and route.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not join trip";
      Alert.alert("Join trip", msg);
    } finally {
      setBusyAction(null);
    }
  }, [token, busId, routeId, afterOk]);

  const onEndTrip = useCallback(() => {
    if (!token || busId == null || routeId == null) return;

    Alert.alert("End trip", "How do you want to end this trip?", [
      { text: "Keep open", style: "cancel" },
      {
        text: "Cancel trip",
        style: "destructive",
        onPress: async () => {
          setBusyAction("end");
          try {
            await postDriverTripCancel(token, { busId, routeId });
            clearAssignment();
            Alert.alert(
              "Trip cancelled",
              "Select your bus and route again for your next trip."
            );
          } catch (e) {
            const msg = e instanceof Error ? e.message : "Could not cancel the trip";
            Alert.alert("Cancel trip", msg);
          } finally {
            setBusyAction(null);
          }
        },
      },
      {
        text: "Complete trip",
        onPress: async () => {
          setBusyAction("end");
          try {
            await postDriverTripComplete(token, { busId, routeId });
            clearAssignment();
            Alert.alert(
              "Trip completed",
              "Select your bus and route again for your next trip."
            );
          } catch (e) {
            const msg = e instanceof Error ? e.message : "Could not complete the trip";
            Alert.alert("Complete trip", msg);
          } finally {
            setBusyAction(null);
          }
        },
      },
    ]);
  }, [token, busId, routeId, clearAssignment]);

  const disabled = !token || busId == null || routeId == null || busy;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Trip controls</Text>
      <Text style={styles.sub}>
        The driver must start the trip first. Then use Join to attach to the same bus and route. Use End trip when the
        run is finished (you should be joined on this trip first).
      </Text>

      <TouchableOpacity
        style={[styles.btnFull, styles.btnSecondary, styles.joinBtn, disabled && styles.btnDisabled]}
        onPress={onJoinTrip}
        disabled={disabled}
        activeOpacity={0.85}
      >
        {busyAction === "join" ? (
          <ActivityIndicator color={Theme.text} />
        ) : (
          <>
            <UserPlus size={20} color={Theme.text} />
            <Text style={styles.btnText}>Join trip</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btnFull, styles.btnOutline, disabled && styles.btnDisabled]}
        onPress={onEndTrip}
        disabled={disabled}
        activeOpacity={0.85}
      >
        {busyAction === "end" ? (
          <ActivityIndicator color={Theme.danger} />
        ) : (
          <>
            <Square size={18} color={Theme.danger} />
            <Text style={[styles.btnText, { color: Theme.danger }]}>End trip…</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.bgElevated,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: 20,
  },
  title: {
    fontSize: 13,
    fontWeight: "800",
    color: Theme.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sub: {
    fontSize: 13,
    color: Theme.textMuted,
    lineHeight: 18,
    marginBottom: 14,
  },
  btnFull: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    minHeight: 48,
  },
  joinBtn: {
    marginBottom: 10,
  },
  btnSecondary: {
    backgroundColor: Theme.bgMuted,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: Theme.borderStrong,
    backgroundColor: Theme.bg,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnText: {
    fontSize: 14,
    fontWeight: "700",
    color: Theme.text,
  },
});
