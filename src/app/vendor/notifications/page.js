"use client";
import { useState } from "react";
import {
  Inbox, CalendarCheck, X, Star, CheckCircle, Package,
  CreditCard, DollarSign, MessageSquare, Bell, Settings,
  Check, ChevronRight,
} from "lucide-react";
import TopBar from "@/components/TopBar";

const SAMPLE_NOTIFICATIONS = [
  // Today
  { id: 1,  type: "inquiry",     icon: Inbox,         title: "New inquiry from Anna H.",         desc: "Anna Hovhannisyan sent an inquiry for Wedding Cake (3-tier) on Jun 15.",       time: "2m ago",   group: "Today",     unread: true  },
  { id: 2,  type: "booking",     icon: CalendarCheck, title: "Booking confirmed",                 desc: "Your booking BK-2038 with Sona Karapetyan has been confirmed.",               time: "35m ago",  group: "Today",     unread: true  },
  { id: 3,  type: "message",     icon: MessageSquare, title: "New message from Tigran A.",        desc: "Tigran Avetisyan: 'Is the DJ package available for outdoor events?'",          time: "1h ago",   group: "Today",     unread: true  },
  { id: 4,  type: "review",      icon: Star,          title: "New 5-star review",                 desc: "Anna Hovhannisyan left a 5-star review for your Wedding Cake service.",        time: "3h ago",   group: "Today",     unread: false },
  // Yesterday
  { id: 5,  type: "cancelled",   icon: X,             title: "Booking cancelled",                 desc: "BK-2037 (Karen Martirosyan - Office Event) has been cancelled by the client.", time: "Yesterday", group: "Yesterday", unread: false },
  { id: 6,  type: "payment",     icon: DollarSign,    title: "Payment received",                  desc: "You received $850 for order #ORD-1037. Funds are on their way.",              time: "Yesterday", group: "Yesterday", unread: true  },
  { id: 7,  type: "listing",     icon: Package,       title: "Listing approved",                  desc: "Your new listing 'Premium Wedding Cake Deluxe' has been approved.",            time: "Yesterday", group: "Yesterday", unread: false },
  // This Week
  { id: 8,  type: "profile",     icon: CheckCircle,   title: "Profile update approved",           desc: "Your business profile changes have been reviewed and approved by admin.",       time: "Apr 4",    group: "This Week", unread: false },
  { id: 9,  type: "subscription",icon: CreditCard,    title: "Subscription expiring soon",        desc: "Your Pro subscription expires in 18 days. Renew now to avoid disruption.",     time: "Apr 3",    group: "This Week", unread: true  },
  { id: 10, type: "review",      icon: Star,          title: "New review needs response",         desc: "Hayk Simonyan left a 3-star review. Responding improves your score.",          time: "Apr 3",    group: "This Week", unread: false },
  { id: 11, type: "system",      icon: Bell,          title: "Platform update",                   desc: "Salooote has launched new booking features. See what's new in your dashboard.", time: "Apr 2",    group: "This Week", unread: false },
  { id: 12, type: "inquiry",     icon: Inbox,         title: "Inquiry expired",                   desc: "Inquiry #INQ-495 from Davit H. expired without a response after 72 hours.",    time: "Apr 2",    group: "This Week", unread: false },
];

const FILTER_TABS = ["All", "Unread", "Inquiries", "Bookings", "Reviews", "System"];

const TYPE_FILTER_MAP = {
  Inquiries: ["inquiry"],
  Bookings:  ["booking", "cancelled"],
  Reviews:   ["review"],
  System:    ["system", "profile", "subscription", "listing", "payment"],
};

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
  system:       "bg-surface-100 text-surface-500",
};

export default function VendorNotifications() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [readSet, setReadSet] = useState(new Set(
    SAMPLE_NOTIFICATIONS.filter(n => !n.unread).map(n => n.id)
  ));

  const markAllRead = () => {
    setReadSet(new Set(SAMPLE_NOTIFICATIONS.map(n => n.id)));
  };

  const markRead = (id) => {
    setReadSet(prev => new Set([...prev, id]));
  };

  const isRead = (id) => readSet.has(id);

  const filtered = SAMPLE_NOTIFICATIONS.filter(n => {
    if (activeFilter === "Unread") return !isRead(n.id);
    if (activeFilter === "All")    return true;
    const types = TYPE_FILTER_MAP[activeFilter] || [];
    return types.includes(n.type);
  });

  const unreadCount = SAMPLE_NOTIFICATIONS.filter(n => !isRead(n.id)).length;

  // Group filtered notifications
  const groups = ["Today", "Yesterday", "This Week"];
  const grouped = groups.reduce((acc, g) => {
    const items = filtered.filter(n => n.group === g);
    if (items.length) acc[g] = items;
    return acc;
  }, {});

  const allRead = unreadCount === 0;

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        actions={
          <a
            href="/vendor/settings"
            className="flex items-center gap-1.5 text-xs font-medium text-surface-500 hover:text-surface-700 transition-colors"
          >
            <Settings size={13} /> Notification Settings
          </a>
        }
      />

      <main className="flex-1 p-6 max-w-3xl space-y-5">
        {/* Filter + Mark all */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {FILTER_TABS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                  activeFilter === f
                    ? "bg-primary-600 text-white border-primary-600"
                    : "bg-white text-surface-600 border-surface-200 hover:border-primary-300"
                }`}
              >
                {f}
                {f === "Unread" && unreadCount > 0 && (
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

        {/* Notification groups */}
        {Object.keys(grouped).length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-xl border border-surface-200 p-16 text-center">
            <div className="w-14 h-14 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check size={24} className="text-success-500" />
            </div>
            <p className="text-sm font-semibold text-surface-700">All caught up!</p>
            <p className="text-xs text-surface-400 mt-1">No notifications to show in this filter.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2 px-1">{group}</h3>
              <div className="bg-white rounded-xl border border-surface-200 overflow-hidden divide-y divide-surface-50">
                {items.map(n => {
                  const Icon = n.icon;
                  const read = isRead(n.id);
                  const iconStyle = ICON_BG[n.type] || "bg-surface-100 text-surface-400";

                  return (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`flex items-start gap-4 px-5 py-4 hover:bg-surface-50 transition-colors cursor-pointer ${
                        !read ? "bg-primary-50/40" : ""
                      }`}
                    >
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${iconStyle}`}>
                        <Icon size={16} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs leading-snug ${read ? "font-medium text-surface-700" : "font-semibold text-surface-900"}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-surface-400 flex-shrink-0 mt-0.5">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-surface-500 mt-0.5 leading-relaxed pr-4">{n.desc}</p>
                      </div>

                      {/* Unread dot */}
                      <div className="flex-shrink-0 mt-2">
                        {!read ? (
                          <span className="w-2 h-2 bg-primary-600 rounded-full block" />
                        ) : (
                          <span className="w-2 h-2 block" />
                        )}
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
