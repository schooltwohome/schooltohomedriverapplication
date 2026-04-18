import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { ArrowLeft } from "lucide-react-native";

import { Theme } from "../../theme/theme";
import { TripData } from "./types";
import SelectBusStep from "./SelectBusStep";
import SelectRouteStep from "./SelectRouteStep";
import ScheduleTripStep from "./ScheduleTripStep";
import TripConfirmationStep from "./TripConfirmationStep";

interface Props {
  onComplete: (data: TripData) => void | Promise<void>;
}

const TOTAL_STEPS = 4;

export default function TripSetupWizard({ onComplete }: Props) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [tripData, setTripData] = useState<TripData>({
    bus: null,
    route: null,
    schedule: null,
  });

  const handleNextStep = () => {
    if (step < TOTAL_STEPS) setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.topBarSide}>
          {step > 1 ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handlePrevStep}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={22} color={Theme.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.topBarSideSpacer} />
          )}
        </View>

        <View style={styles.progressBlock}>
          <Text style={styles.progressLabel}>
            Step {step} of {TOTAL_STEPS}
          </Text>
          <View style={styles.progressTrack}>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => {
              const n = i + 1;
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

        <View style={styles.topBarSide}>
          <View style={styles.topBarSideSpacer} />
        </View>
      </View>

      <View style={styles.content}>
        {step === 1 && (
          <SelectBusStep
            onNext={(bus) => {
              setTripData({ ...tripData, bus });
              handleNextStep();
            }}
          />
        )}

        {step === 2 && (
          <SelectRouteStep
            selectedBus={tripData.bus}
            onNext={(route) => {
              setTripData({ ...tripData, route });
              handleNextStep();
            }}
          />
        )}

        {step === 3 && (
          <ScheduleTripStep
            selectedBus={tripData.bus}
            selectedRoute={tripData.route}
            onNext={(schedule) => {
              setTripData({ ...tripData, schedule });
              handleNextStep();
            }}
          />
        )}

        {step === 4 && (
          <TripConfirmationStep
            tripData={tripData}
            onEdit={() => setStep(1)}
            onStartTrip={() => onComplete(tripData)}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 4,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    minHeight: 48,
  },
  topBarSide: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  topBarSideSpacer: {
    width: 44,
    height: 44,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.yellowSoft,
    borderWidth: 1,
    borderColor: Theme.yellow,
    justifyContent: "center",
    alignItems: "center",
  },
  progressBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: Theme.textSecondary,
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  progressTrack: {
    flexDirection: "row",
    width: "100%",
    maxWidth: 220,
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 5,
    borderRadius: 4,
    backgroundColor: Theme.border,
  },
  progressSegmentDone: {
    backgroundColor: Theme.yellow,
  },
  progressSegmentCurrent: {
    backgroundColor: Theme.yellowDark,
  },
  content: {
    flex: 1,
  },
});
