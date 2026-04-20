import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Navigation, X } from "lucide-react-native";
import type { TripCoords } from "../types";

interface Props {
  visible: boolean;
  onClose: () => void;
  stopCoordinate: TripCoords;
  stopName: string;
}

/** Web: maps are native-only; show copy instead of importing react-native-maps. */
export default function TripNavigationModal({ visible, onClose, stopName, stopCoordinate }: Props) {
  const insets = useSafeAreaInsets();
  const dest = `${stopCoordinate.latitude},${stopCoordinate.longitude}`;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}&travelmode=driving`;

  const open = () => {
    Linking.openURL(url).catch(() => {
      Alert.alert("Navigation", "Could not open Google Maps in this browser.");
    });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.webFallback, { paddingTop: insets.top + 12, paddingHorizontal: 20 }]}>
        <TouchableOpacity
          style={[styles.closeBtn, { top: insets.top + 8 }]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close map"
        >
          <X size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.webTitle}>Navigation map</Text>
        <Text style={styles.webBody}>
          Turn-by-turn navigation runs on iOS and Android. On web, open Google Maps directions for {stopName}.
        </Text>
        <TouchableOpacity style={styles.openBtn} onPress={open} activeOpacity={0.88}>
          <Navigation size={18} color="#0F172A" />
          <Text style={styles.openBtnText}>Open Google Maps</Text>
        </TouchableOpacity>
        <Text style={styles.linkHint} numberOfLines={2}>
          {url}
        </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  webFallback: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: 56,
  },
  closeBtn: {
    position: "absolute",
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  webTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  webBody: {
    fontSize: 16,
    color: "#475569",
    lineHeight: 24,
  },
  openBtn: {
    marginTop: 18,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FDE047",
    borderWidth: 1.5,
    borderColor: "#F59E0B",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  openBtnText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },
  linkHint: {
    marginTop: 12,
    fontSize: 12,
    color: "#64748B",
  },
});
