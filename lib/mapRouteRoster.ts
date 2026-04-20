import type { RouteRosterStudent } from "../services/driverHelperApi";
import type { HelperStudentRow } from "../app/_components/helper/rosterTypes";

export function mapRouteRosterToHelperRows(rows: RouteRosterStudent[]): HelperStudentRow[] {
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    grade: r.grade?.trim() ? r.grade : "—",
    stopName: r.stop_name,
    status: r.status,
  }));
}
