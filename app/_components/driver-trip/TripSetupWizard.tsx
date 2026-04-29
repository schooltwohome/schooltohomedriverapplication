import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, AppState, View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { ArrowLeft } from "lucide-react-native";

import { Theme } from "../../_theme/theme";
import { TripData } from "./types";
import SelectBusStep from "./SelectBusStep";
import SelectRouteStep from "./SelectRouteStep";
import ScheduleTripStep from "./ScheduleTripStep";
import TripConfirmationStep from "./TripConfirmationStep";
import { useTripSetupLists } from "../../hooks/useTripSetupLists";
import { useAppSelector } from "../../../store/hooks";
import { normalizeRole } from "../../types/roles";
import { getMyActiveTrip, postDriverTripCancel } from "../../../services/driverHelperApi";

interface Props {
  onComplete: (data: TripData) => void | Promise<void>;
  /** Server-side bus/route assignment: skip pickers and start at schedule. */
  prefill?: Partial<TripData> | null;
  /** When a driver has an existing active trip, allow navigating into the live trip UI. */
  onResumeActiveTrip?: (data: TripData) => void;
}

const TOTAL_STEPS = 4;

export default function TripSetupWizard({ onComplete, prefill, onResumeActiveTrip }: Props) {
  const me = useAppSelector((s) => s.auth.me);
  const role = normalizeRole(me?.user?.role);
  const token = useAppSelector((s) => s.auth.token);
  const { buses, routes, loading: listsLoading, error: listsError, reload: reloadLists } =
    useTripSetupLists();
  const hasPrefill = Boolean(prefill?.bus && prefill?.route);
  const isDriver = role === "driver";

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void reloadLists();
    });
    return () => sub.remove();
  }, [reloadLists]);

  useEffect(() => {
    if (step === 2) void reloadLists();
  }, [step, reloadLists]);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(hasPrefill ? 3 : 1);
  const [tripData, setTripData] = useState<TripData>(() => ({
    bus: prefill?.bus ?? null,
    route: prefill?.route ?? null,
    schedule: prefill?.schedule ?? null,
  }));

  const [activeTrip, setActiveTrip] = useState<{
    tripId: string;
    status: string;
    busLabel: string;
    routeLabel: string;
    busId?: number;
    routeId?: number;
  } | null>(null);
  const [activeTripLoading, setActiveTripLoading] = useState(false);
  const [abortLoading, setAbortLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);

  const loadMyActiveTrip = useCallback(async () => {
    if (!isDriver || !token) {
      setActiveTrip(null);
      return;
    }
    setActiveTripLoading(true);
    try {
      const res = await getMyActiveTrip(token);
      if (!res?.trip) {
        setActiveTrip(null);
        return;
      }
      const busIdNum =
        res.bus?.id != null && Number.isFinite(Number(res.bus.id)) ? Number(res.bus.id) : undefined;
      const routeIdNum =
        res.route?.id != null && Number.isFinite(Number(res.route.id)) ? Number(res.route.id) : undefined;

      setActiveTrip({
        tripId: res.trip.id,
        status: res.trip.status,
        busLabel: res.bus?.bus_number ? `Bus ${res.bus.bus_number}` : "Bus —",
        routeLabel: res.route?.route_name ? res.route.route_name : "Route —",
        busId: busIdNum,
        routeId: routeIdNum,
      });
    } catch {
      // Keep the normal flow on transient network errors.
      setActiveTrip(null);
    } finally {
      setActiveTripLoading(false);
    }
  }, [isDriver, token]);

  useEffect(() => {
    void loadMyActiveTrip();
  }, [loadMyActiveTrip]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void loadMyActiveTrip();
    });
    return () => sub.remove();
  }, [loadMyActiveTrip]);

  const canShowAbortGate = useMemo(() => {
    if (!isDriver) return false;
    if (activeTripLoading) return true;
    return Boolean(activeTrip);
  }, [activeTrip, activeTripLoading, isDriver]);

  const abortTrip = useCallback(async () => {
    if (!token || !activeTrip) return;
    if (abortLoading) return;
    setAbortLoading(true);
    try {
      await postDriverTripCancel(token, {
        busId: activeTrip.busId,
        routeId: activeTrip.routeId,
        manualAbort: true,
      });
      setActiveTrip(null);
      setTripData({ bus: null, route: null, schedule: null });
      setStep(1);
      await reloadLists();
      await loadMyActiveTrip();
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Could not abort the trip. Please try again.";
      Alert.alert("ABORT TRIP", msg);
    } finally {
      setAbortLoading(false);
    }
  }, [abortLoading, activeTrip, loadMyActiveTrip, reloadLists, token]);

  const resumeTrip = useCallback(async () => {
    if (!isDriver || !token) return;
    if (resumeLoading) return;
    setResumeLoading(true);
    try {
      const res = await getMyActiveTrip(token);
      if (!res?.trip || !res.bus || !res.route) {
        Alert.alert("Resume trip", "No active trip found on the server.");
        setActiveTrip(null);
        return;
      }
      const startedAtMs = (() => {
        const iso = res.trip.actual_start ?? res.trip.scheduled_start ?? null;
        const ms = iso ? Date.parse(iso) : NaN;
        return Number.isFinite(ms) ? ms : Date.now();
      })();

      const data: TripData = {
        bus: {
          id: res.bus.id,
          name: `Bus ${res.bus.bus_number}`,
          licensePlate: res.bus.number_plate ?? "",
          seats: 0,
          status: "In Use",
        },
        route: {
          id: res.route.id,
          name: res.route.route_name,
          stopsCount: 0,
          duration: "—",
          studentsCount: 0,
        },
        schedule: null,
        tripStart: { startedAtMs, driverLocation: null },
        tripId: res.trip?.id != null ? String(res.trip.id) : undefined,
      };

      // Intentionally do not call `onComplete` here — we are resuming an existing server trip.
      // The parent decides how to show the live trip screen.
      onResumeActiveTrip?.(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not resume the trip. Please try again.";
      Alert.alert("Resume trip", msg);
    } finally {
      setResumeLoading(false);
    }
  }, [isDriver, onResumeActiveTrip, resumeLoading, token]);

  const handleNextStep = () => {
    if (step < TOTAL_STEPS) setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
  };

  if (canShowAbortGate) {
    return (
      <View style={styles.container}>
        <View style={styles.abortCard}>
          <Text style={styles.abortTitle}>You already have an active trip</Text>
          <Text style={styles.abortSubtitle}>
            Abort your current trip to select a different bus and route.
          </Text>

          <View style={styles.abortInfoBox}>
            <Text style={styles.abortInfoLine}>
              <Text style={styles.abortInfoLabel}>Bus: </Text>
              {activeTrip?.busLabel ?? "—"}
            </Text>
            <Text style={styles.abortInfoLine}>
              <Text style={styles.abortInfoLabel}>Route: </Text>
              {activeTrip?.routeLabel ?? "—"}
            </Text>
            {activeTrip?.status ? (
              <Text style={styles.abortInfoHint}>Status: {activeTrip.status}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[
              styles.resumeBtn,
              (resumeLoading || activeTripLoading) && styles.resumeBtnDisabled,
            ]}
            onPress={resumeTrip}
            disabled={resumeLoading || activeTripLoading}
            accessibilityRole="button"
            accessibilityLabel="Resume trip"
            activeOpacity={0.8}
          >
            {resumeLoading || activeTripLoading ? (
              <View style={styles.resumeBtnRow}>
                <ActivityIndicator size="small" color={Theme.text} />
                <Text style={styles.resumeBtnText}>
                  {resumeLoading ? "Opening…" : "Loading…"}
                </Text>
              </View>
            ) : (
              <Text style={styles.resumeBtnText}>RESUME TRIP</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.abortBtn, abortLoading && styles.abortBtnDisabled]}
            onPress={abortTrip}
            disabled={abortLoading || activeTripLoading}
            accessibilityRole="button"
            accessibilityLabel="Abort trip"
            activeOpacity={0.8}
          >
            {abortLoading || activeTripLoading ? (
              <View style={styles.abortBtnRow}>
                <ActivityIndicator size="small" color={Theme.text} />
                <Text style={styles.abortBtnText}>
                  {abortLoading ? "Aborting…" : "Loading…"}
                </Text>
              </View>
            ) : (
              <Text style={styles.abortBtnText}>ABORT TRIP</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
            buses={buses}
            loading={listsLoading}
            error={listsError}
            onRetry={reloadLists}
            extraHint={
              role === "driver"
                ? "If you signed out with a trip still open, your bus should show as Available so you can continue."
                : undefined
            }
            onNext={(bus) => {
              setTripData({ ...tripData, bus });
              handleNextStep();
            }}
          />
        )}

        {step === 2 && (
          <SelectRouteStep
            selectedBus={tripData.bus}
            routes={routes}
            loading={listsLoading}
            error={listsError}
            onRetry={reloadLists}
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
  abortCard: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: Theme.bg,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Theme.border,
  },
  abortTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: Theme.text,
    marginBottom: 8,
  },
  abortSubtitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Theme.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  abortInfoBox: {
    backgroundColor: Theme.bgMuted,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Theme.border,
    marginBottom: 14,
  },
  abortInfoLine: {
    fontSize: 14,
    fontWeight: "800",
    color: Theme.text,
    marginBottom: 6,
  },
  abortInfoLabel: {
    color: Theme.textMuted,
    fontWeight: "900",
  },
  abortInfoHint: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: Theme.textMuted,
  },
  abortBtn: {
    backgroundColor: Theme.yellowSoft,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Theme.yellow,
    alignItems: "center",
    justifyContent: "center",
  },
  abortBtnDisabled: {
    opacity: 0.7,
  },
  abortBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  abortBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: Theme.text,
    letterSpacing: 0.6,
  },
  resumeBtn: {
    backgroundColor: Theme.bgMuted,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Theme.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  resumeBtnDisabled: {
    opacity: 0.7,
  },
  resumeBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  resumeBtnText: {
    fontSize: 14,
    fontWeight: "900",
    color: Theme.text,
    letterSpacing: 0.6,
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
