import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { AnimatedRegion } from "react-native-maps";
import { bearingDeg } from "../../lib/geo";
import type { GeoPoint } from "../../types/tracking";

const MIN_ANIMATION_DURATION_MS = 650;
const MAX_ANIMATION_DURATION_MS = 4_000;
const MIN_DISTANCE_FOR_ANIMATION_M = 4;
const MAX_DISTANCE_FOR_ANIMATION_M = 180;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function haversineMeters(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) *
      Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude));
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}

function unwrapHeadingDelta(next: number, prev: number): number {
  let delta = next - prev;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return delta;
}

function animationDurationFromDistance(distanceMeters: number): number {
  const d = Math.max(MIN_DISTANCE_FOR_ANIMATION_M, Math.min(MAX_DISTANCE_FOR_ANIMATION_M, distanceMeters));
  const ratio =
    (d - MIN_DISTANCE_FOR_ANIMATION_M) /
    (MAX_DISTANCE_FOR_ANIMATION_M - MIN_DISTANCE_FOR_ANIMATION_M);
  return Math.round(
    MIN_ANIMATION_DURATION_MS + ratio * (MAX_ANIMATION_DURATION_MS - MIN_ANIMATION_DURATION_MS)
  );
}

export type AnimatedBusMarkerState = {
  /** Pass directly to `<MarkerAnimated coordinate={animatedRegion}>`. */
  animatedRegion: InstanceType<typeof AnimatedRegion>;
  /**
   * Current bearing as an `Animated.Value` (degrees 0–360).
   * Apply via `transform: [{ rotate: rotation.interpolate({...}) }]` on the icon View.
   */
  rotation: Animated.Value;
  bearingDegRef: React.MutableRefObject<number>;
};

/**
 * Drives smooth, animated driver marker movement on react-native-maps.
 * Coordinate interpolation runs on the native thread via AnimatedRegion.timing().
 * Bearing is snapped (not animated) on each new GPS point.
 */
export function useAnimatedBusMarker(location: GeoPoint | null): AnimatedBusMarkerState {
  const animatedRegion = useRef(
    new AnimatedRegion({
      latitude: location?.latitude ?? 0,
      longitude: location?.longitude ?? 0,
      latitudeDelta: 0,
      longitudeDelta: 0,
    })
  ).current;

  const rotation = useRef(new Animated.Value(0)).current;
  const bearingDegRef = useRef<number>(0);
  const headingAccumulatorRef = useRef<number>(0);
  const prevLocationRef = useRef<GeoPoint | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!location) return;

    if (!isInitializedRef.current) {
      animatedRegion.setValue({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0,
        longitudeDelta: 0,
      });
      isInitializedRef.current = true;
      prevLocationRef.current = location;
      return;
    }

    const prev = prevLocationRef.current;
    if (prev) {
      const newBearing = bearingDeg(prev, location);
      const delta = unwrapHeadingDelta(newBearing, bearingDegRef.current);
      if (Math.abs(delta) >= 1) {
        bearingDegRef.current = newBearing;
        headingAccumulatorRef.current += delta;
        rotation.setValue(headingAccumulatorRef.current);
      }
    }
    prevLocationRef.current = location;

    const segmentDistance = prev ? haversineMeters(prev, location) : MIN_DISTANCE_FOR_ANIMATION_M;
    const duration = animationDurationFromDistance(segmentDistance);

    animatedRegion
      .timing({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0,
        longitudeDelta: 0,
        duration,
        useNativeDriver: false,
      } as Parameters<InstanceType<typeof AnimatedRegion>["timing"]>[0])
      .start();
  }, [location, animatedRegion, rotation]);

  return { animatedRegion, rotation, bearingDegRef };
}

export default useAnimatedBusMarker;
