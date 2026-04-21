"use client";
import { useState, useEffect } from "react";
import {
  Calendar, Heart, MessageSquare, CheckCircle,
  Star, Bell, ChevronRight, Package, ShoppingBag, Clock,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import StatsCard from "@/components/StatsCard";
import Link from "next/link";
import { authAPI, userAPI } from "@/lib/api";

const STATUS_BADGE = {
  pending:    "badge badge-warning",
  confirmed:  "badge badge-info",
  processing: "badge badge-info",
  shipped:    "badge badge-purple",
  delivered:  "badge badge-success",
  cancelled:  "badge badge-danger",
};

const NOTIF_BG = {
  inquiry:  "bg-blue-50 text-blue-500",
  booking:  "bg-green-50 text-green-500",
  review:   "bg-yellow-50 text-yellow-500",
  message:  "bg-violet-50 text-violet-500",
  system:   "bg-surface-100 text-surface-500",
  info:     "bg-blue-50 text-blue-500",
  success:  "bg-green-50 text-green-500",
  warning:  "bg-yellow-50 text-yellow-500",
};

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
  return `${days}d ago`;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function shortId(id) {
  return id ? id.slice(-8).toUpperCase() : "—";
}

export default function UserDashboard() {
  const [user, setUser]           = useState(null);
  const [orders, setOrders]       = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [notifs, setNotifs]       = useState([]);
  const [saved, setSaved]         = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.allSettled([
      authAPI.me(),
      userAPI.orders({ limit: 3 }),
      userAPI.inquiries({ limit: 3 }),
      userAPI.notifications({ limit: 5 }),
      userAPI.saved({ limit: 1 }),
    ]).then(([uRes, oRes, iRes, nRes, sRes]) => {
      if (uRes.status === "fulfilled") {
        const d = uRes.value?.data || uRes.value;
        setUser(d);
      }
      if (oRes.status === "fulfilled") setOrders(oRes.value?.data || []);
      if (iRes.status === "fulfilled") setInquiries(iRes.value?.data || []);
      if (nRes.status === "fulfilled") setNotifs(nRes.value?.data || []);
      // For saved count we need a separate call with pagination meta
      if (sRes.status === "fulfilled") {
        const d = sRes.value;
        setSaved(d?.meta?.total ?? (d?.data?.length ?? 0));
      }
    }).finally(() => setLoading(false));
  }, []);

  const firstName = user ? (user.first_name || user.email?.split("@")[0] || "there") : "…";
  const unreadNotifs = notifs.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex flex-col flex-1 min-h-screen bg-surface-50 items-center justify-center">
        <p className="text-sm text-surface-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title="My Dashboard" subtitle={`Welcome back, ${firstName}!`} />

      <main className="flex-1 p-6 space-y-6">

        {/* Quick Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard
            label="My Orders"
            value={orders.length > 0 ? orders.length : "0"}
            icon={ShoppingBag}
            iconBg="bg-violet-50"
            iconColor="text-violet-500"
          />
          <StatsCard
            label="Saved Items"
            value={typeof saved === "number" ? saved : "0"}
            icon={Heart}
            iconBg="bg-pink-50"
            iconColor="text-pink-500"
          />
          <StatsCard
            label="Active Inquiries"
            value={inquiries.filter(i => !["cancelled", "closed", "completed"].includes(i.status)).length}
            icon={MessageSquare}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
          />
          <StatsCard
            label="Notifications"
            value={unreadNotifs}
            icon={Bell}
            iconBg="bg-yellow-50"
            iconColor="text-yellow-500"
          />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left — Recent Orders + Inquiries */}
          <div className="xl:col-span-2 space-y-6">

            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-surface-900">Recent Orders</h2>
                <Link href="/user/orders" className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
                  View all <ChevronRight size={12} />
                </Link>
              </div>
              {orders.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-surface-400">
                  No orders yet.
                </div>
              ) : (
                <div className="divide-y divide-surface-50">
                  {orders.map(order => {
                    const badgeCls = STATUS_BADGE[order.status?.toLowerCase()] || "badge badge-gray";
                    return (
                      <div key={order.id} className="px-5 py-4 flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                          <Package size={15} className="text-primary-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-surface-900 truncate">
                            Order #{shortId(order.id)}
                          </p>
                          <p className="text-xs text-surface-400 truncate">
                            {order.vendor_name || `Vendor …${order.vendor_id?.slice(-4) || ""}`}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={badgeCls}>{order.status}</span>
                          {order.total != null && (
                            <span className="text-xs font-bold text-primary-600">
                              {order.currency?.toUpperCase() || ""} {order.total}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-surface-400 flex-shrink-0">{formatDate(order.created_at)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Inquiries */}
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-surface-900">Recent Inquiries</h2>
                <Link href="/user/inquiries" className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
                  View all <ChevronRight size={12} />
                </Link>
              </div>
              {inquiries.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-surface-400">
                  No inquiries yet.{" "}
                  <Link href="/user/inquiries" className="text-primary-600 font-medium">Send one</Link>
                </div>
              ) : (
                <div className="divide-y divide-surface-50">
                  {inquiries.map(inq => {
                    const status = inq.status?.toLowerCase() || "new";
                    const badgeCls = {
                      new:       "badge badge-info",
                      replied:   "badge badge-purple",
                      confirmed: "badge badge-success",
                      cancelled: "badge badge-danger",
                      closed:    "badge badge-gray",
                    }[status] || "badge badge-gray";
                    return (
                      <div key={inq.id} className="px-5 py-4 flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <MessageSquare size={15} className="text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-surface-900 truncate">
                            {inq.subject || "(No subject)"}
                          </p>
                          <p className="text-xs text-surface-400 truncate">
                            Vendor: {inq.vendor_id?.slice(-8) || "—"}
                          </p>
                        </div>
                        <span className={badgeCls}>{inq.status || "new"}</span>
                        <span className="text-xs text-surface-400 flex-shrink-0">{timeAgo(inq.created_at)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right — Recent Activity (Notifications) */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-surface-900">Recent Activity</h2>
                <Link href="/user/notifications" className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
                  View all <ChevronRight size={12} />
                </Link>
              </div>
              {notifs.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-surface-400">
                  No notifications.
                </div>
              ) : (
                <div className="divide-y divide-surface-50">
                  {notifs.map(n => {
                    const iconCls = NOTIF_BG[n.type] || "bg-surface-100 text-surface-500";
                    const isUnread = !n.is_read;
                    return (
                      <div key={n.id} className={`px-5 py-3.5 flex items-start gap-3 ${isUnread ? "bg-primary-50/30" : ""}`}>
                        <div className={`w-8 h-8 rounded-lg ${iconCls} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Bell size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs leading-snug ${isUnread ? "font-semibold text-surface-900" : "font-medium text-surface-700"}`}>
                            {n.title}
                          </p>
                          {n.body && (
                            <p className="text-[11px] text-surface-400 mt-0.5 line-clamp-1">{n.body}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-primary-600 block" />}
                          <span className="text-[10px] text-surface-400">{timeAgo(n.created_at)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl border border-surface-200 p-5">
              <h2 className="text-sm font-semibold text-surface-900 mb-4">Quick Links</h2>
              <div className="space-y-2">
                {[
                  { href: "/user/saved",        label: "My Saved Items",    icon: Heart,          color: "text-pink-500",   bg: "bg-pink-50" },
                  { href: "/user/orders",        label: "My Orders",         icon: ShoppingBag,    color: "text-violet-500", bg: "bg-violet-50" },
                  { href: "/user/inquiries",     label: "My Inquiries",      icon: MessageSquare,  color: "text-blue-500",   bg: "bg-blue-50" },
                  { href: "/user/reviews",       label: "My Reviews",        icon: Star,           color: "text-yellow-500", bg: "bg-yellow-50" },
                  { href: "/user/notifications", label: "Notifications",     icon: Bell,           color: "text-surface-500", bg: "bg-surface-100" },
                ].map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-50 transition-colors group"
                  >
                    <div className={`w-7 h-7 rounded-lg ${link.bg} flex items-center justify-center flex-shrink-0`}>
                      <link.icon size={13} className={link.color} />
                    </div>
                    <span className="text-sm text-surface-700 group-hover:text-surface-900 transition-colors">{link.label}</span>
                    <ChevronRight size={13} className="ml-auto text-surface-300 group-hover:text-surface-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
