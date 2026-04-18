import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Check, Minus, X } from "lucide-react-native";

import { Theme } from "../../theme/theme";
import { HelperStudentRow } from "./rosterTypes";

interface Props {
  student: HelperStudentRow;
  compact?: boolean;
  isLast?: boolean;
}

function StatusBadge({ status }: { status: HelperStudentRow["status"] }) {
  const cfg =
    status === "present"
      ? {
          Icon: Check,
          label: "Present",
          bg: "#DCFCE7",
          border: "#86EFAC",
          fg: Theme.success,
        }
      : status === "absent"
        ? {
            Icon: X,
            label: "Absent",
            bg: "#FEE2E2",
            border: "#FECACA",
            fg: Theme.danger,
          }
        : {
            Icon: Minus,
            label: "Pending",
            bg: Theme.yellowSoft,
            border: Theme.yellow,
            fg: Theme.yellowDark,
          };

  const Icon = cfg.Icon;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Icon size={14} color={cfg.fg} strokeWidth={2.5} />
      <Text style={[styles.badgeText, { color: cfg.fg }]}>{cfg.label}</Text>
    </View>
  );
}

export default function HelperStudentRosterRow({ student, compact, isLast }: Props) {
  return (
    <View style={[styles.row, compact && styles.rowCompact, isLast && styles.rowLast]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{student.name.charAt(0)}</Text>
      </View>
      <View style={styles.main}>
        <Text style={styles.name} numberOfLines={1}>
          {student.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {student.grade} · {student.stopName}
        </Text>
      </View>
      <StatusBadge status={student.status} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  rowCompact: {
    paddingVertical: 10,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Theme.yellowSoft,
    borderWidth: 1,
    borderColor: Theme.yellow,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "900",
    color: Theme.text,
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    fontWeight: "800",
    color: Theme.text,
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
    fontWeight: "600",
    color: Theme.textSecondary,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
});
