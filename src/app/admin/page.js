"use client";
import {
  DollarSign, ShoppingBag, Users, Store,
  Calendar, CreditCard, UserPlus, Clock,
  Star, CheckCircle, XCircle,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import TopBar from "@/components/TopBar";
import StatsCard from "@/components/StatsCard";
import {
  REVENUE_DATA, USER_GROWTH, SAMPLE_BOOKINGS, SAMPLE_VENDORS,
  CATEGORY_DATA, SUPPORT_TICKETS,
} from "@/lib/data";

function StatusBadge({ status }) {
  const map = {
    confirmed:   "badge badge-success",
    pending:     "badge badge-warning",
    negotiating: "badge badge-info",
    cancelled:   "badge badge-danger",
    open:        "badge badge-danger",
    in_progress: "badge badge-info",
    resolved:    "badge badge-success",
  };
  const labels = {
    confirmed: "Confirmed",
    pending: "Pending",
    negotiating: "Negotiating",
    cancelled: "Cancelled",
    open: "Open",
    in_progress: "In Progress",
    resolved: "Resolved",
  };
  return (
    <span className={map[status] || "badge badge-gray"}>
      {labels[status] || status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const map = {
    high:   "badge badge-danger",
    medium: "badge badge-warning",
    low:    "badge badge-info",
  };
  return (
    <span className={map[priority] || "badge badge-gray"}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

const PENDING_VENDORS = [
  { id: 3, name: "Party Planet",  category: "Party & Decor",  city: "Gyumri",   submitted: "Apr 2, 2025" },
  { id: 7, name: "Lense & Light", category: "Photography",    city: "Yerevan",  submitted: "Apr 3, 2025" },
  { id: 9, name: "Elegant Events",category: "Event Planning", city: "Yerevan",  submitted: "Apr 4, 2025" },
];

export default function AdminDashboard() {
  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Dashboard" subtitle="Welcome back, Admin" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">

        {/* Row 1 — 8 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-4">
          <StatsCard
            label="Total Revenue"
            value="$78,400"
            change={12.5}
            changeLabel="vs last month"
            icon={DollarSign}
            iconBg="bg-pink-50"
            iconColor="text-pink-500"
          />
          <StatsCard
            label="Total Orders"
            value="1,247"
            change={8.2}
            changeLabel="vs last month"
            icon={ShoppingBag}
            iconBg="bg-violet-50"
            iconColor="text-violet-500"
          />
          <StatsCard
            label="Total Users"
            value="3,891"
            change={15.1}
            changeLabel="vs last month"
            icon={Users}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
          />
          <StatsCard
            label="Active Vendors"
            value="48"
            change={3.4}
            changeLabel="vs last month"
            icon={Store}
            iconBg="bg-green-50"
            iconColor="text-green-500"
          />
          <StatsCard
            label="Total Bookings"
            value="889"
            change={9.7}
            changeLabel="vs last month"
            icon={Calendar}
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
          />
          <StatsCard
            label="Monthly MRR"
            value="$1,420"
            change={5.3}
            changeLabel="vs last month"
            icon={CreditCard}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-500"
          />
          <StatsCard
            label="New This Week"
            value="142"
            change={22.0}
            changeLabel="users joined"
            icon={UserPlus}
            iconBg="bg-teal-50"
            iconColor="text-teal-500"
          />
          <StatsCard
            label="Pending Approvals"
            value="7"
            icon={Clock}
            iconBg="bg-orange-50"
            iconColor="text-orange-500"
          />
        </div>

        {/* Row 2 — Revenue + User Growth charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl border border-surface-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-surface-900">Revenue Overview</h2>
                <p className="text-xs text-surface-400 mt-0.5">Monthly revenue — last 7 months</p>
              </div>
              <span className="badge badge-purple">Last 7 months</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={REVENUE_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: 12 }}
                  formatter={v => [`$${v.toLocaleString()}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2.5} fill="url(#revGrad)"
                  dot={{ fill: "#7c3aed", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#7c3aed" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white rounded-xl border border-surface-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-surface-900">User Growth</h2>
                <p className="text-xs text-surface-400 mt-0.5">Total registered users — last 7 months</p>
              </div>
              <span className="badge badge-info">Users</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={USER_GROWTH} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: 12 }}
                  formatter={v => [v.toLocaleString(), "Users"]}
                />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2.5} fill="url(#userGrad)"
                  dot={{ fill: "#3b82f6", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#3b82f6" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 3 — Latest Bookings + Pending Approvals */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Latest Bookings */}
          <div className="xl:col-span-3 bg-white rounded-xl border border-surface-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-surface-900">Latest Bookings</h2>
              <a href="/admin/bookings" className="text-xs text-primary-600 font-semibold hover:underline">View all</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-50 border-b border-surface-100">
                    {["ID", "Customer", "Vendor", "Service", "Event Date", "Status"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_BOOKINGS.map(b => (
                    <tr key={b.id} className="table-row border-b border-surface-50 last:border-0">
                      <td className="px-4 py-3 text-xs font-semibold text-primary-600 whitespace-nowrap">{b.id}</td>
                      <td className="px-4 py-3 text-sm text-surface-700 whitespace-nowrap">{b.customer}</td>
                      <td className="px-4 py-3 text-sm text-surface-500 whitespace-nowrap">{b.vendor}</td>
                      <td className="px-4 py-3 text-sm text-surface-700 whitespace-nowrap max-w-[140px] truncate">{b.service}</td>
                      <td className="px-4 py-3 text-sm text-surface-500 whitespace-nowrap">{b.eventDate}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-surface-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-surface-900">Pending Approvals</h2>
              <a href="/admin/approvals" className="text-xs text-primary-600 font-semibold hover:underline">View all</a>
            </div>
            <div className="divide-y divide-surface-50 p-2">
              {PENDING_VENDORS.map(v => (
                <div key={v.id} className="px-3 py-4 flex flex-col gap-2 hover:bg-surface-50 rounded-lg transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-violet-600">{v.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-surface-800 truncate">{v.name}</p>
                      <p className="text-xs text-surface-400">{v.category} · {v.city}</p>
                      <p className="text-xs text-surface-300 mt-0.5">Submitted {v.submitted}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pl-12">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-success-50 text-success-600 text-xs font-semibold hover:bg-success-100 transition-colors">
                      <CheckCircle size={12} /> Approve
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-danger-50 text-danger-600 text-xs font-semibold hover:bg-danger-100 transition-colors">
                      <XCircle size={12} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 4 — Top Categories + Support Tickets */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Top Categories */}
          <div className="bg-white rounded-xl border border-surface-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-surface-900">Top Categories</h2>
              <a href="/admin/categories" className="text-xs text-primary-600 font-semibold hover:underline">Manage</a>
            </div>
            <div className="space-y-4">
              {CATEGORY_DATA.map(cat => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-surface-700">{cat.name}</span>
                    <span className="text-xs font-semibold text-surface-500">{cat.value}%</span>
                  </div>
                  <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.value}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Support Tickets */}
          <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-surface-900">Support Tickets</h2>
              <a href="/admin/support" className="text-xs text-primary-600 font-semibold hover:underline">View all</a>
            </div>
            <div className="divide-y divide-surface-50">
              {SUPPORT_TICKETS.slice(0, 5).map(t => (
                <div key={t.id} className="px-6 py-3.5 flex items-start gap-3 hover:bg-surface-50 transition-colors">
                  <div className="flex-shrink-0 pt-0.5">
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-800 truncate">{t.subject}</p>
                    <p className="text-xs text-surface-400 mt-0.5">{t.from} · {t.date}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
