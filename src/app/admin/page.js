"use client";
import { DollarSign, ShoppingBag, Users, Store, Star } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import TopBar from "@/components/TopBar";
import StatsCard from "@/components/StatsCard";
import { REVENUE_DATA, SAMPLE_ORDERS, SAMPLE_VENDORS } from "@/lib/data";

function StatusBadge({ status }) {
  const map = {
    delivered:  "badge badge-success",
    pending:    "badge badge-warning",
    processing: "badge badge-info",
    cancelled:  "badge badge-danger",
  };
  return (
    <span className={map[status] || "badge badge-gray"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function AdminDashboard() {
  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Dashboard" subtitle="Welcome back, Haykaz" />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
            label="Active Users"
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
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-surface-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-surface-900">Revenue Overview</h2>
              <p className="text-xs text-surface-400 mt-0.5">Monthly revenue for the last 7 months</p>
            </div>
            <span className="badge badge-purple">Last 7 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={REVENUE_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  fontSize: 12,
                }}
                formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#7c3aed"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
                dot={{ fill: "#7c3aed", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#7c3aed" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Orders + Top Vendors */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Recent Orders */}
          <div className="xl:col-span-3 bg-white rounded-xl border border-surface-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-surface-900">Recent Orders</h2>
              <a href="/admin/orders" className="text-xs text-primary-600 font-semibold hover:underline">View all</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-50 border-b border-surface-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide">Order</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide">Customer</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide">Amount</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_ORDERS.slice(0, 5).map((order) => (
                    <tr key={order.id} className="table-row border-b border-surface-50 last:border-0">
                      <td className="px-5 py-3.5 text-sm font-semibold text-primary-600">{order.id}</td>
                      <td className="px-5 py-3.5 text-sm text-surface-700">{order.customer}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-surface-900">{order.amount}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={order.status} /></td>
                      <td className="px-5 py-3.5 text-sm text-surface-400">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Vendors */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-surface-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-surface-900">Top Vendors</h2>
              <a href="/admin/vendors" className="text-xs text-primary-600 font-semibold hover:underline">View all</a>
            </div>
            <div className="divide-y divide-surface-50">
              {SAMPLE_VENDORS.slice(0, 5).map((vendor, i) => (
                <div key={vendor.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-surface-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary-600">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-surface-800 truncate">{vendor.name}</p>
                    <p className="text-xs text-surface-400">{vendor.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-surface-900">{vendor.revenue}</p>
                    {vendor.rating > 0 && (
                      <div className="flex items-center gap-0.5 justify-end mt-0.5">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs text-surface-400">{vendor.rating}</span>
                      </div>
                    )}
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
