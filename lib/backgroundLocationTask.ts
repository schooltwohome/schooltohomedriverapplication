import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import Constants from "expo-constants";
import { enqueue, flush, sendImmediateOrQueue } from "../services/locationQueue";
import {
  logTrackingError,
  logTrackingInfo,
  logTrackingWarn,
} from "./trackingLogger";

export const BACKGROUND_LOCATION_TASK = "BACKGROUND_LOCATION_TASK";
const MAX_ACCEPTABLE_ACCURACY_METERS = 50;
const MAX_BUS_SPEED_KMH = 120;

/**
 * Task credentials are stored in module-level refs so the TaskManager callback
 * (which runs outside of React context) can access them.
 */
let _token: string | null = null;
let _busId: number | null = null;

export function setBackgroundTaskCredentials(token: string, busId: number): void {
  _token = token;
  _busId = busId;
}

export function clearBackgroundTaskCredentials(): void {
  _token = null;
  _busId = null;
}

/**
 * Must be called at module load time (top level of a root file, before any navigation)
 * so TaskManager can register the handler before the background task wakes the app.
 *
 * Import this file in `app/_layout.tsx` or equivalent root layout:
 *   import "../lib/backgroundLocationTask";
 */
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    logTrackingError("bg_task_error", "Background location task failed", {
      message: error.message,
    });
    if (__DEV__) console.warn("[BGLocationTask] error:", error.message);
    return;
  }

  const { locations } = data as { locations: Location.LocationObject[] };
  if (!locations?.length) return;

  const token = _token;
  const busId = _busId;

  for (const loc of locations) {
    const accuracy = typeof loc.coords.accuracy === "number" ? loc.coords.accuracy : null;
    if (accuracy != null && accuracy > MAX_ACCEPTABLE_ACCURACY_METERS) {
      logTrackingWarn("bg_location_dropped_low_accuracy", "Dropped background location with poor accuracy", {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy,
        timestamp: loc.timestamp,
      });
      continue;
    }
    const speedKmh =
      loc.coords.speed != null && loc.coords.speed >= 0
        ? loc.coords.speed * 3.6
        : null;
    if (speedKmh != null && speedKmh > MAX_BUS_SPEED_KMH) {
      logTrackingWarn("bg_location_dropped_speed_glitch", "Dropped background GPS spike due to impossible speed", {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        speedKmh,
        timestamp: loc.timestamp,
      });
      continue;
    }
    if (token && busId !== null) {
      await sendImmediateOrQueue(token, busId, {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        speedKmh,
        // Heading from device compass — captured in background so the bus marker
        // continues rotating correctly even when the driver app is backgrounded.
        heading:
          loc.coords.heading != null && loc.coords.heading >= 0
            ? loc.coords.heading
            : null,
        capturedAtMs: loc.timestamp,
      });
    } else {
      // No credentials yet (cold-start race): persist only; flush runs when creds become available.
      await enqueue({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        speedKmh,
        heading:
          loc.coords.heading != null && loc.coords.heading >= 0
            ? loc.coords.heading
            : null,
        capturedAtMs: loc.timestamp,
      });
    }
    logTrackingInfo("bg_location_processed", "Processed background location fix", {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      accuracy: loc.coords.accuracy ?? null,
      timestamp: loc.timestamp,
    });
  }

  // Flush immediately while the app has background execution time.
  if (token && busId !== null) {
    try {
      await flush(token, busId);
      logTrackingInfo("bg_flush_ok", "Flushed queued background locations", {
        busId,
      });
    } catch (err: unknown) {
      logTrackingWarn("bg_flush_failed", "Failed to flush background queue", {
        busId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
});

/**
 * Registers the background location task. Requests background permission if not yet granted.
 * On iOS, falls back to significant-location-change if full background permission is denied.
 * Safe to call multiple times — checks whether the task is already running first.
 */
export async function startBackgroundLocationUpdates(
  token: string,
  busId: number
): Promise<{ ok: boolean; reason?: string }> {
  // Background location only works on physical devices.
  if (!Constants.isDevice) {
    return { ok: false, reason: "simulator_unsupported" };
  }

  const alreadyRunning = await Location.hasStartedLocationUpdatesAsync(
    BACKGROUND_LOCATION_TASK
  ).catch(() => false);
  if (alreadyRunning) {
    setBackgroundTaskCredentials(token, busId);
    return { ok: true };
  }

  const fgPerm = await Location.requestForegroundPermissionsAsync();
  if (fgPerm.status !== "granted") {
    return { ok: false, reason: "foreground_permission_denied" };
  }

  const bgPerm = await Location.requestBackgroundPermissionsAsync();
  const hasBgPerm = bgPerm.status === "granted";

  setBackgroundTaskCredentials(token, busId);

  try {
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.High,
      // 5-second / 10-metre background intervals keep the marker moving smoothly
      // without excessive battery drain. Android requires foreground service for
      // anything below 10 s — the service notification below satisfies that.
      timeInterval: 5_000,
      distanceInterval: 10,
      // Foreground service notification (Android 8+ requirement).
      foregroundService: {
        notificationTitle: "Bus tracking active",
        notificationBody: "Your location is being shared for the current trip.",
        notificationColor: "#F59E0B",
      },
      // iOS: pause updates automatically when the device doesn't move.
      pausesUpdatesAutomatically: false,
      // iOS: use significant-location-change as additional wake mechanism when denied Always.
      showsBackgroundLocationIndicator: hasBgPerm,
      activityType: Location.ActivityType.AutomotiveNavigation,
    });
    return { ok: true };
  } catch (err: unknown) {
    clearBackgroundTaskCredentials();
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "start_failed",
    };
  }
}

/**
 * Stops the background location task and clears stored credentials.
 * Safe to call when the task is not running.
 */
export async function stopBackgroundLocationUpdates(): Promise<void> {
  clearBackgroundTaskCredentials();
  const running = await Location.hasStartedLocationUpdatesAsync(
    BACKGROUND_LOCATION_TASK
  ).catch(() => false);
  if (running) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK).catch(() => {});
  }
}
