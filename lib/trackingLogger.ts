type TrackingLogLevel = "info" | "warn" | "error";

export type TrackingLogEntry = {
  id: string;
  level: TrackingLogLevel;
  event: string;
  message: string;
  createdAtMs: number;
  data?: Record<string, unknown>;
};

const MAX_BUFFER = 200;
const buffer: TrackingLogEntry[] = [];
const listeners = new Set<() => void>();

function emit(): void {
  for (const fn of listeners) fn();
}

function push(level: TrackingLogLevel, event: string, message: string, data?: Record<string, unknown>): void {
  const entry: TrackingLogEntry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
    level,
    event,
    message,
    createdAtMs: Date.now(),
    data,
  };
  buffer.push(entry);
  if (buffer.length > MAX_BUFFER) {
    buffer.splice(0, buffer.length - MAX_BUFFER);
  }
  if (__DEV__) {
    const method = level === "error" ? "error" : level === "warn" ? "warn" : "log";
    console[method](`[Tracking:${event}] ${message}`, data ?? {});
  }
  emit();
}

export function logTrackingInfo(event: string, message: string, data?: Record<string, unknown>): void {
  push("info", event, message, data);
}

export function logTrackingWarn(event: string, message: string, data?: Record<string, unknown>): void {
  push("warn", event, message, data);
}

export function logTrackingError(event: string, message: string, data?: Record<string, unknown>): void {
  push("error", event, message, data);
}

export function getTrackingLogs(limit = 50): TrackingLogEntry[] {
  if (limit <= 0) return [];
  const n = Math.min(limit, buffer.length);
  return buffer.slice(buffer.length - n).reverse();
}

export function subscribeTrackingLogs(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

