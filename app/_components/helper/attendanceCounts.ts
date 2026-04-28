import { HelperStudentRow } from "./rosterTypes";

export function countAttendanceStatuses(students: HelperStudentRow[]) {
  let present = 0;
  let pending = 0;
  let absent = 0;
  for (const s of students) {
    if (s.status === "present") present += 1;
    else if (s.status === "pending") pending += 1;
    else absent += 1;
  }
  return { present, pending, absent };
}

// Default export added to satisfy Expo Router typed-routes scanning.
export default {};
