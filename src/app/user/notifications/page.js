"use client";
import { useState, useEffect } from "react";
import {
  Bell, MessageSquare, CalendarCheck, Star, CheckCircle,
  Package, CreditCard, DollarSign, X, Settings, Check,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import Link from "next/link";
import { userAPI } from "@/lib/api";
import { useLocale } from "@/lib/i18n";

const ICON_BG = {
  inquiry:      "bg-info-50 text-info-600",
  booking:      "bg-success-50 text-success-600",
  cancelled:    "bg-danger-50 text-danger-600",
  review:       "bg-warning-50 text-warning-600",
  profile:      "bg-success-50 text-success-600",
  listing:      "bg-primary-50 text-primary-600",
  subscription: "bg-warning-50 text-warning-600",
  payment:      "bg-success-50 text-success-600",
  message:      "bg-blue-50 text-blue-600",
  info:         "bg-info-50 text-info-600",
  success:      "bg-success-50 text-success-600",
  warning:      "bg-warning-50 text-warning-600",
  danger:       "bg-danger-50 text-danger-600",
  system:       "bg-surface-100 text-surface-500",
};

const TYPE_ICON = {
  inquiry:      MessageSquare,
  booking:      CalendarCheck,
  cancelled:    X,
  review:       Star,
  profile:      CheckCircle,
  listing:      Package,
  subscription: CreditCard,
  payment:      DollarSign,
  message:      MessageSquare,
  info:         Bell,
  success:      CheckCircle,
  warning:      Bell,
  danger:       X,
  system:       Bell,
};

const TYPE_FILTER_MAP = {
  messages: ["inquiry", "message"],
  bookings: ["booking", "cancelled"],
  reviews:  ["review"],
  system:   ["system", "profile", "subscription", "listing", "payment", "info", "success", "warning", "danger"],
};

function getGroupKey(iso) {
  if (!iso) return "this_week";
  const diff  = Date.now() - new Date(iso).getTime();
  const hours = diff / 3600000;
  if (hours < 24) return "today";
  if (hours < 48) return "yesterday";
  return "this_week";
}

const GROUP_LABELS = {
  today:     "Today",
  yesterday: "Yesterday",
  this_week: "This Week",
};

const GROUP_KEYS = ["today", "yesterday", "this_week"];

export default function UserNotifications() {
  const { t } = useLocale();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [activeFilter, setActiveFilter]   = useState("all");
  const [readSet, setReadSet]             = useState(new Set());

  const FILTER_TABS = [
    { value: "all",      label: t("common.all") || "All" },
    { value: "unread",   label: t("notifications.unread") || "Unread" },
    { value: "messages", label: "Messages" },
    { value: "bookings", label: "Bookings" },
    { value: "reviews",  label: "Reviews" },
    { value: "system",   label: t("notifications.system") || "System" },
  ];

  const timeAgo = (iso) => {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return "Yesterday";
    if (days < 7)  return `${days}d ago`;
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  useEffect(() => {
    userAPI.notifications({ limit: 50 })
      .then(res => {
        const list = res?.data || [];
        setNotifications(list);
        setReadSet(new Set(list.filter(n => n.is_read).map(n => n.id)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await userAPI.markAllNotifsRead();
      setReadSet(new Set(notifications.map(n => n.id)));
    } catch {}
  };

  const markRead = async (id) => {
    if (readSet.has(id)) return;
    setReadSet(prev => new Set([...prev, id]));
    try { await userAPI.markNotifRead(id); } catch {}
  };

  const isRead = (id) => readSet.has(id);

  const filtered = notifications.filter(n => {
    if (activeFilter === "unread") return !isRead(n.id);
    if (activeFilter === "all")    return true;
    const types = TYPE_FILTER_MAP[activeFilter] || [];
    return types.includes(n.type);
  });

  const unreadCount = notifications.filter(n => !isRead(n.id)).length;
  const allRead     = unreadCount === 0;

  const grouped = GROUP_KEYS.reduce((acc, key) => {
    const items = filtered.filter(n => getGroupKey(n.created_at) === key);
    if (items.length) acc[key] = items;
    return acc;
  }, {});

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        actions={
          <Link
            href="/user/settings"
            className="flex items-center gap-1.5 text-xs font-medium text-surface-500 hover:text-surface-700 transition-colors"
          >
            <Settings size={13} /> Notification Preferences
          </Link>
        }
      />

      <main className="flex-1 p-6 max-w-3xl space-y-5">

        {/* Filter tabs + Mark all */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTER_TABS.map(f => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                  activeFilter === f.value
                    ? "bg-primary-600 text-white border-primary-600"
                    : "bg-white text-surface-600 border-surface-200 hover:border-primary-300"
                }`}
              >
                {f.label}
                {f.value === "unread" && unreadCount > 0 && (
                  <span className="ml-1.5 bg-danger-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          {!allRead && (
            <button
              onClick={markAllRead}
              className="ml-auto flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer border-none"
            >
              <Check size={12} /> Mark all as read
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-surface-400">Loading…</div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="bg-white rounded-xl border border-surface-200 p-16 text-center">
            <div className="w-14 h-14 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check size={24} className="text-success-500" />
            </div>
            <p className="text-sm font-semibold text-surface-700">All caught up!</p>
            <p className="text-xs text-surface-400 mt-1">No notifications to show here.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([groupKey, items]) => (
            <div key={groupKey}>
              <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2 px-1">
                {GROUP_LABELS[groupKey] || groupKey}
              </h3>
              <div className="bg-white rounded-xl border border-surface-200 overflow-hidden divide-y divide-surface-50">
                {items.map(n => {
                  const read      = isRead(n.id);
                  const iconStyle = ICON_BG[n.type] || "bg-surface-100 text-surface-400";
                  const Icon      = TYPE_ICON[n.type] || Bell;

                  return (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`flex items-start gap-4 px-5 py-4 hover:bg-surface-50 transition-colors cursor-pointer ${
                        !read ? "bg-primary-50/40" : ""
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${iconStyle}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs leading-snug ${read ? "font-medium text-surface-700" : "font-semibold text-surface-900"}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-surface-400 flex-shrink-0 mt-0.5">{timeAgo(n.created_at)}</span>
                        </div>
                        <p className="text-[11px] text-surface-500 mt-0.5 leading-relaxed pr-4">{n.body}</p>
                      </div>
                      <div className="flex-shrink-0 mt-2">
                        {!read
                          ? <span className="w-2 h-2 bg-primary-600 rounded-full block" />
                          : <span className="w-2 h-2 block" />
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

      </main>
    </div>
  );
}
