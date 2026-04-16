import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Bell } from "lucide-react-native";
import NotificationModal from "./NotificationModal";

interface HomeHeaderProps {
  greeting: string;
  userName: string;
}

export default function HomeHeader({ greeting, userName }: HomeHeaderProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Mock notification count
  const notificationCount = 12;

  const mockNotifications = [
    {
      id: "1",
      title: "Bus arriving soon",
      message: "Bus B-12 is 2 stops away from your location.",
      time: "2 mins ago",
      type: "info" as const,
    },
    {
      id: "2",
      title: "Attendance Marked",
      message: "Aryan has reached the school safely.",
      time: "1 hour ago",
      type: "success" as const,
    },
    {
      id: "3",
      title: "Route Update",
      message: "Minor delay on Route 4 due to traffic congestion.",
      time: "2 hours ago",
      type: "alert" as const,
    },
  ];

  const displayCount = notificationCount > 9 ? "9+" : notificationCount.toString();

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.subGreeting}>{userName}</Text>
      </View>
      <TouchableOpacity 
        style={styles.notificationBtn}
        onPress={() => setIsModalVisible(true)}
      >
        <Bell size={24} color="#0F172A" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} />
        {notificationCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{displayCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <NotificationModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        notifications={mockNotifications}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  subGreeting: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 4,
  },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
});
