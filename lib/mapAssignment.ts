import type { MeAssignment } from "../services/driverHelperApi";
import type { BusItem, RouteItem } from "../app/_components/driver-trip/types";

export function assignmentToBusRoute(assignment: MeAssignment): {
  bus: BusItem;
  route: RouteItem;
} {
  // Helpers should see the bus identity; status from `/users/me` doesn't include operational status.
  // Default to "In Use" because the assignment exists when a driver has started/has an active trip.
  const bus: BusItem = {
    id: assignment.bus.id,
    name: `Bus ${assignment.bus.bus_number}`,
    licensePlate: assignment.bus.number_plate || "—",
    seats: 0,
    status: "In Use",
  };

  const r = assignment.route;
  const route: RouteItem = r
    ? {
        id: r.id,
        name: r.route_name,
        stopsCount: r.stops.length,
        duration: "—",
        studentsCount: 0,
      }
    : {
        id: "0",
        name: "Route",
        stopsCount: 0,
        duration: "—",
        studentsCount: 0,
      };

  return { bus, route };
}
