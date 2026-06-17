import { Link, useLocation } from "react-router-dom";
import { Bell, Bookmark, LayoutGrid, Home } from "lucide-react";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import NotificationPanel from "./NotificationPanel";

export default function GhostNav({ user }) {
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    if (!user) return;
    base44.entities.Notification.filter({ user_id: user.id, is_read: false })
      .then(items => setUnreadCount(items.length))
      .catch(() => {});
  }, [user, notifOpen]);

  const navLinks = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/scanner", icon: LayoutGrid, label: "Scanner" },
    { path: "/watchlist", icon: Bookmark, label: "Watchlist" },
    { path: "/alerts", icon: null, label: "Alerts" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white pulse-dot" />
            <span className="font-display font-semibold tracking-tight text-white">Ghost</span>
          </Link>

          <div className="flex items-center gap-1">
            {navLinks.map(({ path, icon: NavIcon, label }) => (
              <Link
                key={path}
                to={path}
                className={`h-8 px-3 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive(path)
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {NavIcon && <NavIcon className="w-3.5 h-3.5" />}
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button
                  onClick={() => setNotifOpen(v => !v)}
                  className="relative w-8 h-8 flex items-center justify-center rounded hover:bg-white/5 transition-colors"
                >
                  <Bell className="w-4 h-4 text-white/50" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-ghost-green rounded-full" />
                  )}
                </button>
                <div className="text-xs text-white/30 font-mono border border-white/10 rounded px-2 py-1">
                  {user.full_name?.split(" ")[0] || "User"}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="h-8 px-4 bg-white text-black text-xs font-semibold rounded hover:bg-white/90 transition-all"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>

      {notifOpen && user && (
        <NotificationPanel userId={user.id} onClose={() => setNotifOpen(false)} />
      )}
    </>
  );
}