import { useState, useEffect, useCallback } from "react";

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  body: string;
  entityId: number | null;
  entityType: string | null;
  read: boolean;
  createdAt: string;
}

const BASE = import.meta.env.BASE_URL ?? "/";

function apiUrl(path: string) {
  return `${BASE}api${path}`.replace(/\/\//g, "/");
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/notifications"), { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch {
      // silently ignore network errors
    } finally {
      setLoading(false);
    }
  }, []);

  const checkOverdue = useCallback(async () => {
    try {
      await fetch(apiUrl("/notifications/check-overdue"), {
        method: "POST",
        credentials: "include",
      });
      await fetchNotifications();
    } catch {
      // silently ignore
    }
  }, [fetchNotifications]);

  const markRead = useCallback(async (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await fetch(apiUrl(`/notifications/${id}/read`), {
        method: "POST",
        credentials: "include",
      });
    } catch { /* ignore */ }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await fetch(apiUrl("/notifications/read-all"), {
        method: "POST",
        credentials: "include",
      });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    // Initial load + overdue check
    checkOverdue();
    // Poll every 60 seconds for new notifications
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [checkOverdue, fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, loading, unreadCount, markRead, markAllRead, refetch: fetchNotifications };
}
