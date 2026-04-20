import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import type { TripCoords } from "../types";

interface Props {
  visible: boolean;
  onClose: () => void;
  stopCoordinate: TripCoords;
  stopName: string;
}

/** Web: maps are native-only; show copy instead of importing react-native-maps. */
export default function TripNavigationModal({ visible, onClose, stopName }: Props) {
  const insets = useSafeAreaInsets();

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
          Turn-by-turn preview runs on iOS and Android. On web, use device maps for {stopName}.
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
});
