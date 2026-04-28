import * as Location from "expo-location";
import type { TripStartSnapshot } from "./types";

export async function captureTripStartSnapshot(): Promise<TripStartSnapshot> {
  const startedAtMs = Date.now();
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return { startedAtMs, driverLocation: null };
    }
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      startedAtMs,
      driverLocation: {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      },
    };
  } catch {
    return { startedAtMs, driverLocation: null };
  }
}

// Default export added to satisfy Expo Router typed-routes scanning.
export default {};
