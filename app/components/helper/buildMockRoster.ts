import { RouteItem } from "../driver-trip/types";
import { AttendanceStatus, HelperStudentRow } from "./rosterTypes";

const FIRST_NAMES = [
  "Aarav", "Diya", "Vihaan", "Ananya", "Arjun", "Isha", "Reyansh", "Saanvi",
  "Kabir", "Meera", "Rohan", "Kavya", "Aditya", "Pari", "Yash", "Navya",
  "Dev", "Riya", "Krish", "Tara", "Neil", "Zara", "Vivaan", "Ira",
];

const LAST_NAMES = [
  "Sharma", "Patel", "Nair", "Reddy", "Iyer", "Menon", "Das", "Kapoor",
];

const STOPS = [
  "Stop A — Oak Lane",
  "Stop B — Maple St",
  "Stop C — River View",
  "Stop D — Hill Park",
  "Stop E — School Gate",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pickStatus(seed: number, index: number): AttendanceStatus {
  const x = (seed + index * 17) % 100;
  if (x < 58) return "present";
  if (x < 82) return "pending";
  return "absent";
}

export function buildMockRoster(route: RouteItem): HelperStudentRow[] {
  const seed = hashString(`${route.id}-${route.name}`);
  const n = Math.min(Math.max(route.studentsCount, 1), 40);

  const rows: HelperStudentRow[] = [];
  for (let i = 0; i < n; i += 1) {
    const fi = (seed + i * 3) % FIRST_NAMES.length;
    const li = (seed + i * 7) % LAST_NAMES.length;
    const name = `${FIRST_NAMES[fi]} ${LAST_NAMES[li]}`;
    const gradeNum = 1 + ((seed + i) % 12);
    const grade = `Grade ${gradeNum}`;
    const stopName = STOPS[(seed + i) % STOPS.length];
    const status = pickStatus(seed, i);

    rows.push({
      id: `${route.id}-stu-${i + 1}`,
      name,
      grade,
      stopName,
      status,
    });
  }

  return rows;
}
