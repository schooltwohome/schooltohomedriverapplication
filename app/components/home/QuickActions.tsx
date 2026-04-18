import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Settings, LogOut, HelpCircle, User } from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import * as Haptics from "expo-haptics";

export default function QuickActions() {
  const { logout } = useAuth();

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    logout();
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Professional Tools</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
          <View style={[styles.actionIcon, { backgroundColor: "#DBEAFE" }]}>
            <User size={22} color="#2563EB" />
          </View>
          <Text style={styles.actionLabel}>Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
          <View style={[styles.actionIcon, { backgroundColor: "#F1F5F9" }]}>
            <HelpCircle size={22} color="#64748B" />
          </View>
          <Text style={styles.actionLabel}>Support</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionItem} onPress={handleLogout} activeOpacity={0.7}>
          <View style={[styles.actionIcon, { backgroundColor: "#FEE2E2" }]}>
            <LogOut size={22} color="#EF4444" />
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
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  actionItem: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
});
