import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { X, Bell, Info, CheckCircle2, AlertTriangle } from "lucide-react-native";
import type { UiNotification } from "../../hooks/useMyNotifications";

interface NotificationModalProps {
  isVisible: boolean;
  onClose: () => void;
  notifications: UiNotification[];
  loading?: boolean;
  onMarkAllRead?: () => void | Promise<void>;
}

export default function NotificationModal({
  isVisible,
  onClose,
  notifications,
  loading = false,
  onMarkAllRead,
}: NotificationModalProps) {
  const handleMarkAll = () => {
    void onMarkAllRead?.();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.centeredView}>
          <Pressable style={styles.modalView}>
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Bell size={20} color="#0F172A" />
                <Text style={styles.titleText}>Notifications</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.scrollContent}
            >
              <Text style={styles.hintText}>
                Messages from your school about routes, trips, and alerts.
              </Text>

              {loading ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="small" color="#4F46E5" />
                  <Text style={styles.loadingText}>Loading…</Text>
                </View>
              ) : null}

              <View style={styles.notificationList}>
                <Text style={styles.sectionTitle}>Recent</Text>
                {notifications.length > 0 ? (
                  notifications.map((item) => (
                    <View
                      key={item.id}
                      style={[
                        styles.notificationItem,
                        item.isRead && styles.notificationItemRead,
                      ]}
                    >
                      <View
                        style={[
                          styles.iconBg,
                          item.kind === "success"
                            ? styles.successBg
                            : item.kind === "alert"
                              ? styles.alertBg
                              : styles.infoBg,
                        ]}
                      >
                        {item.kind === "success" ? (
                          <CheckCircle2 size={16} color="#10B981" />
                        ) : item.kind === "alert" ? (
                          <AlertTriangle size={16} color="#F59E0B" />
                        ) : (
                          <Info size={16} color="#3B82F6" />
                        )}
                      </View>
                      <View style={styles.textContainer}>
                        <Text style={styles.notifTitle}>{item.title}</Text>
                        <Text style={styles.notifMessage}>{item.message}</Text>
                        <Text style={styles.notifTime}>{item.timeLabel}</Text>
                      </View>
                    </View>
                  ))
                ) : !loading ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No notifications yet</Text>
                  </View>
                ) : null}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.markAllBtn}
              onPress={handleMarkAll}
              disabled={loading || notifications.length === 0}
            >
              <Text
                style={[
                  styles.markAllText,
                  (loading || notifications.length === 0) && styles.markAllTextDisabled,
                ]}
              >
                Mark all as read
              </Text>
            </TouchableOpacity>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  centeredView: {
    width: "100%",
    maxWidth: 400,
  },
  modalView: {
    backgroundColor: "#F8FAFC",
    borderRadius: 24,
    width: "100%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginLeft: 10,
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
  },
  hintText: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 16,
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748B",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 16,
  },
  notificationList: {
    marginBottom: 10,
  },
  notificationItem: {
    flexDirection: "row",
    marginBottom: 20,
    opacity: 1,
  },
  notificationItemRead: {
    opacity: 0.72,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  successBg: {
    backgroundColor: "#ECFDF5",
  },
  infoBg: {
    backgroundColor: "#EFF6FF",
  },
  alertBg: {
    backgroundColor: "#FFFBEB",
  },
  textContainer: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2,
  },
  notifMessage: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 6,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
  },
  markAllBtn: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  markAllText: {
    color: "#4F46E5",
    fontWeight: "600",
    fontSize: 14,
  },
  markAllTextDisabled: {
    color: "#94A3B8",
  },
});
