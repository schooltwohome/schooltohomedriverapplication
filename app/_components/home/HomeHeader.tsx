import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Bell, LogOut } from "lucide-react-native";
import type { UserRole } from "../../types/roles";
import { Theme } from "../../_theme/theme";
import NotificationModal from "./NotificationModal";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { logoutThunk } from "../../../store/slices/authSlice";
import { useMyNotifications } from "../../hooks/useMyNotifications";

interface HomeHeaderProps {
  greeting: string;
  userName: string;
  role?: UserRole;
}

export default function HomeHeader({ greeting, userName, role }: HomeHeaderProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const token = useAppSelector((s) => s.auth.token);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { items, loading, unreadCount, refresh, markAllRead } =
    useMyNotifications(token);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (isModalVisible) {
      void refresh();
    }
  }, [isModalVisible, refresh]);

  const handleSignOut = () => {
    Alert.alert(
      "Sign out",
      "You will return to the sign-in screen. You can use Sign up there if your school gave you a registration link.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: async () => {
            await dispatch(logoutThunk());
            router.replace("/screens/Auth/LoginScreen");
          },
        },
      ]
    );
  };

  const displayCount = unreadCount > 9 ? "9+" : unreadCount.toString();

  const showSignOut = role === "driver" || role === "helper";

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
        <View style={styles.headerActions}>
          {showSignOut ? (
            <TouchableOpacity
              style={styles.signOutBtn}
              onPress={handleSignOut}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
            >
              <LogOut size={20} color={Theme.text} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => setIsModalVisible(true)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Bell size={22} color={Theme.text} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{displayCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <NotificationModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        notifications={items}
        loading={loading}
        onMarkAllRead={markAllRead}
      />
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  signOutBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Theme.bgMuted,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Theme.border,
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
