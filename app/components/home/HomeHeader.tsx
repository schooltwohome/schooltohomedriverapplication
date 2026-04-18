import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Bell } from "lucide-react-native";
import { UserRole } from "../../context/AuthContext";
import { Theme } from "../../theme/theme";
import NotificationModal from "./NotificationModal";

interface HomeHeaderProps {
  greeting: string;
  userName: string;
  role?: UserRole;
}

export default function HomeHeader({ greeting, userName, role }: HomeHeaderProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);

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
      <View style={styles.accentBar} />

      <View style={styles.headerInner}>
        <View style={styles.titleBlock}>
          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>{greeting}</Text>
            {role ? (
              <View
                style={[
                  styles.roleChip,
                  role === "driver" ? styles.roleChipDriver : styles.roleChipHelper,
                ]}
              >
                <Text style={styles.roleChipText}>
                  {role === "driver" ? "Driver" : "Helper"}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.subGreeting}>{userName}</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.85}
        >
          <Bell size={22} color={Theme.text} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Theme.bg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  accentBar: {
    height: 3,
    backgroundColor: Theme.yellow,
    width: "100%",
  },
  headerInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  titleBlock: {
    flex: 1,
    marginRight: 12,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  greeting: {
    fontSize: 14,
    color: Theme.textSecondary,
    fontWeight: "600",
  },
  roleChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  roleChipDriver: {
    backgroundColor: Theme.yellowSoft,
    borderColor: Theme.yellow,
  },
  roleChipHelper: {
    backgroundColor: Theme.bgMuted,
    borderColor: Theme.border,
  },
  roleChipText: {
    fontSize: 11,
    fontWeight: "800",
    color: Theme.text,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  subGreeting: {
    fontSize: 19,
    fontWeight: "800",
    color: Theme.text,
    marginTop: 6,
    lineHeight: 26,
  },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Theme.bg,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Theme.yellow,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Theme.danger,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Theme.bg,
  },
  badgeText: {
    color: Theme.bg,
    fontSize: 10,
    fontWeight: "800",
  },
});
