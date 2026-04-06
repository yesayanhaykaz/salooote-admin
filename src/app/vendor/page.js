"use client";
import { useState } from "react";
import { DollarSign, ShoppingBag, Package, Users } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import TopBar from "@/components/TopBar";
import StatsCard from "@/components/StatsCard";
import { SAMPLE_ORDERS, REVENUE_DATA } from "@/lib/data";

const STATUS_COLORS = {
  delivered:  "badge badge-success",
  pending:    "badge badge-warning",
  processing: "badge badge-info",
  cancelled:  "badge badge-danger",
};

const TOP_PRODUCTS = [
  { name: "Premium Wedding Cake",  sales: 47, revenue: "$11,750", pct: 100 },
  { name: "Cupcake Tower (24pc)",  sales: 78, revenue: "$7,410",  pct: 63  },
  { name: "Birthday Cake Custom",  sales: 34, revenue: "$4,080",  pct: 35  },
  { name: "Cookie Gift Box",       sales: 29, revenue: "$1,450",  pct: 12  },
  { name: "Macaron Tower (48pc)",  sales: 18, revenue: "$1,260",  pct: 11  },
];

const vendorRevenue = REVENUE_DATA.map(d => ({ ...d, revenue: Math.round(d.revenue / 3) }));

export default function VendorDashboard() {
  const recentOrders = SAMPLE_ORDERS.slice(0, 5);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title="Dashboard" subtitle="Sweet Dreams Bakery" />

      <main className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard label="Total Revenue"   value="$9,800" change={18} changeLabel="vs last month" icon={DollarSign} iconBg="bg-pink-50"   iconColor="text-pink-500" />
          <StatsCard label="Orders"          value="234"    change={12} changeLabel="vs last month" icon={ShoppingBag} iconBg="bg-violet-50" iconColor="text-violet-500" />
          <StatsCard label="Products"        value="32"     change={2}  changeLabel="vs last month" icon={Package}    iconBg="bg-blue-50"   iconColor="text-blue-500" />
          <StatsCard label="Customers"       value="187"    change={9}  changeLabel="vs last month" icon={Users}      iconBg="bg-green-50"  iconColor="text-green-500" />
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-surface-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-surface-900">Revenue Trend</h2>
              <p className="text-xs text-surface-400 mt-0.5">Last 7 months</p>
            </div>
            <span className="text-xs font-semibold text-success-600 bg-success-50 px-2.5 py-1 rounded-full">+18% this month</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={vendorRevenue} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="vendorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                formatter={v => [`$${v.toLocaleString()}`, "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2} fill="url(#vendorRev)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-surface-900">Recent Orders</h2>
              <a href="/vendor/orders" className="text-xs text-primary-600 font-medium hover:underline">View all</a>
            </div>
            <div className="divide-y divide-surface-50">
              {recentOrders.map(order => (
                <div key={order.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-surface-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-surface-900">{order.id}</p>
                    <p className="text-xs text-surface-400 truncate">{order.customer}</p>
                  </div>
                  <p className="text-xs text-surface-600 flex-1 truncate hidden sm:block">{order.product}</p>
                  <p className="text-sm font-semibold text-surface-900 w-14 text-right">{order.amount}</p>
                  <span className={STATUS_COLORS[order.status]}>{order.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-surface-900">Top Products</h2>
              <a href="/vendor/products" className="text-xs text-primary-600 font-medium hover:underline">View all</a>
            </div>
            <div className="divide-y divide-surface-50">
              {TOP_PRODUCTS.map((p, i) => (
                <div key={i} className="px-5 py-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-medium text-surface-800 truncate flex-1">{p.name}</p>
                    <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                      <span className="text-xs text-surface-400">{p.sales} sales</span>
                      <span className="text-xs font-semibold text-surface-900">{p.revenue}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-600 rounded-full transition-all" style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
