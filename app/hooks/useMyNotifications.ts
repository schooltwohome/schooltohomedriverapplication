import { useCallback, useState } from "react";
import {
  listMyNotifications,
  markAllMyNotificationsRead,
  type NotificationRow,
} from "../../services/driverHelperApi";
import { formatRelativeTime } from "../../lib/formatRelativeTime";

export type UiNotification = {
  id: string;
  title: string;
  message: string;
  timeLabel: string;
  isRead: boolean;
  kind: "info" | "success" | "alert";
};

function inferKind(title: string, message: string): UiNotification["kind"] {
  const t = `${title} ${message}`.toLowerCase();
  if (
    /delay|traffic|alert|warning|emergency|cancel|issue|late|detour/.test(t)
  ) {
    return "alert";
  }
  if (
    /safe|arrived|reached|marked|success|complete|boarded|picked|drop/.test(t)
  ) {
    return "success";
  }
  return "info";
}

function rowToUi(row: NotificationRow): UiNotification {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    timeLabel: formatRelativeTime(row.created_at),
    isRead: row.is_read,
    kind: inferKind(row.title, row.message),
  };
}

export function useMyNotifications(token: string | null) {
  const [items, setItems] = useState<UiNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await listMyNotifications(token, 50);
      setItems(rows.map(rowToUi));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load notifications");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const markAllRead = useCallback(async () => {
    if (!token) return;
    try {
      await markAllMyNotificationsRead(token);
      await refresh();
    } catch {
      // keep UI; user can retry
    }
  }, [token, refresh]);

  const unreadCount = items.filter((n) => !n.isRead).length;

  return {
    items,
    loading,
    error,
    refresh,
    markAllRead,
    unreadCount,
  };
}

// Default export added to satisfy Expo Router typed-routes scanning.
export default useMyNotifications;
