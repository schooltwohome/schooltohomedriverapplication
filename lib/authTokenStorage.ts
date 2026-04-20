import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "sthd_auth_token";

function webGet(): string | null {
  if (typeof globalThis === "undefined") return null;
  const ls = (globalThis as unknown as { localStorage?: Storage }).localStorage;
  return ls?.getItem(TOKEN_KEY) ?? null;
}

function webSet(value: string): void {
  const ls = (globalThis as unknown as { localStorage?: Storage }).localStorage;
  ls?.setItem(TOKEN_KEY, value);
}

function webRemove(): void {
  const ls = (globalThis as unknown as { localStorage?: Storage }).localStorage;
  ls?.removeItem(TOKEN_KEY);
}

export async function getAuthToken(): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      return webGet();
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setAuthToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    webSet(token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeAuthToken(): Promise<void> {
  try {
    if (Platform.OS === "web") {
      webRemove();
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}
