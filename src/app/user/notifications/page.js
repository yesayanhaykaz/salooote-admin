"use client";
import { useState } from "react";
import {
  MessageSquare, CheckCircle, Calendar, Tag, Star, Percent,
  X, Settings, BellOff
} from "lucide-react";
import TopBar from "@/components/TopBar";
import Link from "next/link";

const TABS = ["All", "Unread", "Vendor Replies", "Bookings", "Reminders", "Offers"];

const NOTIFICATIONS_RAW = [
  {
    id: 1,
    group: "Today",
    type: "Vendor Replies",
    icon: MessageSquare,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-500",
    title: "DJ Arman replied to your inquiry",
    description: "\"Hi Anna! Absolutely, we specialize in Armenian & international mix. Our 6-hour package is $580 all-inclusive.\"",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: 2,
    group: "Today",
    type: "Vendor Replies",
    icon: MessageSquare,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    title: "Artisan Flowers sent you a message",
    description: "\"Thank you for your inquiry! We'd love to create your floral arrangements. Our bridal bouquet starts from $150.\"",
    time: "4 hours ago",
    unread: true,
  },
  {
    id: 3,
    group: "Today",
    type: "Bookings",
    icon: CheckCircle,
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
    title: "Booking Confirmed — Sweet Dreams Bakery",
    description: "Your 3-tier wedding cake order has been confirmed for June 15, 2025. Contact them at least 2 weeks before for final adjustments.",
    time: "6 hours ago",
    unread: true,
  },
  {
    id: 4,
    group: "Yesterday",
    type: "Reminders",
    icon: Calendar,
    iconBg: "bg-yellow-50",
    iconColor: "text-yellow-500",
    title: "30 days to your wedding!",
    description: "Your wedding is coming up in 30 days. Make sure your remaining bookings (DJ, flowers) are confirmed. Open your planner to review tasks.",
    time: "Yesterday, 9:00 AM",
    unread: true,
  },
  {
    id: 5,
    group: "Yesterday",
    type: "Offers",
    icon: Tag,
    iconBg: "bg-pink-50",
    iconColor: "text-pink-500",
    title: "Special offer from Golden Hour Catering",
    description: "You saved Golden Hour Catering. They're offering 10% off for weddings booked this month. Don't miss this limited-time deal!",
    time: "Yesterday, 2:30 PM",
    unread: false,
  },
  {
    id: 6,
    group: "This Week",
    type: "Bookings",
    icon: Star,
    iconBg: "bg-yellow-50",
    iconColor: "text-yellow-500",
    title: "Review request — Nairi Catering Co.",
    description: "Your birthday party catering service was completed. Share your experience and help other users find the best vendors.",
    time: "Apr 4",
    unread: false,
  },
  {
    id: 7,
    group: "This Week",
    type: "Offers",
    icon: Percent,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-500",
    title: "Upgrade to Premium — 20% Off",
    description: "Get access to exclusive vendor deals, priority support, and unlimited event planning tools. Offer ends April 15.",
    time: "Apr 3",
    unread: false,
  },
  {
    id: 8,
    group: "This Week",
    type: "Reminders",
    icon: Calendar,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    title: "Lilit's Birthday in 26 days",
    description: "Don't forget to confirm your catering and DJ bookings for Lilit's birthday party on May 3.",
    time: "Apr 2",
    unread: false,
  },
  {
    id: 9,
    group: "This Week",
    type: "Vendor Replies",
    icon: MessageSquare,
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
    title: "Elite Photography confirmed your booking",
    description: "Your full-day wedding photography booking for June 15, 2025 has been confirmed. A photographer brief will be sent 1 week before.",
    time: "Apr 1",
    unread: false,
  },
  {
    id: 10,
    group: "This Week",
    type: "Offers",
    icon: Tag,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    title: "New vendor recommendation for you",
    description: "Based on your upcoming wedding, we found Grand Floral Studio — rated 4.9 with over 200 reviews. Check them out!",
    time: "Mar 31",
    unread: false,
  },
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [dismissed, setDismissed] = useState([]);
  const [readIds, setReadIds] = useState([]);

  function dismiss(id) { setDismissed(prev => [...prev, id]); }
  function markRead(id) { setReadIds(prev => [...prev, id]); }
  function markAllRead() { setReadIds(NOTIFICATIONS_RAW.map(n => n.id)); }

  const visible = NOTIFICATIONS_RAW.filter(n => {
    if (dismissed.includes(n.id)) return false;
    if (activeTab === "All") return true;
    if (activeTab === "Unread") return n.unread && !readIds.includes(n.id);
    return n.type === activeTab;
  });

  const groups = ["Today", "Yesterday", "This Week"];
  const unreadCount = NOTIFICATIONS_RAW.filter(n => n.unread && !readIds.includes(n.id) && !dismissed.includes(n.id)).length;

  function tabCount(tab) {
    if (tab === "All") return NOTIFICATIONS_RAW.filter(n => !dismissed.includes(n.id)).length;
    if (tab === "Unread") return unreadCount;
    return NOTIFICATIONS_RAW.filter(n => !dismissed.includes(n.id) && n.type === tab).length;
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        actions={
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="text-xs font-medium text-primary-600 border border-primary-200 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Mark all as read
          </button>
        }
      />

      <main className="flex-1 p-6 space-y-5">

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-xl px-2 py-1.5 overflow-x-auto w-fit">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === tab ? "bg-primary-600 text-white" : "text-surface-500 hover:bg-surface-100"
              }`}
            >
              {tab}
              {tabCount(tab) > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab ? "bg-white/20 text-white" : "bg-surface-100 text-surface-500"}`}>
                  {tabCount(tab)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="space-y-5 max-w-2xl">
          {visible.length === 0 ? (
            <div className="bg-white rounded-xl border border-surface-200 flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 bg-surface-100 rounded-2xl flex items-center justify-center mb-3">
                <BellOff size={24} className="text-surface-400" />
              </div>
              <p className="text-sm font-semibold text-surface-600">No notifications here</p>
              <p className="text-xs text-surface-400 mt-1">
                {activeTab === "Unread" ? "You have no unread notifications." : "Nothing to show in this category."}
              </p>
            </div>
          ) : (
            groups.map(group => {
              const items = visible.filter(n => n.group === group);
              if (items.length === 0) return null;
              return (
                <div key={group}>
                  <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">{group}</p>
                  <div className="bg-white rounded-xl border border-surface-200 divide-y divide-surface-50 overflow-hidden">
                    {items.map(notif => {
                      const isUnread = notif.unread && !readIds.includes(notif.id);
                      return (
                        <div
                          key={notif.id}
                          onClick={() => markRead(notif.id)}
                          className={`px-4 py-4 flex items-start gap-3 transition-colors cursor-pointer hover:bg-surface-50 ${isUnread ? "bg-primary-50/40" : ""}`}
                        >
                          <div className={`w-9 h-9 rounded-xl ${notif.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <notif.icon size={16} className={notif.iconColor} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm font-semibold ${isUnread ? "text-surface-900" : "text-surface-700"}`}>
                                {notif.title}
                              </p>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {isUnread && <div className="w-2 h-2 rounded-full bg-primary-600 flex-shrink-0" />}
                                <span className="text-[11px] text-surface-400">{notif.time}</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); dismiss(notif.id); }}
                                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-surface-200 transition-colors"
                                >
                                  <X size={12} className="text-surface-400" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-surface-500 mt-0.5 leading-relaxed line-clamp-2">{notif.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Notification Preferences Link */}
        <div className="max-w-2xl">
          <Link
            href="/user/settings"
            className="flex items-center gap-2 text-xs text-surface-500 hover:text-primary-600 transition-colors"
          >
            <Settings size={13} />
            Manage notification preferences
          </Link>
        </div>

      </main>
    </div>
  );
}
