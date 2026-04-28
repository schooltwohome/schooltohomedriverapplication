import { useCallback, useEffect, useState } from "react";
import { getTripSetup } from "../../services/driverHelperApi";
import { apiBusToBusItem, apiRouteToRouteItem } from "../../lib/tripSetupMappers";
import type { BusItem, RouteItem } from "../_components/driver-trip/types";
import { useAppSelector } from "../../store/hooks";

export function useTripSetupLists() {
  const token = useAppSelector((s) => s.auth.token);
  const role = useAppSelector((s) => s.auth.me?.user?.role)?.toLowerCase();
  const [buses, setBuses] = useState<BusItem[]>([]);
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [helperJoinableTrips, setHelperJoinableTrips] = useState<
    Array<{ bus_id: string; route_id: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setBuses([]);
      setRoutes([]);
      setHelperJoinableTrips([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getTripSetup(token);
      const joinableBusIds =
        role === "helper" && (data.helper_joinable_trips?.length ?? 0) > 0
          ? new Set(data.helper_joinable_trips!.map((j) => String(j.bus_id)))
          : null;

      // For helpers, "in_use" is expected when the driver has started the trip.
      // Show those buses as "Available" so the helper can select/join without confusion.
      const mappedBuses = data.buses.map((b) => {
        const item = apiBusToBusItem(b);
        if (joinableBusIds?.has(String(item.id))) {
          return { ...item, status: "Available" as const };
        }
        return item;
      });

      setBuses(mappedBuses);
      setRoutes(data.routes.map(apiRouteToRouteItem));
      setHelperJoinableTrips(data.helper_joinable_trips ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load buses and routes");
      setBuses([]);
      setRoutes([]);
      setHelperJoinableTrips([]);
    } finally {
      setLoading(false);
    }
  }, [token, role]);

  useEffect(() => {
    void load();
  }, [load]);

  return { buses, routes, helperJoinableTrips, loading, error, reload: load };
}

// Default export added to satisfy Expo Router typed-routes scanning.
export default useTripSetupLists;
