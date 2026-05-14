import { AppState } from "react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import * as Location from "expo-location";
import {
  flush,
  queueDepth,
  clearQueue,
  sendImmediateOrQueue,
} from "../../services/locationQueue";
import {
  startBackgroundLocationUpdates,
  stopBackgroundLocationUpdates,
} from "../../lib/backgroundLocationTask";
import { deviationMeters } from "../../lib/geo";
import {
  getDriverLocationPermissionState,
  promptBatteryOptimizationExemption,
} from "../../lib/powerOptimization";
import {
  logTrackingError,
  logTrackingInfo,
  logTrackingWarn,
} from "../../lib/trackingLogger";
import type { GeoPoint } from "../../types/tracking";

// School-bus live tracking target: every 3s or 10m (whichever comes first).
const MOVING_TIME_INTERVAL_MS = 3_000;
const MOVING_DISTANCE_INTERVAL_M = 10;
/** Ignore a new point if it is within this distance and time window of the last posted point. */
const DEDUPE_WINDOW_MS = 2_500;
const DEDUPE_MIN_METERS = 4;
/** How often to flush the queue while the foreground watcher is active (ms). */
const FLUSH_INTERVAL_MS = 3_000;
const DEVIATION_THRESHOLD_METERS = 150;
/** Drop jitter-prone GPS points when sensor accuracy is worse than 50 m. */
const MAX_ACCEPTABLE_ACCURACY_METERS = 50;
/** Ignore impossible school-bus speed spikes (GPS glitches). */
const MAX_BUS_SPEED_KMH = 120;

type ReporterStatus =
  | "idle"
  | "tracking"
  | "permission_denied"
  | "gps_unavailable"
  | "post_failed";

type Point = {
  latitude: number;
  longitude: number;
  atMs: number;
};

function haversineMeters(a: Point, b: Point): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) *
      Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude));
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}

function shouldSkipDuplicate(last: Point | null, next: Point): boolean {
  if (!last) return false;
  if (next.atMs - last.atMs > DEDUPE_WINDOW_MS) return false;
  return haversineMeters(last, next) < DEDUPE_MIN_METERS;
}

/**
 * One-shot location capture used at trip start to publish an immediate fix
 * before the watch interval fires.
 */
export async function publishCurrentLocationOnce(
  token: string,
  busIdNum: number
): Promise<{ ok: boolean; reason?: "permission_denied" | "gps_unavailable" | "post_failed" }> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    logTrackingWarn("trip_start_permission_denied", "Foreground location permission denied");
    return { ok: false, reason: "permission_denied" };
  }

  const provider = await Location.getProviderStatusAsync();
  if (!provider.locationServicesEnabled) {
    logTrackingWarn("trip_start_gps_off", "Device location services are disabled");
    return { ok: false, reason: "gps_unavailable" };
  }

  try {
    const first = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });
    const speedKmh =
      first.coords.speed != null && first.coords.speed >= 0
        ? first.coords.speed * 3.6
        : null;
    if (speedKmh != null && speedKmh > MAX_BUS_SPEED_KMH) {
      logTrackingWarn("trip_start_speed_glitch_dropped", "Dropped first fix due to impossible speed", {
        speedKmh,
        latitude: first.coords.latitude,
        longitude: first.coords.longitude,
      });
      return { ok: false, reason: "post_failed" };
    }
    await sendImmediateOrQueue(token, busIdNum, {
      latitude: first.coords.latitude,
      longitude: first.coords.longitude,
      speedKmh,
      heading: first.coords.heading ?? null,
      capturedAtMs: Date.now(),
    });
    logTrackingInfo("trip_start_fix", "Published first trip location", {
      latitude: first.coords.latitude,
      longitude: first.coords.longitude,
      accuracy: first.coords.accuracy ?? null,
      timestamp: first.timestamp,
    });
    await flush(token, busIdNum);
    return { ok: true };
  } catch (err: unknown) {
    logTrackingError("trip_start_publish_failed", "Failed to publish initial trip location", {
      error: err instanceof Error ? err.message : String(err),
    });
    return { ok: false, reason: "post_failed" };
  }
}

/**
 * Manages foreground GPS streaming and background task registration for an active trip.
 *
 * Architecture:
 * - All GPS points are written to the AsyncStorage queue via `enqueue`.
 * - A periodic flush (`flush`) drains the queue to the backend — retrying on failure.
 * - When the app is backgrounded, `backgroundLocationTask` keeps enqueuing and flushing.
 * - On trip end (enabled → false), the background task is stopped and the queue is cleared.
 *
 * @param routePolyline  Optional ordered list of route stop coordinates. When provided,
 *                       each GPS fix is checked against the polyline; `isDeviated` is set
 *                       true when the bus is more than DEVIATION_THRESHOLD_METERS from the nearest segment.
 */
export function useLiveLocationReporter(
  enabled: boolean,
  token: string | null,
  busIdNum: number | null,
  routePolyline?: GeoPoint[]
) {
  const sub = useRef<Location.LocationSubscription | null>(null);
  const lastEnqueuedRef = useRef<Point | null>(null);
  const flushIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateSubRef = useRef<{ remove: () => void } | null>(null);
  // Keep the latest routePolyline accessible inside the watcher callback without
  // restarting the watcher when the polyline reference changes.
  const routePolylineRef = useRef<GeoPoint[] | undefined>(routePolyline);
  const [status, setStatus] = useState<ReporterStatus>("idle");
  const [lastErrorAtMs, setLastErrorAtMs] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isDeviated, setIsDeviated] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GeoPoint | null>(null);
  const prevEnabledRef = useRef(enabled);
  const isRecoveryInFlightRef = useRef(false);

  useEffect(() => {
    routePolylineRef.current = routePolyline;
  });

  useEffect(() => {
    if (!enabled || !token || busIdNum === null || !Number.isFinite(busIdNum)) {
      setStatus("idle");
      return;
    }

    let cancelled = false;

    const refreshQueueCount = async () => {
      const depth = await queueDepth();
      if (!cancelled) setPendingCount(depth);
    };

    const doFlush = async () => {
      if (!token || busIdNum === null) return;
      try {
        await flush(token, busIdNum);
        if (!cancelled) setStatus("tracking");
        logTrackingInfo("flush_ok", "Queued GPS points flushed", {
          busId: busIdNum,
        });
      } catch {
        if (!cancelled) {
          setStatus("post_failed");
          setLastErrorAtMs(Date.now());
        }
        logTrackingWarn("flush_failed", "Could not flush queued GPS points", {
          busId: busIdNum,
        });
      }
      await refreshQueueCount();
    };

    const recoverForegroundFix = async (reason: string) => {
      if (isRecoveryInFlightRef.current) return;
      isRecoveryInFlightRef.current = true;
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (cancelled) return;
        const speedKmh =
          loc.coords.speed != null && loc.coords.speed >= 0
            ? loc.coords.speed * 3.6
            : null;
        if (speedKmh != null && speedKmh > MAX_BUS_SPEED_KMH) {
          logTrackingWarn("foreground_recovery_speed_glitch_dropped", "Dropped recovery fix due to impossible speed", {
            speedKmh,
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
          return;
        }
        await sendImmediateOrQueue(token, busIdNum, {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          speedKmh,
          heading: loc.coords.heading ?? null,
          capturedAtMs: Date.now(),
        });
        lastEnqueuedRef.current = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          atMs: Date.now(),
        };
        setCurrentLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        logTrackingInfo("foreground_recovery_fix", "Recovered foreground location after resume", {
          reason,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          accuracy: loc.coords.accuracy ?? null,
          timestamp: loc.timestamp,
        });
        await doFlush();
      } catch (err: unknown) {
        logTrackingWarn("foreground_recovery_failed", "Failed to recover foreground location", {
          reason,
          error: err instanceof Error ? err.message : String(err),
        });
      } finally {
        isRecoveryInFlightRef.current = false;
      }
    };

    (async () => {
      let permissionState = await getDriverLocationPermissionState();
      if (!permissionState.foregroundGranted) {
        const requested = await Location.requestForegroundPermissionsAsync();
        permissionState = {
          ...permissionState,
          foregroundGranted: requested.status === "granted",
        };
      }
      if (!permissionState.foregroundGranted || cancelled) {
        setStatus("permission_denied");
        logTrackingWarn("permission_denied", "Foreground location permission denied");
        return;
      }

      if (!permissionState.locationServicesEnabled || cancelled) {
        setStatus("gps_unavailable");
        logTrackingWarn("gps_disabled", "Location services disabled");
        return;
      }

      if (!permissionState.backgroundGranted) {
        logTrackingWarn(
          "background_permission_missing",
          "Background location permission missing; tracking may pause when app is backgrounded"
        );
      }

      void promptBatteryOptimizationExemption();

      // Immediate first fix — enqueue and flush right away.
      try {
        const first = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        if (!cancelled) {
          const firstAccuracy =
            typeof first.coords.accuracy === "number" ? first.coords.accuracy : null;
          if (firstAccuracy != null && firstAccuracy > MAX_ACCEPTABLE_ACCURACY_METERS) {
            logTrackingWarn("low_accuracy_first_fix_dropped", "Dropped low-accuracy first fix", {
              accuracy: firstAccuracy,
              latitude: first.coords.latitude,
              longitude: first.coords.longitude,
            });
          } else {
            const firstPoint: Point = {
              latitude: first.coords.latitude,
              longitude: first.coords.longitude,
              atMs: Date.now(),
            };
            const speedKmh =
              first.coords.speed != null && first.coords.speed >= 0
                ? first.coords.speed * 3.6
                : null;
            if (speedKmh != null && speedKmh > MAX_BUS_SPEED_KMH) {
              logTrackingWarn("first_fix_speed_glitch_dropped", "Dropped first foreground fix due to impossible speed", {
                speedKmh,
                latitude: first.coords.latitude,
                longitude: first.coords.longitude,
              });
              return;
            }
            await sendImmediateOrQueue(token, busIdNum, {
              latitude: first.coords.latitude,
              longitude: first.coords.longitude,
              speedKmh,
              heading: first.coords.heading ?? null,
              capturedAtMs: firstPoint.atMs,
            });
            lastEnqueuedRef.current = firstPoint;
            setCurrentLocation({ latitude: first.coords.latitude, longitude: first.coords.longitude });
            logTrackingInfo("first_fix_enqueued", "Enqueued initial location fix", {
              latitude: first.coords.latitude,
              longitude: first.coords.longitude,
              accuracy: first.coords.accuracy ?? null,
              timestamp: first.timestamp,
            });
            await doFlush();
            setStatus("tracking");
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setStatus("post_failed");
          setLastErrorAtMs(Date.now());
        }
        logTrackingError("first_fix_failed", "Could not capture first GPS fix", {
          error: err instanceof Error ? err.message : String(err),
        });
      }

      // Register the background task (no-op on simulators).
      const bgStart = await startBackgroundLocationUpdates(token, busIdNum);
      if (!bgStart.ok) {
        logTrackingWarn("background_task_start_failed", "Background tracking did not start cleanly", {
          reason: bgStart.reason ?? "unknown",
        });
      } else {
        logTrackingInfo("background_task_started", "Background tracking task started", {
          busId: busIdNum,
        });
      }

      // Periodic foreground flush — catches connectivity gaps.
      flushIntervalRef.current = setInterval(doFlush, FLUSH_INTERVAL_MS);

      // Foreground position watcher.
      sub.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: MOVING_DISTANCE_INTERVAL_M,
          timeInterval: MOVING_TIME_INTERVAL_MS,
        },
        async (loc) => {
          if (cancelled) return;
          const accuracy = typeof loc.coords.accuracy === "number" ? loc.coords.accuracy : null;
          if (accuracy != null && accuracy > MAX_ACCEPTABLE_ACCURACY_METERS) {
            logTrackingWarn("location_dropped_low_accuracy", "Dropped location with poor GPS accuracy", {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              accuracy,
              timestamp: loc.timestamp,
            });
            return;
          }

          const point: Point = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            atMs: Date.now(),
          };
          const speedKmh =
            loc.coords.speed != null && loc.coords.speed >= 0
              ? loc.coords.speed * 3.6
              : null;
          if (speedKmh != null && speedKmh > MAX_BUS_SPEED_KMH) {
            logTrackingWarn("location_dropped_speed_glitch", "Dropped location due to impossible speed", {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              speedKmh,
              timestamp: loc.timestamp,
            });
            return;
          }
          if (!shouldSkipDuplicate(lastEnqueuedRef.current, point)) {
            await sendImmediateOrQueue(token, busIdNum, {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              speedKmh,
              heading: loc.coords.heading ?? null,
              capturedAtMs: point.atMs,
            });
            lastEnqueuedRef.current = point;
            await refreshQueueCount();
            await doFlush();
            logTrackingInfo("location_enqueued", "Queued location update", {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              accuracy: loc.coords.accuracy ?? null,
              heading: loc.coords.heading ?? null,
              speed: speedKmh,
              timestamp: loc.timestamp,
            });
          } else {
            logTrackingInfo("location_deduped", "Dropped duplicate location update", {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              timestamp: loc.timestamp,
            });
          }

          if (!cancelled) {
            setCurrentLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          }

          const poly = routePolylineRef.current;
          if (poly && poly.length >= 2) {
            const dev = deviationMeters(point, poly);
            if (!cancelled) setIsDeviated(dev > DEVIATION_THRESHOLD_METERS);
          }
        }
      );

      appStateSubRef.current = AppState.addEventListener("change", (nextState) => {
        if (nextState === "active") {
          void recoverForegroundFix("app_resumed");
        }
      });
    })();

    return () => {
      cancelled = true;
      sub.current?.remove();
      sub.current = null;
      lastEnqueuedRef.current = null;

      if (flushIntervalRef.current) {
        clearInterval(flushIntervalRef.current);
        flushIntervalRef.current = null;
      }

      stopBackgroundLocationUpdates();
      appStateSubRef.current?.remove();
      appStateSubRef.current = null;
      setPendingCount(0);
      setIsDeviated(false);
      setCurrentLocation(null);
      setStatus("idle");
    };
  }, [enabled, token, busIdNum]);

  useEffect(() => {
    if (prevEnabledRef.current && !enabled) {
      // Trip ended intentionally; clear stale points before the next trip.
      void clearQueue();
    }
    prevEnabledRef.current = enabled;
  }, [enabled]);

  return useMemo(
    () => ({
      status,
      lastErrorAtMs,
      /** Number of GPS points waiting in the offline queue. */
      pendingCount,
      /** True when the bus is more than DEVIATION_THRESHOLD_METERS from the nearest route polyline segment. */
      isDeviated,
      /** Most recent GPS fix from the foreground watcher. Null until the first fix arrives. */
      currentLocation,
    }),
    [status, lastErrorAtMs, pendingCount, isDeviated, currentLocation]
  );
}

// Default export added to satisfy Expo Router typed-routes scanning.
export default useLiveLocationReporter;
