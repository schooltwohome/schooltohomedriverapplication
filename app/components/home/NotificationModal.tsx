import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import { X, Bell, Settings, Info, CheckCircle2 } from "lucide-react-native";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "info" | "success" | "alert";
}

interface NotificationModalProps {
  isVisible: boolean;
  onClose: () => void;
  notifications: Notification[];
}

export default function NotificationModal({
  isVisible,
  onClose,
  notifications,
}: NotificationModalProps) {
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
              <View style={styles.setupSection}>
                <View style={styles.setupHeader}>
                  <Settings size={16} color="#4F46E5" />
                  <Text style={styles.setupTitle}>Notification Setup</Text>
                </View>
                <Text style={styles.setupDescription}>
                  Manage how you receive alerts for bus delays and pick-ups.
                </Text>
                <TouchableOpacity style={styles.setupBtn}>
                  <Text style={styles.setupBtnText}>Configure Settings</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.notificationList}>
                <Text style={styles.sectionTitle}>Recent Updates</Text>
                {notifications.length > 0 ? (
                  notifications.map((item) => (
                    <View key={item.id} style={styles.notificationItem}>
                      <View 
                        style={[
                          styles.iconBg, 
                          item.type === "success" ? styles.successBg : styles.infoBg
                        ]}
                      >
                        {item.type === "success" ? (
                          <CheckCircle2 size={16} color="#10B981" />
                        ) : (
                          <Info size={16} color="#3B82F6" />
                        )}
                      </View>
                      <View style={styles.textContainer}>
                        <Text style={styles.notifTitle}>{item.title}</Text>
                        <Text style={styles.notifMessage}>{item.message}</Text>
                        <Text style={styles.notifTime}>{item.time}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No new notifications</Text>
                  </View>
                )}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.markAllBtn} onPress={onClose}>
              <Text style={styles.markAllText}>Mark all as read</Text>
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
  setupSection: {
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  setupHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  setupTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4F46E5",
    marginLeft: 8,
  },
  setupDescription: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 12,
  },
  setupBtn: {
    backgroundColor: "#4F46E5",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  setupBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
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
});
