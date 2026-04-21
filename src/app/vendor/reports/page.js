"use client";
import { useState, useEffect } from "react";
import { DollarSign, ShoppingBag, TrendingUp, BarChart2 } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import TopBar from "@/components/TopBar";
import StatsCard from "@/components/StatsCard";
import { vendorAPI } from "@/lib/api";

const DATE_TABS = ["Week", "Month", "Quarter", "Year"];

const MONTHS_MAP = { Week: 1, Month: 1, Quarter: 3, Year: 7 };

export default function VendorReports() {
  const [tab, setTab] = useState("Month");
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const months = MONTHS_MAP[tab] || 1;
    setLoading(true);
    vendorAPI.revenue(months)
      .then(res => {
        const list = res?.data || [];
        setRevenueData(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  const totalRevenue = revenueData.reduce((s, d) => s + (d.revenue || 0), 0);
  const totalOrders = revenueData.reduce((s, d) => s + (d.orders || 0), 0);
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const fmtK = v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title="Sales Report" />

      <main className="flex-1 p-6 space-y-6">
        {/* Date Range Tabs */}
        <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-xl p-1 w-fit">
          {DATE_TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none ${
                tab === t ? "bg-primary-600 text-white" : "text-surface-600 hover:bg-surface-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <StatsCard label="Revenue"         value={`AMD ${totalRevenue.toLocaleString()}`} change={18} changeLabel="vs prev period" icon={DollarSign}  iconBg="bg-violet-50" iconColor="text-violet-500" />
          <StatsCard label="Orders"          value={String(totalOrders)}                    change={12} changeLabel="vs prev period" icon={ShoppingBag} iconBg="bg-pink-50"   iconColor="text-pink-500" />
          <StatsCard label="Avg Order Value" value={`AMD ${avgOrder.toLocaleString()}`}     change={6}  changeLabel="vs prev period" icon={TrendingUp}  iconBg="bg-blue-50"   iconColor="text-blue-500" />
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border border-surface-200 p-6">
          <h2 className="text-sm font-semibold text-surface-900 mb-5">Revenue Over Time</h2>
          {loading ? (
            <div className="h-[220px] flex items-center justify-center text-sm text-surface-400">Loading…</div>
          ) : revenueData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-sm text-surface-400">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="repRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `${fmtK(v)}`} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} formatter={v => [v.toLocaleString(), "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2} fill="url(#repRev)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders Bar Chart */}
        {revenueData.length > 0 && (
          <div className="bg-white rounded-xl border border-surface-200 p-6">
            <h2 className="text-sm font-semibold text-surface-900 mb-5">Orders Per Month</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={revenueData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="orders" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>
    </div>
  );
}
