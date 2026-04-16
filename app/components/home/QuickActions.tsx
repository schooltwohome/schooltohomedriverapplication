import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Home as HomeIcon, Settings, LogOut } from "lucide-react-native";

interface QuickActionsProps {
  onLogout: () => void;
}

export default function QuickActions({ onLogout }: QuickActionsProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
          <View style={[styles.actionIcon, { backgroundColor: "#DBEAFE" }]}>
            <HomeIcon size={24} color="#2563EB" />
          </View>
          <Text style={styles.actionLabel}>Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
          <View style={[styles.actionIcon, { backgroundColor: "#F1F5F9" }]}>
            <Settings size={24} color="#64748B" />
          </View>
          <Text style={styles.actionLabel}>Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem} onPress={onLogout} activeOpacity={0.7}>
          <View style={[styles.actionIcon, { backgroundColor: "#FEE2E2" }]}>
            <LogOut size={24} color="#EF4444" />
          </View>
          <Text style={styles.actionLabel}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  actionItem: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
});
