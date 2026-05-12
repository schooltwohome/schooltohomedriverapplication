export type GeoPoint = { latitude: number; longitude: number };

export type TripStatus =
  | "not_started"
  | "started"
  | "reached_school"
  | "returning"
  | "completed";

/** Maps raw backend `tripStatus` strings (snake_case or varied) to canonical TripStatus. */
export function normalizeTripStatus(raw: string | null | undefined): TripStatus {
  if (!raw) return "not_started";
  const s = raw.toLowerCase().replace(/[\s-]/g, "_");
  if (s === "started" || s === "in_progress" || s === "active") return "started";
  if (s === "reached_school" || s === "at_school" || s === "school_reached") return "reached_school";
  if (s === "returning" || s === "return" || s === "heading_back") return "returning";
  if (s === "completed" || s === "done" || s === "finished") return "completed";
  return "not_started";
}

export interface RouteStop extends GeoPoint {
  id: string;
  name: string;
  order: number;
  isCompleted: boolean;
}

/** Queued GPS point waiting to be flushed to the server. */
export interface QueuedLocationPoint {
  latitude: number;
  longitude: number;
  speedKmh: number | null;
  /** GPS compass heading in degrees 0–360 from the device sensor; null when unavailable. */
  heading?: number | null;
  capturedAtMs: number;
  /** Number of flush attempts for this point. */
  attempts: number;
}

/** Real-time vehicle state; mirrors the parent app's VehicleSnapshot for shared utility usage. */
export interface VehicleSnapshot {
  busId: string;
  location: GeoPoint;
  speedKmh: number;
  bearingDeg: number;
  capturedAtMs: number;
  isStale: boolean;
}
