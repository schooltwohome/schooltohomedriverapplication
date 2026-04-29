import { useEffect, useMemo, useRef, useState } from "react";
import * as Location from "expo-location";
import { postBusLocation } from "../../services/driverHelperApi";

const MOVING_TIME_INTERVAL_MS = 4000;
const MOVING_DISTANCE_INTERVAL_M = 20;
const DEDUPE_WINDOW_MS = 2500;
const DEDUPE_MIN_METERS = 8;

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
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

function shouldSkipDuplicate(last: Point | null, next: Point): boolean {
  if (!last) return false;
  const age = next.atMs - last.atMs;
  if (age > DEDUPE_WINDOW_MS) return false;
  return haversineMeters(last, next) < DEDUPE_MIN_METERS;
}

async function postPoint(
  token: string,
  busIdNum: number,
  coords: Pick<Location.LocationObjectCoords, "latitude" | "longitude" | "speed">
) {
  await postBusLocation(token, {
    busId: busIdNum,
    latitude: coords.latitude,
    longitude: coords.longitude,
    speed: coords.speed !== null && coords.speed !== undefined ? coords.speed : undefined,
  });
}

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
    await postPoint(token, busIdNum, first.coords);
    return { ok: true };
  } catch {
    return { ok: false, reason: "post_failed" };
  }
}

/**
 * While a trip is live, periodically reports GPS to `POST /api/v1/bus/location`.
 */
export function useLiveLocationReporter(
  enabled: boolean,
  token: string | null,
  busIdNum: number | null
) {
  const sub = useRef<Location.LocationSubscription | null>(null);
  const lastPostedRef = useRef<Point | null>(null);
  const [status, setStatus] = useState<ReporterStatus>("idle");
  const [lastErrorAtMs, setLastErrorAtMs] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled || !token || busIdNum === null || !Number.isFinite(busIdNum)) {
      setStatus("idle");
      return;
    }

    let cancelled = false;

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

      /** First fix as soon as the trip screen opens — admin map updates without waiting for watch interval. */
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
          await postPoint(token, busIdNum, first.coords);
          lastPostedRef.current = firstPoint;
          setStatus("tracking");
        }
      } catch {
        setStatus("post_failed");
        setLastErrorAtMs(Date.now());
      }

      sub.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: MOVING_DISTANCE_INTERVAL_M,
          timeInterval: MOVING_TIME_INTERVAL_MS,
        },
        async (loc) => {
          const point: Point = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            atMs: Date.now(),
          };
          if (shouldSkipDuplicate(lastPostedRef.current, point)) return;
          try {
            await postPoint(token, busIdNum, loc.coords);
            lastPostedRef.current = point;
            setStatus("tracking");
          } catch {
            setStatus("post_failed");
            setLastErrorAtMs(Date.now());
          }
        }
      );
    })();

    return () => {
      cancelled = true;
      sub.current?.remove();
      sub.current = null;
      lastPostedRef.current = null;
      setStatus("idle");
    };
  }, [enabled, token, busIdNum]);

  return useMemo(
    () => ({
      status,
      lastErrorAtMs,
    }),
    [status, lastErrorAtMs]
  );
}

// Default export added to satisfy Expo Router typed-routes scanning.
export default useLiveLocationReporter;
