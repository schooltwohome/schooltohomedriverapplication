import type { PendingPushIntent } from "../store/slices/pushSlice";

/**
 * Maps remote-notification `data` (same string keys as parent app / server) into shell behaviour.
 * Product note: confirm whether helpers/drivers receive parent-style trip pushes or staff-only payloads.
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
      return { kind: "tab", tab: "home" };
    default:
      return { kind: "notifications" };
  }
}
