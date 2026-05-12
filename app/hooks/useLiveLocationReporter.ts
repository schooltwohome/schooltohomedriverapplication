import { useEffect, useMemo, useRef, useState } from "react";
import * as Location from "expo-location";
import {
  enqueue,
  flush,
  queueDepth,
  clearQueue,
} from "../../services/locationQueue";
import {
  startBackgroundLocationUpdates,
  stopBackgroundLocationUpdates,
} from "../../lib/backgroundLocationTask";
import { deviationMeters } from "../../lib/geo";
import type { GeoPoint } from "../../types/tracking";

// 2-second / 10-metre intervals give Uber-grade update frequency on roads.
const MOVING_TIME_INTERVAL_MS = 2_000;
const MOVING_DISTANCE_INTERVAL_M = 10;
/** Ignore a new point if it is within this distance and time window of the last posted point. */
const DEDUPE_WINDOW_MS = 1_500;
const DEDUPE_MIN_METERS = 4;
/** How often to flush the queue while the foreground watcher is active (ms). */
const FLUSH_INTERVAL_MS = 3_000;
const DEVIATION_THRESHOLD_METERS = 150;

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
  if (status !== "granted") return { ok: false, reason: "permission_denied" };

  const provider = await Location.getProviderStatusAsync();
  if (!provider.locationServicesEnabled) {
    return { ok: false, reason: "gps_unavailable" };
  }

  try {
    const first = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });
    await enqueue({
      latitude: first.coords.latitude,
      longitude: first.coords.longitude,
      speedKmh:
        first.coords.speed != null && first.coords.speed >= 0
          ? first.coords.speed * 3.6
          : null,
      heading: first.coords.heading ?? null,
      capturedAtMs: Date.now(),
    });
    await flush(token, busIdNum);
    return { ok: true };
  } catch {
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
  // Keep the latest routePolyline accessible inside the watcher callback without
  // restarting the watcher when the polyline reference changes.
  const routePolylineRef = useRef<GeoPoint[] | undefined>(routePolyline);
  const [status, setStatus] = useState<ReporterStatus>("idle");
  const [lastErrorAtMs, setLastErrorAtMs] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isDeviated, setIsDeviated] = useState(false);
  const prevEnabledRef = useRef(enabled);

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
      } catch {
        if (!cancelled) {
          setStatus("post_failed");
          setLastErrorAtMs(Date.now());
        }
      }
      await refreshQueueCount();
    };

    (async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted" || cancelled) {
        setStatus("permission_denied");
        return;
      }

      const provider = await Location.getProviderStatusAsync();
      if (!provider.locationServicesEnabled || cancelled) {
        setStatus("gps_unavailable");
        return;
      }

      // Immediate first fix — enqueue and flush right away.
      try {
        const first = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        if (!cancelled) {
          const firstPoint: Point = {
            latitude: first.coords.latitude,
            longitude: first.coords.longitude,
            atMs: Date.now(),
          };
          await enqueue({
            latitude: first.coords.latitude,
            longitude: first.coords.longitude,
            speedKmh:
              first.coords.speed != null && first.coords.speed >= 0
                ? first.coords.speed * 3.6
                : null,
            heading: first.coords.heading ?? null,
            capturedAtMs: firstPoint.atMs,
          });
          lastEnqueuedRef.current = firstPoint;
          await doFlush();
          setStatus("tracking");
        }
      } catch {
        if (!cancelled) {
          setStatus("post_failed");
          setLastErrorAtMs(Date.now());
        }
      }

      // Register the background task (no-op on simulators).
      await startBackgroundLocationUpdates(token, busIdNum);

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
          const point: Point = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            atMs: Date.now(),
          };
          if (shouldSkipDuplicate(lastEnqueuedRef.current, point)) return;
          await enqueue({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            speedKmh:
              loc.coords.speed != null && loc.coords.speed >= 0
                ? loc.coords.speed * 3.6
                : null,
            heading: loc.coords.heading ?? null,
            capturedAtMs: point.atMs,
          });
          lastEnqueuedRef.current = point;
          await refreshQueueCount();

          const poly = routePolylineRef.current;
          if (poly && poly.length >= 2) {
            const dev = deviationMeters(point, poly);
            if (!cancelled) setIsDeviated(dev > DEVIATION_THRESHOLD_METERS);
          }
        }
      );
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
      setPendingCount(0);
      setIsDeviated(false);
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
    }),
    [status, lastErrorAtMs, pendingCount, isDeviated]
  );
}

// Default export added to satisfy Expo Router typed-routes scanning.
export default useLiveLocationReporter;
