import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { User, CheckCircle2, XCircle } from "lucide-react-native";

interface ChildStatusCardProps {
  name: string;
  className: string;
  isOnBus: boolean;
}

export default function ChildStatusCard({ 
  name, 
  className, 
  isOnBus 
}: ChildStatusCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.container}>
        <View style={[styles.avatarContainer, { backgroundColor: isOnBus ? "#ECFDF5" : "#F1F5F9" }]}>
          <User size={24} color={isOnBus ? "#10B981" : "#64748B"} />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.nameText}>{name}</Text>
          <Text style={styles.classText}>{className}</Text>
        </View>

        <View style={[
          styles.statusBadge, 
          { backgroundColor: isOnBus ? "#D1FAE5" : "#FEE2E2" }
        ]}>
          <Text style={[
            styles.statusText, 
            { color: isOnBus ? "#065F46" : "#991B1B" }
          ]}>
            {isOnBus ? "On Bus" : "Not on Bus"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  classText: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
