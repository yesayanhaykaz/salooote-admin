"use client";
import { useState } from "react";
import { DollarSign, ShoppingBag, TrendingUp, BarChart2 } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import TopBar from "@/components/TopBar";
import StatsCard from "@/components/StatsCard";
import { REVENUE_DATA } from "@/lib/data";

const DATE_TABS = ["Week", "Month", "Quarter", "Year"];

const PRODUCT_SALES = [
  { name: "Wedding Cake",   units: 47, revenue: 11750 },
  { name: "Cupcake Tower",  units: 78, revenue: 7410  },
  { name: "Birthday Cake",  units: 34, revenue: 4080  },
  { name: "Cookie Box",     units: 29, revenue: 1450  },
  { name: "Macaron Tower",  units: 18, revenue: 1260  },
];

const BREAKDOWN = [
  { name: "Premium Wedding Cake",    units: 47, revenue: "$11,750", pct: "42%" },
  { name: "Cupcake Tower (24pc)",    units: 78, revenue: "$7,410",  pct: "26%" },
  { name: "Birthday Cake Custom",    units: 34, revenue: "$4,080",  pct: "15%" },
  { name: "Cookie Gift Box",         units: 29, revenue: "$1,450",  pct: "5%"  },
  { name: "Macaron Tower (48pc)",    units: 18, revenue: "$1,260",  pct: "5%"  },
  { name: "Other",                   units: 28, revenue: "$1,950",  pct: "7%"  },
];

const STATS_BY_TAB = {
  Week:    { revenue: "$2,450", orders: "58",  avg: "$42",   conv: "3.8%" },
  Month:   { revenue: "$9,800", orders: "234", avg: "$82",   conv: "4.2%" },
  Quarter: { revenue: "$29,400",orders: "702", avg: "$79",   conv: "4.0%" },
  Year:    { revenue: "$98,000",orders: "2808",avg: "$81",   conv: "3.9%" },
};

const vendorRevenue = REVENUE_DATA.map(d => ({ ...d, revenue: Math.round(d.revenue / 3) }));

export default function VendorReports() {
  const [tab, setTab] = useState("Month");
  const stats = STATS_BY_TAB[tab];

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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard label="Revenue"          value={stats.revenue} change={18} changeLabel="vs prev period" icon={DollarSign}  iconBg="bg-violet-50" iconColor="text-violet-500" />
          <StatsCard label="Orders"           value={stats.orders}  change={12} changeLabel="vs prev period" icon={ShoppingBag} iconBg="bg-pink-50"   iconColor="text-pink-500" />
          <StatsCard label="Avg Order Value"  value={stats.avg}     change={6}  changeLabel="vs prev period" icon={TrendingUp}  iconBg="bg-blue-50"   iconColor="text-blue-500" />
          <StatsCard label="Conversion Rate"  value={stats.conv}    change={2}  changeLabel="vs prev period" icon={BarChart2}   iconBg="bg-green-50"  iconColor="text-green-500" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Area Chart */}
          <div className="bg-white rounded-xl border border-surface-200 p-6">
            <h2 className="text-sm font-semibold text-surface-900 mb-5">Revenue Over Time</h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={vendorRevenue} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="repRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} formatter={v => [`$${v.toLocaleString()}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2} fill="url(#repRev)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-xl border border-surface-200 p-6">
            <h2 className="text-sm font-semibold text-surface-900 mb-5">Top Products by Sales</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={PRODUCT_SALES} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="units" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Breakdown Table */}
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-100">
            <h2 className="text-sm font-semibold text-surface-900">Revenue Breakdown by Product</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100 bg-surface-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide">Product</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide">Units Sold</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide">Revenue</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {BREAKDOWN.map((row, i) => (
                  <tr key={i} className="border-b border-surface-50 last:border-0 table-row">
                    <td className="px-5 py-3.5 text-sm font-medium text-surface-800">{row.name}</td>
                    <td className="px-5 py-3.5 text-sm text-surface-600">{row.units}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-surface-900">{row.revenue}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-surface-100 rounded-full overflow-hidden max-w-[80px]">
                          <div className="h-full bg-primary-600 rounded-full" style={{ width: row.pct }} />
                        </div>
                        <span className="text-xs font-medium text-surface-500">{row.pct}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
