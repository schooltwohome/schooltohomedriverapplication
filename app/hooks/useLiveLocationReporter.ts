import { useEffect, useRef } from "react";
import * as Location from "expo-location";
import { postBusLocation } from "../../services/driverHelperApi";

/**
 * While a trip is live, periodically reports GPS to `POST /api/v1/bus/location`.
 */
export function useLiveLocationReporter(
  enabled: boolean,
  token: string | null,
  busIdNum: number | null
) {
  const sub = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    if (!enabled || !token || busIdNum === null || !Number.isFinite(busIdNum)) {
      return;
    }

    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted" || cancelled) return;

      /** First fix as soon as the trip screen opens — admin map updates without waiting for watch interval. */
      try {
        const first = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        if (!cancelled) {
          await postBusLocation(token, {
            busId: busIdNum,
            latitude: first.coords.latitude,
            longitude: first.coords.longitude,
            speed:
              first.coords.speed !== null && first.coords.speed !== undefined
                ? first.coords.speed
                : undefined,
          });
        }
      } catch {
        /* cold GPS — watch will retry */
      }

      sub.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 40,
          timeInterval: 12000,
        },
        async (loc) => {
          try {
            await postBusLocation(token, {
              busId: busIdNum,
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              speed:
                loc.coords.speed !== null && loc.coords.speed !== undefined
                  ? loc.coords.speed
                  : undefined,
            });
          } catch {
            /* network / validation — ignore for live UX */
          }
        }
      );
    })();

    return () => {
      cancelled = true;
      sub.current?.remove();
      sub.current = null;
    };
  }, [enabled, token, busIdNum]);
}
