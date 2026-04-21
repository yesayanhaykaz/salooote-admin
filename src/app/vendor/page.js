"use client";
import { useState, useEffect } from "react";
import {
  Eye, Sparkles, Inbox, CalendarCheck, Clock, Star,
  Package, CreditCard, AlertTriangle, TrendingUp,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import TopBar from "@/components/TopBar";
import StatsCard from "@/components/StatsCard";
import { vendorAPI } from "@/lib/api";
import { useLocale } from "@/lib/i18n";

const DAYS_LEFT = 18;

function StarRow({ rating, size = 12 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={size} className={`${s <= rating ? "text-warning-500 fill-current" : "text-surface-200 fill-current"}`} />
      ))}
    </div>
  );
}

function fmt(n) {
  if (!n && n !== 0) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function VendorDashboard() {
  const { t } = useLocale();
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      vendorAPI.dashboard().catch(() => null),
      vendorAPI.revenue(7).catch(() => null),
    ]).then(([dashRes, revRes]) => {
      if (dashRes?.data) setStats(dashRes.data);
      if (revRes?.data?.length) {
        setRevenueData(revRes.data.map(d => ({ month: d.month, revenue: d.revenue, inquiries: d.orders || 0 })));
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title={t("sidebar.dashboard")} subtitle={stats?.business_name || t("sidebar.your_business")} />

      <main className="flex-1 p-6 space-y-6">
        {DAYS_LEFT <= 20 && (
          <div className="flex items-center gap-3 bg-warning-50 border border-warning-200 rounded-xl px-5 py-3.5">
            <AlertTriangle size={16} className="text-warning-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-warning-800">{t("dashboard.subscription_warning_title")}</p>
              <p className="text-xs text-warning-600 mt-0.5">{t("dashboard.subscription_warning_text")}</p>
            </div>
            <a href="/vendor/subscription" className="flex-shrink-0 px-4 py-2 bg-warning-500 text-white text-xs font-bold rounded-lg hover:bg-warning-600 transition-colors">
              {t("dashboard.renew_now")}
            </a>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatsCard
            label={t("dashboard.total_products")}
            value={fmt(stats?.total_products)}
            change={3}
            changeLabel={t("dashboard.vs_last_month")}
            icon={Package}
            iconBg="bg-primary-50"
            iconColor="text-primary-600"
          />
          <StatsCard
            label={t("dashboard.new_inquiries")}
            value={fmt(stats?.new_inquiries)}
            change={22}
            changeLabel={t("dashboard.vs_last_month")}
            icon={Inbox}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-500"
          />
          <StatsCard
            label={t("dashboard.total_bookings")}
            value={fmt(stats?.total_bookings)}
            change={15}
            changeLabel={t("dashboard.vs_last_month")}
            icon={CalendarCheck}
            iconBg="bg-success-50"
            iconColor="text-success-600"
          />
          <StatsCard
            label={t("dashboard.total_orders")}
            value={fmt(stats?.total_orders)}
            change={8}
            changeLabel={t("dashboard.vs_last_month")}
            icon={Clock}
            iconBg="bg-warning-50"
            iconColor="text-warning-600"
          />
          <StatsCard
            label={t("dashboard.average_rating")}
            value={stats?.average_rating ? stats.average_rating.toFixed(1) : "—"}
            change={2}
            changeLabel={t("dashboard.vs_last_month")}
            icon={Star}
            iconBg="bg-yellow-50"
            iconColor="text-yellow-500"
          />
          <StatsCard
            label={t("dashboard.total_reviews")}
            value={fmt(stats?.total_reviews)}
            change={5}
            changeLabel={t("dashboard.vs_last_month")}
            icon={Sparkles}
            iconBg="bg-teal-50"
            iconColor="text-teal-500"
          />
          <StatsCard
            label={t("dashboard.revenue_this_month")}
            value={stats?.revenue_this_month ? `$${stats.revenue_this_month.toFixed(0)}` : "—"}
            change={8}
            changeLabel={t("dashboard.vs_last_month")}
            icon={Eye}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
          />
          <StatsCard
            label={t("dashboard.subscription_label")}
            value={t("dashboard.pro")}
            icon={CreditCard}
            iconBg="bg-orange-50"
            iconColor="text-orange-500"
            changeLabel={t("dashboard.days_left")}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-surface-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-surface-900">{t("dashboard.revenue")}</h2>
                <p className="text-xs text-surface-400 mt-0.5">{t("dashboard.last_7_months")}</p>
              </div>
              <span className="text-xs font-semibold text-success-600 bg-success-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <TrendingUp size={11} /> {t("dashboard.this_month_growth")}
              </span>
            </div>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="vendorRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip
                    contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                    formatter={v => [`$${v}`, t("dashboard.revenue")]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2} fill="url(#vendorRevGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[190px] flex items-center justify-center text-sm text-surface-400">
                {loading ? t("common.loading") : t("dashboard.no_revenue_data_yet")}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-surface-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-surface-900">{t("dashboard.inquiries_over_time")}</h2>
                <p className="text-xs text-surface-400 mt-0.5">{t("dashboard.last_7_months")}</p>
              </div>
            </div>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={revenueData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                    formatter={v => [v, t("sidebar.inquiries")]}
                    cursor={{ fill: "rgba(124,58,237,0.06)" }}
                  />
                  <Bar dataKey="inquiries" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[190px] flex items-center justify-center text-sm text-surface-400">
                {loading ? t("common.loading") : t("dashboard.no_data_yet")}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
