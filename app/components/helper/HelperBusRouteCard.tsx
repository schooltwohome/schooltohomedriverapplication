import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Bus, MapPin, Users } from "lucide-react-native";
import { HelperAssignment } from "../../context/HelperAssignmentContext";

interface Props {
  assignment: HelperAssignment;
}

export default function HelperBusRouteCard({ assignment }: Props) {
  const { bus, route } = assignment;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Today&apos;s assignment</Text>

      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Bus size={22} color="#0284C7" />
        </View>
        <View style={styles.textCol}>
          <Text style={styles.label}>Bus</Text>
          <Text style={styles.value}>{bus.name}</Text>
          <Text style={styles.muted}>{bus.licensePlate}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={[styles.iconBox, styles.iconBoxTeal]}>
          <MapPin size={22} color="#0D9488" />
        </View>
        <View style={styles.textCol}>
          <Text style={styles.label}>Route</Text>
          <Text style={styles.value}>{route.name}</Text>
          <Text style={styles.muted}>
            {route.stopsCount} stops · {route.duration}
          </Text>
        </View>
      </View>

      <View style={styles.studentBanner}>
        <Users size={18} color="#0F172A" />
        <Text style={styles.studentBannerText}>
          <Text style={styles.studentCount}>{route.studentsCount}</Text>
          {" students on this bus"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  iconBoxTeal: {
    backgroundColor: "#CCFBF1",
  },
  textCol: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 4,
  },
  value: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  muted: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 16,
  },
  studentBanner: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  studentBannerText: {
    fontSize: 15,
    color: "#475569",
    fontWeight: "600",
    flex: 1,
  },
  studentCount: {
    fontWeight: "900",
    color: "#0F172A",
  },
});
