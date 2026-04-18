export type AttendanceStatus = "present" | "absent" | "pending";

export interface HelperStudentRow {
  id: string;
  name: string;
  grade: string;
  stopName: string;
  status: AttendanceStatus;
}
