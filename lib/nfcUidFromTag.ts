/**
 * Extract UID string from react-native-nfc-manager tag event (Android sends hex from tag bytes).
 */
export function nfcUidFromTagEvent(tag: { id?: string | number[] } | null | undefined): string | null {
  if (!tag) return null;
  const raw = tag.id;
  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw.trim();
  }
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((b) => ("0" + (Number(b) & 0xff).toString(16)).slice(-2)).join("");
  }
  return null;
}
