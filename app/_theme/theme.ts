/**
 * App theme: white surfaces, yellow accents, black typography.
 */
export const Theme = {
  bg: "#FFFFFF",
  bgMuted: "#FAFAFA",
  bgElevated: "#FFFFFF",

  text: "#000000",
  textSecondary: "#404040",
  textMuted: "#525252",

  yellow: "#EAB308",
  yellowBright: "#FACC15",
  yellowDark: "#CA8A04",
  yellowSoft: "#FEF9C3",
  yellowSurface: "#FFFBEB",

  border: "#E5E5E5",
  borderStrong: "#D4D4D4",

  success: "#16A34A",
  danger: "#DC2626",
} as const;

export type ThemeType = typeof Theme;
