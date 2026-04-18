import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Radio, PenLine, ChevronRight } from "lucide-react-native";

interface Props {
  onRfidPress?: () => void;
  onManualPress?: () => void;
}

export default function HelperQuickActions({ onRfidPress, onManualPress }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick actions</Text>
      <Text style={styles.sectionSubtitle}>
        Prefer RFID scan; use manual entry only when a card fails.
      </Text>

      <TouchableOpacity
        style={[styles.action, styles.actionPrimary]}
        activeOpacity={0.85}
        onPress={onRfidPress}
      >
        <View style={[styles.actionIcon, styles.actionIconPrimary]}>
          <Radio size={22} color="#FFFFFF" />
        </View>
        <View style={styles.actionText}>
          <Text style={styles.actionTitle}>RFID attendance</Text>
          <Text style={styles.actionDescLight}>Tap or scan student RFID to mark present</Text>
        </View>
        <ChevronRight size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.action}
        activeOpacity={0.85}
        onPress={onManualPress}
      >
        <View style={[styles.actionIcon, styles.actionIconMuted]}>
          <PenLine size={22} color="#0F172A" />
        </View>
        <View style={styles.actionText}>
          <Text style={[styles.actionTitle, styles.actionTitleDark]}>Manual attendance</Text>
          <Text style={styles.actionDescMuted}>Fallback — pick a student from the list</Text>
        </View>
        <ChevronRight size={20} color="#94A3B8" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 16,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  actionPrimary: {
    backgroundColor: "#14B8A6",
    borderColor: "#14B8A6",
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  actionIconPrimary: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  actionIconMuted: {
    backgroundColor: "#F1F5F9",
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  actionTitleDark: {
    color: "#0F172A",
  },
  actionDescLight: {
    fontSize: 13,
    color: "rgba(255,255,255,0.92)",
    fontWeight: "600",
  },
  actionDescMuted: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
});
