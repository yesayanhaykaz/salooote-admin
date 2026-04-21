"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Bell, Check, X, Inbox, CalendarCheck, Star } from "lucide-react";
import { useLocale, LANGUAGES } from "@/lib/i18n";
import { vendorAPI } from "@/lib/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const NOTIF_STYLE = {
  inquiry:      "bg-blue-50 text-blue-600",
  booking:      "bg-success-50 text-success-600",
  cancelled:    "bg-danger-50 text-danger-600",
  review:       "bg-warning-50 text-warning-600",
  subscription: "bg-orange-50 text-orange-500",
  payment:      "bg-success-50 text-success-600",
  system:       "bg-surface-100 text-surface-500",
  info:         "bg-blue-50 text-blue-600",
  success:      "bg-success-50 text-success-600",
  warning:      "bg-warning-50 text-warning-600",
  danger:       "bg-danger-50 text-danger-600",
};

const NOTIF_ICON = {
  inquiry: Inbox,
  booking: CalendarCheck,
  review:  Star,
};

// ─── TopBar ───────────────────────────────────────────────────────────────────

export default function TopBar({ title, subtitle, actions }) {
  const { locale, setLocale, t } = useLocale();

  // Notifications state
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [notifs,      setNotifs]      = useState([]);
  const [readSet,     setReadSet]     = useState(new Set());
  const [notifFilter, setNotifFilter] = useState("all");
  const panelRef = useRef(null);

  // Fetch on mount
  useEffect(() => {
    vendorAPI.notifications({ limit: 30 })
      .then(res => {
        const list = res?.data || [];
        setNotifs(list);
        setReadSet(new Set(list.filter(n => n.is_read).map(n => n.id)));
      })
      .catch(() => {});
  }, []);

  // Close panel on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const handle = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [notifOpen]);

  const unreadCount = notifs.filter(n => !readSet.has(n.id)).length;

  const filtered = notifFilter === "unread"
    ? notifs.filter(n => !readSet.has(n.id))
    : notifs;

  const markRead = async (id) => {
    if (readSet.has(id)) return;
    setReadSet(prev => new Set([...prev, id]));
    try { await vendorAPI.markNotifRead(id); } catch {}
  };

  const markAllRead = async () => {
    try {
      await vendorAPI.markAllNotifsRead();
      setReadSet(new Set(notifs.map(n => n.id)));
    } catch {}
  };

  return (
    <header className="h-14 bg-white border-b border-surface-200 flex items-center px-6 gap-4 flex-shrink-0">

      {/* Title */}
      <div className="flex-1">
        <h1 className="text-base font-bold text-surface-900 leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-surface-400 mt-0.5">{subtitle}</p>}
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center bg-surface-50 rounded-lg px-3 py-2 border border-surface-200 w-[220px] gap-2 focus-within:border-primary-400 transition-colors">
        <Search size={14} className="text-surface-400 flex-shrink-0" />
        <input
          placeholder="Search…"
          className="flex-1 bg-transparent border-none outline-none text-sm text-surface-700 placeholder:text-surface-400"
        />
      </div>

      {/* Actions */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}

      {/* Language switcher */}
      <div className="flex items-center bg-surface-100 rounded-lg p-0.5 gap-0.5">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer border-none ${
              locale === lang.code
                ? "bg-white text-surface-900 shadow-sm"
                : "text-surface-400 hover:text-surface-600 bg-transparent"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Notifications Bell + Dropdown */}
      <div className="relative" ref={panelRef}>
        <button
          onClick={() => setNotifOpen(o => !o)}
          className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors border-none cursor-pointer ${
            notifOpen ? "bg-surface-100" : "hover:bg-surface-100 bg-transparent"
          }`}
        >
          <Bell size={16} className={notifOpen ? "text-primary-600" : "text-surface-500"} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[15px] h-[15px] bg-danger-500 rounded-full flex items-center justify-center px-0.5">
              <span className="text-white text-[8px] font-bold leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </span>
          )}
        </button>

        {/* Dropdown Panel */}
        {notifOpen && (
          <div className="absolute right-0 top-[42px] w-[380px] bg-white rounded-xl border border-surface-200 shadow-elevated z-50 overflow-hidden">

            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-surface-900">{t("notifications.title")}</h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-danger-500 text-white text-[9px] font-bold rounded-full leading-none">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:text-primary-700 cursor-pointer bg-transparent border-none px-2 py-1 rounded-md hover:bg-primary-50 transition-colors"
                  >
                    <Check size={10} /> {t("notifications.mark_all_read")}
                  </button>
                )}
                <button
                  onClick={() => setNotifOpen(false)}
                  className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-surface-100 cursor-pointer border-none bg-transparent"
                >
                  <X size={13} className="text-surface-400" />
                </button>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-surface-50 bg-surface-50/60">
              {[
                { key: "all",    label: t("common.all") },
                { key: "unread", label: unreadCount > 0 ? `${t("notifications.unread")} (${unreadCount})` : t("notifications.unread") },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setNotifFilter(f.key)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                    notifFilter === f.key
                      ? "bg-primary-600 text-white border-primary-600"
                      : "bg-white text-surface-600 border-surface-200 hover:border-primary-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Notification list */}
            <div className="max-h-[340px] overflow-y-auto divide-y divide-surface-50">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                  <div className="w-10 h-10 bg-success-50 rounded-full flex items-center justify-center">
                    <Check size={18} className="text-success-500" />
                  </div>
                  <p className="text-xs font-semibold text-surface-600">{t("notifications.all_caught_up")}!</p>
                  <p className="text-[11px] text-surface-400">{t("notifications.empty_text")}</p>
                </div>
              ) : (
                filtered.map(n => {
                  const read = readSet.has(n.id);
                  const style = NOTIF_STYLE[n.type] || "bg-surface-100 text-surface-500";
                  const Icon = NOTIF_ICON[n.type] || Bell;
                  return (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-surface-50 cursor-pointer transition-colors ${!read ? "bg-primary-50/40" : ""}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${style}`}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-snug ${read ? "font-medium text-surface-700" : "font-semibold text-surface-900"}`}>
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="text-[11px] text-surface-500 mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                        )}
                        <span className="text-[10px] text-surface-400 mt-0.5 block">{timeAgo(n.created_at)}</span>
                      </div>
                      {!read && (
                        <span className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-surface-100 bg-surface-50/60 text-center">
              <a
                href="/vendor/notifications"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                {t("notifications.view_all")}
              </a>
            </div>
          </div>
        )}
      </div>

    </header>
  );
}
