import type { PendingPushIntent } from "../store/slices/pushSlice";

/**
 * Maps remote-notification `data` (same string keys as parent app / server) into shell behaviour.
 */
export function targetFromPushData(
  data: Record<string, unknown> | undefined | null
): PendingPushIntent {
  const raw = data ?? {};
  const type = raw.type != null ? String(raw.type) : "";

  switch (type) {
    case "driver_trip_start":
    case "driver_assigned":
    case "trip_start_reminder":
    case "bus_approaching":
    case "student_boarded":
    case "stop_completed":
    case "staff_trip_started":
    case "staff_helper_joined":
    case "staff_trip_aborted":
    case "staff_driver_assigned":
      return { kind: "tab", tab: "home" };
    default:
      return { kind: "notifications" };
  }
}
