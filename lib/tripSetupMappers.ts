import type { BusItem, RouteItem } from "../app/_components/driver-trip/types";
import type { TripSetupResponse } from "../services/driverHelperApi";

const API_BUS_STATUS_TO_UI: Record<
  TripSetupResponse["buses"][number]["status"],
  BusItem["status"]
> = {
  available: "Available",
  in_use: "In Use",
  maintenance: "Maintenance",
};

export function apiBusToBusItem(
  b: TripSetupResponse["buses"][number]
): BusItem {
  const mapped =
    API_BUS_STATUS_TO_UI[b.status as keyof typeof API_BUS_STATUS_TO_UI];
  return {
    id: b.id,
    name: `Bus ${b.bus_number}`,
    licensePlate: b.number_plate?.trim() ? b.number_plate : "—",
    seats: b.capacity ?? 0,
    status: mapped ?? "Available",
  };
}

export function apiRouteToRouteItem(
  r: TripSetupResponse["routes"][number]
): RouteItem {
  return {
    id: r.id,
    name: r.route_name,
    stopsCount: r.stops_count,
    /** API does not expose ETA yet; time is set in step 3 (schedule). */
    duration: "Schedule",
    studentsCount: r.students_count,
    lockedByOtherDriverTrip: Boolean(r.locked_by_other_driver_trip),
  };
}
