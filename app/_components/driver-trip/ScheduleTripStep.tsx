import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Bus, Map, Calendar, Clock, ChevronRight, ChevronUp, ChevronDown } from "lucide-react-native";
import { Theme } from "../../_theme/theme";
import { BusItem, RouteItem, ScheduleItem } from "./types";

interface Props {
  selectedBus: BusItem | null;
  selectedRoute: RouteItem | null;
  onNext: (schedule: ScheduleItem) => void;
}

function formatTripDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatTripDateLong(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function clampHour12(n: number): number {
  if (n < 1) return 12;
  if (n > 12) return 1;
  return n;
}

function clampMinuteStep(n: number): number {
  const stepped = Math.round(n / 5) * 5;
  if (stepped < 0) return 55;
  if (stepped > 55) return 0;
  return stepped;
}

export default function ScheduleTripStep({ selectedBus, selectedRoute, onNext }: Props) {
  const [tripDate, setTripDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [hour, setHour] = useState("07");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const [dateSheetVisible, setDateSheetVisible] = useState(false);
  const [draftTripDate, setDraftTripDate] = useState(tripDate);

  const dateLabel = useMemo(() => formatTripDate(tripDate), [tripDate]);
  const dateLongLabel = useMemo(() => formatTripDateLong(tripDate), [tripDate]);

  const openDatePicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: tripDate,
        mode: "date",
        minimumDate: new Date(2024, 0, 1),
        maximumDate: new Date(2035, 11, 31),
        onChange: (event, selected) => {
          if (event.type === "set" && selected) setTripDate(selected);
        },
      });
      return;
    }
    setDraftTripDate(tripDate);
    setDateSheetVisible(true);
  };

  const adjustHour = (delta: number) => {
    const n = clampHour12(parseInt(hour, 10) + delta);
    setHour(String(n).padStart(2, "0"));
  };

  const adjustMinute = (delta: number) => {
    const current = parseInt(minute, 10);
    const next = clampMinuteStep(current + delta * 5);
    setMinute(String(next).padStart(2, "0"));
  };

  const handleContinue = () => {
    onNext({
      date: dateLabel,
      hour,
      minute,
      period,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepText}>Step 3 of 4</Text>
        <Text style={styles.title}>Schedule Trip</Text>

        <View style={styles.summaryContainer}>
          {selectedBus && (
            <View style={styles.summaryItem}>
              <View style={styles.summaryLabelRow}>
                <Bus size={14} color={Theme.textMuted} />
                <Text style={styles.summaryLabelText}>Bus</Text>
              </View>
              <Text style={styles.summaryValueText}>{selectedBus.name}</Text>
            </View>
          )}
          {selectedRoute && (
            <View style={styles.summaryItem}>
              <View style={styles.summaryLabelRow}>
                <Map size={14} color={Theme.textMuted} />
                <Text style={styles.summaryLabelText}>Route</Text>
              </View>
              <Text style={styles.summaryValueText}>{selectedRoute.name}</Text>
            </View>
          )}
        </View>

        <Text style={styles.subtitle}>Set the start time for your trip</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.formContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Trip Date</Text>
          <Text style={styles.sectionSubtitle}>Select the date for this trip</Text>

          <TouchableOpacity
            style={styles.inputContainer}
            onPress={openDatePicker}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Choose trip date"
          >
            <Calendar size={20} color={Theme.yellowDark} />
            <View style={styles.dateTextBlock}>
              <Text style={styles.inputText}>{dateLabel}</Text>
              <Text style={styles.dateSubText}>{dateLongLabel}</Text>
            </View>
            <ChevronRight size={20} color={Theme.textMuted} style={styles.chevronEnd} />
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Start Time</Text>
          <Text style={styles.sectionSubtitle}>When will the trip begin?</Text>

          <View style={styles.timeSelectionRow}>
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>Hour</Text>
              <View style={styles.timeStepper}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => adjustHour(1)}
                  accessibilityRole="button"
                  accessibilityLabel="Increase hour"
                >
                  <ChevronUp size={18} color={Theme.text} />
                </TouchableOpacity>
                <View style={styles.timeInput}>
                  <Clock size={16} color={Theme.textMuted} />
                  <Text style={styles.timeValueText}>{hour}</Text>
                </View>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => adjustHour(-1)}
                  accessibilityRole="button"
                  accessibilityLabel="Decrease hour"
                >
                  <ChevronDown size={18} color={Theme.text} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.timeColon}>:</Text>

            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>Min</Text>
              <View style={styles.timeStepper}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => adjustMinute(1)}
                  accessibilityRole="button"
                  accessibilityLabel="Increase minutes"
                >
                  <ChevronUp size={18} color={Theme.text} />
                </TouchableOpacity>
                <View style={styles.timeInput}>
                  <Text style={styles.timeValueText}>{minute}</Text>
                </View>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => adjustMinute(-1)}
                  accessibilityRole="button"
                  accessibilityLabel="Decrease minutes"
                >
                  <ChevronDown size={18} color={Theme.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.periodBlock}>
              <Text style={styles.timeLabel}>Period</Text>
              <View style={styles.periodToggle}>
                <TouchableOpacity
                  style={[styles.periodButton, period === "AM" && styles.periodButtonActive]}
                  onPress={() => setPeriod("AM")}
                >
                  <Text style={[styles.periodButtonText, period === "AM" && styles.periodButtonTextActive]}>
                    AM
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.periodButton, period === "PM" && styles.periodButtonActive]}
                  onPress={() => setPeriod("PM")}
                >
                  <Text style={[styles.periodButtonText, period === "PM" && styles.periodButtonTextActive]}>
                    PM
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.selectedTimePreview}>
          <Text style={styles.previewText}>
            Trip: <Text style={styles.previewTextBold}>{dateLongLabel}</Text>
          </Text>
          <Text style={[styles.previewText, { marginTop: 6 }]}>
            Start: <Text style={styles.previewTextBold}>{hour}:{minute} {period}</Text>
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleContinue} activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>

      {Platform.OS !== "android" && (
        <Modal visible={dateSheetVisible} animationType="slide" transparent>
          <Pressable style={styles.modalBackdrop} onPress={() => setDateSheetVisible(false)}>
            <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setDateSheetVisible(false)}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Trip date</Text>
                <TouchableOpacity
                  onPress={() => {
                    setTripDate(draftTripDate);
                    setDateSheetVisible(false);
                  }}
                >
                  <Text style={styles.modalDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={draftTripDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                themeVariant="light"
                minimumDate={new Date(2024, 0, 1)}
                maximumDate={new Date(2035, 11, 31)}
                onChange={(_e, d) => {
                  if (d) setDraftTripDate(d);
                }}
                style={styles.iosPicker}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
  },
  stepText: {
    fontSize: 14,
    fontWeight: "800",
    color: Theme.yellowDark,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Theme.text,
    marginBottom: 16,
  },
  summaryContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: Theme.yellowSoft,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Theme.yellow,
  },
  summaryLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  summaryLabelText: {
    fontSize: 12,
    fontWeight: "600",
    color: Theme.textSecondary,
  },
  summaryValueText: {
    fontSize: 14,
    fontWeight: "800",
    color: Theme.text,
  },
  subtitle: {
    fontSize: 15,
    color: Theme.textSecondary,
    lineHeight: 22,
  },
  formContainer: {
    paddingBottom: 24,
  },
  formSection: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Theme.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Theme.textSecondary,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.bg,
    borderWidth: 1.5,
    borderColor: Theme.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  dateTextBlock: {
    flex: 1,
  },
  inputText: {
    fontSize: 16,
    fontWeight: "800",
    color: Theme.text,
  },
  dateSubText: {
    fontSize: 13,
    fontWeight: "500",
    color: Theme.textSecondary,
    marginTop: 2,
  },
  chevronEnd: {
    marginLeft: "auto",
  },
  timeSelectionRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  timeBlock: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Theme.textSecondary,
    marginBottom: 8,
  },
  timeStepper: {
    alignItems: "center",
    gap: 4,
  },
  stepperBtn: {
    width: "100%",
    height: 32,
    borderRadius: 10,
    backgroundColor: Theme.yellowSoft,
    borderWidth: 1,
    borderColor: Theme.yellow,
    justifyContent: "center",
    alignItems: "center",
  },
  timeInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.bg,
    borderWidth: 1.5,
    borderColor: Theme.border,
    borderRadius: 14,
    height: 52,
    width: "100%",
    gap: 8,
  },
  timeValueText: {
    fontSize: 20,
    fontWeight: "800",
    color: Theme.text,
  },
  timeColon: {
    fontSize: 22,
    fontWeight: "700",
    color: Theme.textMuted,
    marginBottom: 18,
    paddingHorizontal: 2,
  },
  periodBlock: {
    flex: 1.35,
  },
  periodToggle: {
    flexDirection: "row",
    backgroundColor: Theme.bgMuted,
    borderRadius: 16,
    height: 60,
    padding: 4,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  periodButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  periodButtonActive: {
    backgroundColor: Theme.yellowSoft,
    borderWidth: 1,
    borderColor: Theme.yellow,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Theme.textMuted,
  },
  periodButtonTextActive: {
    color: Theme.text,
    fontWeight: "800",
  },
  selectedTimePreview: {
    backgroundColor: Theme.yellowSurface,
    borderWidth: 1.5,
    borderColor: Theme.yellow,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  previewText: {
    fontSize: 15,
    color: Theme.text,
    textAlign: "center",
  },
  previewTextBold: {
    fontWeight: "700",
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Theme.border,
  },
  primaryButton: {
    backgroundColor: Theme.yellow,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Theme.yellowDark,
  },
  primaryButtonText: {
    color: Theme.text,
    fontSize: 16,
    fontWeight: "800",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: Theme.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Theme.text,
  },
  modalCancel: {
    fontSize: 16,
    fontWeight: "600",
    color: Theme.textSecondary,
  },
  modalDone: {
    fontSize: 16,
    fontWeight: "800",
    color: Theme.yellowDark,
  },
  iosPicker: {
    alignSelf: "stretch",
    height: Platform.OS === "ios" ? 216 : 200,
  },
});
