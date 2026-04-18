import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LucideIcon } from "lucide-react-native";

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
}

export default function HelperProfileInfoRow({ icon: Icon, label, value }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Icon size={20} color="#0F172A" />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
});
