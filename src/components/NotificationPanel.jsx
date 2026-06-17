import { useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, Bell, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const TYPE_COLORS = {
  opportunity: "text-ghost-green",
  price_drop: "text-ghost-amber",
  score_spike: "text-white",
  alert: "text-ghost-green",
  system: "text-white/40",
};

export default function NotificationPanel({ userId, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef();

  useEffect(() => {
    base44.entities.Notification.filter({ user_id: userId }, "-created_date", 20)
      .then(setNotifications)
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const markRead = async (id) => {
    await base44.entities.Notification.update(id, { is_read: true });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      className="fixed top-16 right-4 z-[100] w-80 glass-card rounded-lg border border-white/10 shadow-2xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
        <div className="flex items-center gap-2">
          <Bell className="w-3.5 h-3.5 text-white/40" />
          <span className="text-xs font-mono text-white/60 uppercase tracking-wider">Notifications</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={markAllRead} className="text-[10px] text-white/25 hover:text-white/50 font-mono transition-colors">
            Mark all read
          </button>
          <button onClick={onClose} className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/5">
            <X className="w-3 h-3 text-white/30" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="py-8 text-center text-xs text-white/20 font-mono">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-white/20 font-mono">No notifications yet</div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`px-4 py-3 border-b border-white/4 cursor-pointer hover:bg-white/3 transition-colors ${!n.is_read ? "bg-white/[0.02]" : ""}`}
            >
              <div className="flex items-start gap-2">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${!n.is_read ? "bg-ghost-green" : "bg-white/10"}`} />
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-semibold ${TYPE_COLORS[n.type] || "text-white"} mb-0.5`}>{n.title}</div>
                  <div className="text-[11px] text-white/35 leading-relaxed">{n.message}</div>
                  <div className="text-[10px] text-white/20 font-mono mt-1">
                    {formatDistanceToNow(new Date(n.created_date), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}