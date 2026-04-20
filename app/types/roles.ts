export type UserRole = "driver" | "helper";

export function normalizeRole(role: string | null | undefined): UserRole | null {
  const r = (role || "").toLowerCase();
  if (r === "driver") return "driver";
  if (r === "helper") return "helper";
  return null;
}
