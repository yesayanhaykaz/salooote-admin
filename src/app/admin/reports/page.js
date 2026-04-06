"use client";
import { useState } from "react";
import { DollarSign, ShoppingBag, Users, TrendingUp } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import TopBar from "@/components/TopBar";
import StatsCard from "@/components/StatsCard";
import { REVENUE_DATA, CATEGORY_DATA } from "@/lib/data";

const DATE_TABS = [
  { key: "7d",   label: "7 Days" },
  { key: "30d",  label: "30 Days" },
  { key: "90d",  label: "90 Days" },
  { key: "year", label: "Year" },
];

const TOP_PRODUCTS = [
  { name: "Red Rose Bouquet (50pc)", sales: 134, revenue: "$8,710",  pct: 95 },
  { name: "Party Balloon Bundle",    sales: 89,  revenue: "$4,005",  pct: 63 },
  { name: "Premium Wedding Cake",    sales: 47,  revenue: "$11,750", pct: 33 },
  { name: "Cupcake Tower (24pc)",    sales: 78,  revenue: "$7,410",  pct: 55 },
  { name: "Spring Flower Box",       sales: 56,  revenue: "$4,480",  pct: 40 },
];

const STATS_BY_RANGE = {
  "7d":   { revenue: "$8,400",  orders: 67,   users: 143, avg: "$125" },
  "30d":  { revenue: "$29,700", orders: 227,  users: 512, avg: "$131" },
  "90d":  { revenue: "$91,500", orders: 699,  users: 1208,avg: "$131" },
  "year": { revenue: "$78,400", orders: 1247, users: 3891,avg: "$128" },
};

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("30d");
  const stats = STATS_BY_RANGE[dateRange];

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Reports & Analytics" />

      <div className="flex-1 p-6 space-y-6">
        {/* Date Range Tabs */}
        <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-xl p-1.5 w-fit">
          {DATE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setDateRange(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-0 ${
                dateRange === tab.key
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-surface-500 hover:text-surface-800 hover:bg-surface-50 bg-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard label="Total Revenue"    value={stats.revenue} change={12.5} icon={DollarSign} iconBg="bg-pink-50"   iconColor="text-pink-500" />
          <StatsCard label="Orders"           value={String(stats.orders)}  change={8.2}  icon={ShoppingBag} iconBg="bg-violet-50" iconColor="text-violet-500" />
          <StatsCard label="New Users"        value={String(stats.users)}   change={15.1} icon={Users}       iconBg="bg-blue-50"   iconColor="text-blue-500" />
          <StatsCard label="Avg Order Value"  value={stats.avg}   change={2.4}  icon={TrendingUp}  iconBg="bg-green-50"  iconColor="text-green-500" />
        </div>

        {/* Revenue Area Chart */}
        <div className="bg-white rounded-xl border border-surface-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-surface-900">Revenue Trend</h2>
              <p className="text-xs text-surface-400 mt-0.5">Monthly revenue breakdown</p>
            </div>
            <span className="badge badge-purple">Revenue</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={REVENUE_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.20} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
                formatter={(value, name) => [
                  name === "revenue" ? `$${value.toLocaleString()}` : value,
                  name === "revenue" ? "Revenue" : "Orders",
                ]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2.5} fill="url(#revGrad)"
                dot={{ fill: "#7c3aed", r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="orders"  stroke="#3b82f6" strokeWidth={2}   fill="url(#ordGrad)"
                dot={{ fill: "#3b82f6", r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart + Top Products */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Bar Chart */}
          <div className="xl:col-span-3 bg-white rounded-xl border border-surface-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-surface-900">Orders by Category</h2>
                <p className="text-xs text-surface-400 mt-0.5">Distribution across product categories</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={CATEGORY_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
                  formatter={(value) => [value, "Orders %"]}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-surface-200 p-6">
            <div className="mb-5">
              <h2 className="text-sm font-bold text-surface-900">Top Products</h2>
              <p className="text-xs text-surface-400 mt-0.5">Best performing products</p>
            </div>
            <div className="space-y-4">
              {TOP_PRODUCTS.map((product, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-surface-400 w-4">{i + 1}</span>
                      <p className="text-xs font-semibold text-surface-700 truncate">{product.name}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="text-xs font-bold text-surface-900">{product.revenue}</span>
                      <span className="text-xs text-surface-400 ml-1">({product.sales} sold)</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary-500"
                      style={{ width: `${product.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue by category breakdown */}
            <div className="mt-6 pt-5 border-t border-surface-100">
              <p className="text-xs font-bold text-surface-700 mb-3">Revenue by Category</p>
              <div className="space-y-2">
                {CATEGORY_DATA.map((cat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                    <span className="text-xs text-surface-600 flex-1">{cat.name}</span>
                    <span className="text-xs font-bold text-surface-800">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
