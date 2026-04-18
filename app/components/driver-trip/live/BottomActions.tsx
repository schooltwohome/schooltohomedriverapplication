import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Phone, ShieldAlert, Square, ChevronRight } from "lucide-react-native";

import { Theme } from "../../../theme/theme";

interface Props {
  onEndTrip: () => void;
  onContinue: () => void;
  continueLabel: string;
  continueDisabled?: boolean;
  helperPhone?: string;
}

export default function BottomActions({
  onEndTrip,
  onContinue,
  continueLabel,
  continueDisabled,
  helperPhone,
}: Props) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 12) + 8;

  const callHelper = () => {
    if (helperPhone) {
      const url = `tel:${helperPhone.replace(/\s/g, "")}`;
      Linking.openURL(url).catch(() => {
        Alert.alert("Call helper", "Could not open the phone app.");
      });
      return;
    }
    Alert.alert(
      "Call helper",
      "Add a helper contact number in your school settings when your administrator provides one."
    );
  };

  const emergency = () => {
    Alert.alert(
      "Emergency",
      "If this is life-threatening, use your phone to call your local emergency number right away."
    );
  };

  return (
    <View style={[styles.wrap, { paddingBottom: bottomPad }]}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.actionButton} onPress={callHelper} activeOpacity={0.88}>
          <Phone size={20} color={Theme.text} />
          <Text style={styles.actionButtonText}>Call helper</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.emergencyButton} onPress={emergency} activeOpacity={0.88}>
          <ShieldAlert size={20} color={Theme.danger} />
          <Text style={styles.emergencyButtonText}>Emergency</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.continueButton, continueDisabled && styles.continueDisabled]}
          onPress={onContinue}
          disabled={continueDisabled}
          activeOpacity={0.88}
        >
          <Text
            style={[styles.continueButtonText, continueDisabled && styles.continueButtonTextDisabled]}
          >
            {continueLabel}
          </Text>
          <ChevronRight
            size={20}
            color={continueDisabled ? Theme.textMuted : Theme.text}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.endTripButton} onPress={onEndTrip} activeOpacity={0.88}>
          <Square size={20} color={Theme.bg} />
          <Text style={styles.endTripButtonText}>End trip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 52,
    backgroundColor: Theme.bg,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: Theme.border,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: Theme.text,
  },
  emergencyButton: {
    flex: 1,
    height: 52,
    backgroundColor: Theme.bg,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: Theme.danger,
  },
  emergencyButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: Theme.danger,
  },
  continueButton: {
    flex: 1,
    height: 52,
    backgroundColor: Theme.yellow,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: Theme.yellowDark,
  },
  continueDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: Theme.text,
  },
  continueButtonTextDisabled: {
    color: Theme.textMuted,
  },
  endTripButton: {
    flex: 1,
    height: 52,
    backgroundColor: Theme.text,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  endTripButtonText: {
    color: Theme.bg,
    fontSize: 14,
    fontWeight: "800",
  },
});
