import { useCallback, useEffect, useState } from "react";
import { getTripSetup } from "../../services/driverHelperApi";
import { apiBusToBusItem, apiRouteToRouteItem } from "../../lib/tripSetupMappers";
import type { BusItem, RouteItem } from "../_components/driver-trip/types";
import { useAppSelector } from "../../store/hooks";

export function useTripSetupLists() {
  const token = useAppSelector((s) => s.auth.token);
  const [buses, setBuses] = useState<BusItem[]>([]);
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setBuses([]);
      setRoutes([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getTripSetup(token);
      setBuses(data.buses.map(apiBusToBusItem));
      setRoutes(data.routes.map(apiRouteToRouteItem));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load buses and routes");
      setBuses([]);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return { buses, routes, loading, error, reload: load };
}
