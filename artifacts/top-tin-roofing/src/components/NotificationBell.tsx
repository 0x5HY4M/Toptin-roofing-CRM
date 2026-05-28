import { useState, useRef, useEffect } from "react";
import { Bell, X, CheckCheck, AlertCircle, UserPlus, Receipt } from "lucide-react";
import { useNotifications, type AppNotification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

function NotifIcon({ type }: { type: string }) {
  if (type === "new_lead") return <UserPlus className="h-3.5 w-3.5 text-primary" />;
  if (type === "overdue_invoice") return <Receipt className="h-3.5 w-3.5 text-destructive" />;
  if (type === "payment_received") return <Receipt className="h-3.5 w-3.5 text-secondary" />;
  return <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />;
}

function NotifDot({ type }: { type: string }) {
  if (type === "new_lead") return "bg-primary";
  if (type === "overdue_invoice") return "bg-destructive";
  if (type === "payment_received") return "bg-secondary";
  return "bg-muted-foreground";
}

function NotifItem({ n, onRead }: { n: AppNotification; onRead: (id: number) => void }) {
  return (
    <button
      className={cn(
        "w-full text-left px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors",
        !n.read && "bg-primary/5"
      )}
      onClick={() => onRead(n.id)}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
          !n.read ? "bg-white/10" : "bg-white/5"
        )}>
          <NotifIcon type={n.type} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={cn("text-xs font-semibold truncate", n.read ? "text-muted-foreground" : "text-foreground")}>
              {n.title}
            </p>
            {!n.read && <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", NotifDot({ type: n.type }))} />}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">{n.body}</p>
          <p className="text-[10px] text-muted-foreground/50 mt-1">
            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </button>
  );
}

export function NotificationBell({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive border border-background animate-pulse" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-[420px] glass border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bell className="h-3.5 w-3.5 text-primary" />
              <span className="text-sm font-semibold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-destructive/20 text-destructive border border-destructive/20">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  <CheckCheck className="h-3 w-3" />
                  All read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <Bell className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                <p className="text-xs text-muted-foreground/60">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <NotifItem key={n.id} n={n} onRead={markRead} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
