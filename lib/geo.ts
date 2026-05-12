import type { GeoPoint } from "../types/tracking";

const EARTH_RADIUS_M = 6_371_000;
const MIN_SPEED_FOR_ETA_KMH = 5;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Haversine distance between two geo-points in metres. */
export function haversineMeters(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h =
    sinDLat * sinDLat +
    sinDLon * sinDLon * Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude));
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/**
 * Compass bearing from `from` to `to` in degrees (0 = north, clockwise).
 * Returns 0 when the two points are identical.
 */
export function bearingDeg(from: GeoPoint, to: GeoPoint): number {
  if (from.latitude === to.latitude && from.longitude === to.longitude) return 0;
  const lat1 = toRad(from.latitude);
  const lat2 = toRad(to.latitude);
  const dLon = toRad(to.longitude - from.longitude);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * ETA in whole minutes given remaining distance and current speed.
 * Returns null when the bus is stationary or speed is below threshold (avoids ∞ ETA).
 */
export function etaMinutes(remainingKm: number, speedKmh: number): number | null {
  if (!Number.isFinite(remainingKm) || remainingKm <= 0) return 0;
  if (!Number.isFinite(speedKmh) || speedKmh < MIN_SPEED_FOR_ETA_KMH) return null;
  return Math.ceil((remainingKm / speedKmh) * 60);
}

/**
 * Shortest perpendicular distance (metres) from `point` to any segment of `polyline`.
 * Used for route-deviation detection. Returns Infinity if the polyline has fewer than 2 points.
 */
export function deviationMeters(point: GeoPoint, polyline: GeoPoint[]): number {
  if (polyline.length < 2) return Infinity;
  let minDist = Infinity;
  for (let i = 0; i < polyline.length - 1; i++) {
    const d = pointToSegmentMeters(point, polyline[i], polyline[i + 1]);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

function pointToSegmentMeters(p: GeoPoint, a: GeoPoint, b: GeoPoint): number {
  const distAB = haversineMeters(a, b);
  if (distAB === 0) return haversineMeters(p, a);

  const ax = toRad(a.longitude) * Math.cos(toRad(a.latitude));
  const ay = toRad(a.latitude);
  const bx = toRad(b.longitude) * Math.cos(toRad(b.latitude));
  const by = toRad(b.latitude);
  const px = toRad(p.longitude) * Math.cos(toRad(p.latitude));
  const py = toRad(p.latitude);

  const dx = bx - ax;
  const dy = by - ay;
  const t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
  const tClamped = Math.max(0, Math.min(1, t));

  const closestLon =
    ((ax + tClamped * dx) / Math.cos(toRad(a.latitude + tClamped * (b.latitude - a.latitude)))) *
    (180 / Math.PI);
  const closestLat = (ay + tClamped * dy) * (180 / Math.PI);

  return haversineMeters(p, { latitude: closestLat, longitude: closestLon });
}

/** Total polyline length in metres. */
export function polylineLengthMeters(coords: GeoPoint[]): number {
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    total += haversineMeters(coords[i], coords[i + 1]);
  }
  return total;
}
