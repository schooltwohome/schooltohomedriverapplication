import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Theme } from "../../_theme/theme";
import SelectBusStep from "../driver-trip/SelectBusStep";
import SelectRouteStep from "../driver-trip/SelectRouteStep";
import { BusItem, RouteItem } from "../driver-trip/types";
import { useTripSetupLists } from "../../hooks/useTripSetupLists";
import { useAppSelector } from "../../../store/hooks";
import { postHelperTripJoin } from "../../../services/driverHelperApi";

const TOTAL_STEPS = 2;

interface Props {
  onComplete: (bus: BusItem, route: RouteItem) => void;
}

export default function HelperAssignmentWizard({ onComplete }: Props) {
  const insets = useSafeAreaInsets();
  const token = useAppSelector((s) => s.auth.token);
  const { buses, routes, loading: listsLoading, error: listsError, reload: reloadLists } =
    useTripSetupLists();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedBus, setSelectedBus] = useState<BusItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleBusNext = (bus: BusItem) => {
    setSelectedBus(bus);
    setStep(2);
  };

  const handleRouteNext = async (route: RouteItem) => {
    if (!selectedBus) return;
    const busId = selectedBus?.id != null ? Number(selectedBus.id) : NaN;
    const routeId = route?.id != null ? Number(route.id) : NaN;
    if (!token || !Number.isFinite(busId) || !Number.isFinite(routeId)) {
      Alert.alert(
        "Could not save assignment",
        "Please sign in again and try selecting the bus and route."
      );
      return;
    }

    setSubmitting(true);
    try {
      await postHelperTripJoin(token, { busId, routeId });
      onComplete(selectedBus, route);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not join this bus";
      Alert.alert(
        "Bus already selected",
        `${msg}\n\nAnother helper may have already selected this bus. Please choose a different bus.`
      );
      await reloadLists();
      setSelectedBus(null);
      setStep(1);
    } finally {
      setSubmitting(false);
    }
  };

  const stepHint = step === 1 ? "Bus first, then route" : "Almost done";

  return (
    <View
      style={[
        styles.screen,
        {
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <View style={styles.stepPanel}>
        <View style={styles.stepPanelInner}>
          <View style={styles.stepTopRow}>
            <View style={styles.stepTopSide}>
              {step === 2 ? (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setStep(1)}
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <ArrowLeft size={22} color={Theme.text} />
                </TouchableOpacity>
              ) : (
                <View style={styles.stepTopSideSpacer} />
              )}
            </View>

            <View style={styles.stepCenter}>
              <Text style={styles.stepKicker}>Setup</Text>
              <Text style={styles.stepTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                Step {step} of {TOTAL_STEPS}
              </Text>
              <Text style={styles.stepSubtitle}>{stepHint}</Text>

              <View style={styles.progressTrack}>
                {[1, 2].map((n) => {
                  const done = n < step;
                  const current = n === step;
                  return (
                    <View
                      key={n}
                      style={[
                        styles.progressSegment,
                        done && styles.progressSegmentDone,
                        current && styles.progressSegmentCurrent,
                      ]}
                    />
                  );
                })}
              </View>
            </View>

            <View style={styles.stepTopSide}>
              <View style={styles.stepTopSideSpacer} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {step === 1 && (
          <SelectBusStep
            hideStepLabel
            buses={buses}
            loading={listsLoading}
            error={listsError}
            onRetry={reloadLists}
            onNext={handleBusNext}
          />
        )}
        {step === 2 && (
          <SelectRouteStep
            hideStepLabel
            selectedBus={selectedBus}
            routes={routes}
            loading={listsLoading || submitting}
            error={listsError}
            onRetry={reloadLists}
            onNext={handleRouteNext}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Theme.bg,
    paddingHorizontal: 20,
    paddingTop: 8,
    minHeight: 0,
  },
  stepPanel: {
    marginBottom: 8,
  },
  stepPanelInner: {
    backgroundColor: Theme.yellowSurface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Theme.yellow,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  stepTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepTopSide: {
    width: 48,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  stepTopSideSpacer: {
    width: 44,
    height: 44,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.bg,
    borderWidth: 1.5,
    borderColor: Theme.yellow,
    justifyContent: "center",
    alignItems: "center",
  },
  stepCenter: {
    flex: 1,
    alignItems: "center",
    minWidth: 0,
  },
  stepKicker: {
    fontSize: 11,
    fontWeight: "900",
    color: Theme.yellowDark,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: Theme.text,
    letterSpacing: -0.5,
    textAlign: "center",
    width: "100%",
  },
  stepSubtitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: Theme.textSecondary,
    textAlign: "center",
  },
  progressTrack: {
    flexDirection: "row",
    width: "100%",
    marginTop: 16,
    gap: 10,
    paddingHorizontal: 4,
  },
  progressSegment: {
    flex: 1,
    height: 10,
    borderRadius: 6,
    backgroundColor: Theme.border,
  },
  progressSegmentDone: {
    backgroundColor: Theme.yellow,
  },
  progressSegmentCurrent: {
    backgroundColor: Theme.yellowDark,
    shadowColor: Theme.yellowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    minHeight: 0,
  },
});
