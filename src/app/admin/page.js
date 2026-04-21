"use client";
import { useState, useEffect } from "react";
import {
  DollarSign, ShoppingBag, Users, Store,
  Calendar, CreditCard, UserPlus, Clock,
  CheckCircle, XCircle,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import TopBar from "@/components/TopBar";
import StatsCard from "@/components/StatsCard";
import { adminDashboardAPI, adminApprovalsAPI } from "@/lib/api";

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
    confirmed: "Confirmed", pending: "Pending", negotiating: "Negotiating",
    cancelled: "Cancelled", open: "Open", in_progress: "In Progress", resolved: "Resolved",
  };
  return <span className={map[status] || "badge badge-gray"}>{labels[status] || status}</span>;
}

function PriorityBadge({ priority }) {
  const map = { high: "badge badge-danger", medium: "badge badge-warning", low: "badge badge-info" };
  return <span className={map[priority] || "badge badge-gray"}>{priority?.charAt(0).toUpperCase() + priority?.slice(1)}</span>;
}

function fmt(n) {
  if (!n && n !== 0) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

function fmtMoney(n) {
  if (!n && n !== 0) return "—";
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n}`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminDashboardAPI.stats().catch(() => null),
      adminDashboardAPI.revenue(7).catch(() => null),
      adminApprovalsAPI.list({ limit: 5 }).catch(() => null),
    ]).then(([statsRes, revRes, appRes]) => {
      if (statsRes?.data) setStats(statsRes.data);
      if (revRes?.data) {
        setRevenueData(revRes.data.map(d => ({
          month: d.month,
          revenue: d.revenue,
          orders: d.orders,
        })));
      }
      if (appRes?.data) setApprovals(appRes.data.slice(0, 3));
      setLoading(false);
    });
  }, []);

  const handleApprove = async (id) => {
    try {
      await adminApprovalsAPI.approve(id);
      setApprovals(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (id) => {
    try {
      await adminApprovalsAPI.reject(id, "Rejected from dashboard");
      setApprovals(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Dashboard" subtitle="Welcome back, Admin" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">

        {/* Row 1 — 8 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-4">
          <StatsCard
            label="Total Revenue"
            value={fmtMoney(stats?.revenue_this_month)}
            change={12.5}
            changeLabel="vs last month"
            icon={DollarSign}
            iconBg="bg-pink-50"
            iconColor="text-pink-500"
          />
          <StatsCard
            label="Total Orders"
            value={fmt(stats?.total_orders)}
            change={8.2}
            changeLabel="vs last month"
            icon={ShoppingBag}
            iconBg="bg-violet-50"
            iconColor="text-violet-500"
          />
          <StatsCard
            label="Total Users"
            value={fmt(stats?.total_users)}
            change={15.1}
            changeLabel="vs last month"
            icon={Users}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
          />
          <StatsCard
            label="Active Vendors"
            value={fmt(stats?.active_vendors)}
            change={3.4}
            changeLabel="vs last month"
            icon={Store}
            iconBg="bg-green-50"
            iconColor="text-green-500"
          />
          <StatsCard
            label="Total Bookings"
            value={fmt(stats?.total_bookings)}
            change={9.7}
            changeLabel="vs last month"
            icon={Calendar}
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
          />
          <StatsCard
            label="Monthly MRR"
            value={fmtMoney(stats?.revenue_this_month)}
            change={5.3}
            changeLabel="vs last month"
            icon={CreditCard}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-500"
          />
          <StatsCard
            label="New This Week"
            value={fmt(stats?.orders_this_month)}
            change={22.0}
            changeLabel="users joined"
            icon={UserPlus}
            iconBg="bg-teal-50"
            iconColor="text-teal-500"
          />
          <StatsCard
            label="Pending Approvals"
            value={fmt(stats?.pending_approvals)}
            icon={Clock}
            iconBg="bg-orange-50"
            iconColor="text-orange-500"
          />
        </div>

        {/* Row 2 — Revenue Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-surface-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-surface-900">Revenue Overview</h2>
                <p className="text-xs text-surface-400 mt-0.5">Monthly revenue — last 7 months</p>
              </div>
              <span className="badge badge-purple">Last 7 months</span>
            </div>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
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
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-surface-400">
                {loading ? "Loading…" : "No revenue data yet"}
              </div>
            )}
          </div>

          {/* Pending Approvals widget */}
          <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-surface-900">Pending Approvals</h2>
              <a href="/admin/approvals" className="text-xs text-primary-600 font-semibold hover:underline">View all</a>
            </div>
            <div className="divide-y divide-surface-50 p-2">
              {loading ? (
                <p className="px-4 py-8 text-center text-sm text-surface-400">Loading…</p>
              ) : approvals.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-surface-400">No pending applications</p>
              ) : approvals.map(v => (
                <div key={v.id} className="px-3 py-4 flex flex-col gap-2 hover:bg-surface-50 rounded-lg transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-violet-600">{(v.business_name || v.name || "?").charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-surface-800 truncate">{v.business_name || v.name}</p>
                      <p className="text-xs text-surface-400">{v.city || "—"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pl-12">
                    <button
                      onClick={() => handleApprove(v.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-success-50 text-success-600 text-xs font-semibold hover:bg-success-100 transition-colors"
                    >
                      <CheckCircle size={12} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(v.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-danger-50 text-danger-600 text-xs font-semibold hover:bg-danger-100 transition-colors"
                    >
                      <XCircle size={12} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
