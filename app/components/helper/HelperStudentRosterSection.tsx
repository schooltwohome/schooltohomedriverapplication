import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { Theme } from "../../theme/theme";
import { HelperStudentRow } from "./rosterTypes";
import HelperStudentRosterRow from "./HelperStudentRosterRow";

interface Props {
  title: string;
  subtitle?: string;
  students: HelperStudentRow[];
  emptyHint?: string;
}

export default function HelperStudentRosterSection({
  title,
  subtitle,
  students,
  emptyHint = "No students loaded for this route.",
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.card}>
        {students.length === 0 ? (
          <Text style={styles.empty}>{emptyHint}</Text>
        ) : (
          students.map((s, index) => (
            <HelperStudentRosterRow
              key={s.id}
              student={s}
              isLast={index === students.length - 1}
            />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 20,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: Theme.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Theme.textSecondary,
    lineHeight: 20,
  },
  card: {
    backgroundColor: Theme.bg,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Theme.border,
    paddingHorizontal: 12,
    paddingTop: 4,
    overflow: "hidden",
  },
  empty: {
    paddingVertical: 24,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: Theme.textMuted,
  },
});
