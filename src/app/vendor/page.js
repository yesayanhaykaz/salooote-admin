"use client";
import { useState } from "react";
import {
  Eye, Sparkles, Inbox, CalendarCheck, Clock, Star,
  Package, CreditCard, AlertTriangle, Send, TrendingUp,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import TopBar from "@/components/TopBar";
import StatsCard from "@/components/StatsCard";
import { SAMPLE_INQUIRIES, SAMPLE_REVIEWS, REVENUE_DATA } from "@/lib/data";

// Vendor-specific chart data (hardcoded)
const PROFILE_VIEWS_DATA = [
  { month: "Oct", views: 420 },
  { month: "Nov", views: 580 },
  { month: "Dec", views: 740 },
  { month: "Jan", views: 810 },
  { month: "Feb", views: 960 },
  { month: "Mar", views: 1180 },
  { month: "Apr", views: 1240 },
];

const INQUIRIES_DATA = [
  { month: "Oct", inquiries: 5  },
  { month: "Nov", inquiries: 8  },
  { month: "Dec", inquiries: 12 },
  { month: "Jan", inquiries: 9  },
  { month: "Feb", inquiries: 14 },
  { month: "Mar", inquiries: 18 },
  { month: "Apr", inquiries: 47 },
];

const TOP_SERVICES = [
  { name: "Wedding Cake (3-tier)",    views: 1420, pct: 100 },
  { name: "Cupcake Tower (24pc)",     views: 980,  pct: 69  },
  { name: "Birthday Cake Custom",     views: 740,  pct: 52  },
  { name: "Cookie Gift Box",          views: 560,  pct: 39  },
  { name: "Macaron Tower (48pc)",     views: 420,  pct: 30  },
];

const INQUIRY_STATUS = {
  new:       "badge badge-info",
  replied:   "badge badge-gray",
  confirmed: "badge badge-success",
  pending:   "badge badge-warning",
  cancelled: "badge badge-danger",
};

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

export default function VendorDashboard() {
  const recentInquiries = SAMPLE_INQUIRIES.slice(0, 5);
  const recentReviews   = SAMPLE_REVIEWS.slice(0, 5);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title="Dashboard" subtitle="Sweet Dreams Bakery" />

      <main className="flex-1 p-6 space-y-6">
        {/* Subscription Alert Banner */}
        {DAYS_LEFT <= 20 && (
          <div className="flex items-center gap-3 bg-warning-50 border border-warning-200 rounded-xl px-5 py-3.5">
            <AlertTriangle size={16} className="text-warning-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-warning-800">
                Your Pro subscription expires in {DAYS_LEFT} days
              </p>
              <p className="text-xs text-warning-600 mt-0.5">
                Renew now to keep your featured badge, analytics, and priority support active.
              </p>
            </div>
            <a
              href="/vendor/subscription"
              className="flex-shrink-0 px-4 py-2 bg-warning-500 text-white text-xs font-bold rounded-lg hover:bg-warning-600 transition-colors"
            >
              Renew Now
            </a>
          </div>
        )}

        {/* Stats 4x2 Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatsCard label="Profile Views"       value="1,240"  change={12}  changeLabel="vs last month" icon={Eye}          iconBg="bg-primary-50"  iconColor="text-primary-600" />
          <StatsCard label="Service Views"        value="3,891"  change={8}   changeLabel="vs last month" icon={Sparkles}     iconBg="bg-blue-50"     iconColor="text-blue-500" />
          <StatsCard label="Total Inquiries"      value="47"     change={22}  changeLabel="vs last month" icon={Inbox}        iconBg="bg-indigo-50"   iconColor="text-indigo-500" />
          <StatsCard label="Confirmed Bookings"   value="23"     change={15}  changeLabel="vs last month" icon={CalendarCheck} iconBg="bg-success-50"  iconColor="text-success-600" />
          <StatsCard label="Pending Inquiries"    value="4"      change={-1}  changeLabel="vs last month" icon={Clock}        iconBg="bg-warning-50"  iconColor="text-warning-600" />
          <StatsCard label="Average Rating"       value="4.8"    change={2}   changeLabel="vs last month" icon={Star}         iconBg="bg-yellow-50"   iconColor="text-yellow-500" />
          <StatsCard label="Active Listings"      value="14"     change={3}   changeLabel="vs last month" icon={Package}      iconBg="bg-teal-50"     iconColor="text-teal-500" />
          <StatsCard label="Subscription"         value="Pro"    icon={CreditCard} iconBg="bg-orange-50"  iconColor="text-orange-500"
            changeLabel={`${DAYS_LEFT} days left`}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Profile Views - Line chart */}
          <div className="bg-white rounded-xl border border-surface-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-surface-900">Profile Views</h2>
                <p className="text-xs text-surface-400 mt-0.5">Last 7 months</p>
              </div>
              <span className="text-xs font-semibold text-success-600 bg-success-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <TrendingUp size={11} /> +12% this month
              </span>
            </div>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={PROFILE_VIEWS_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                  formatter={v => [v.toLocaleString(), "Views"]}
                />
                <Area type="monotone" dataKey="views" stroke="#7c3aed" strokeWidth={2} fill="url(#viewsGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Inquiries - Bar chart */}
          <div className="bg-white rounded-xl border border-surface-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-surface-900">Inquiries Over Time</h2>
                <p className="text-xs text-surface-400 mt-0.5">Last 7 months</p>
              </div>
              <span className="text-xs font-semibold text-info-600 bg-info-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <TrendingUp size={11} /> +22% this month
              </span>
            </div>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={INQUIRIES_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                  formatter={v => [v, "Inquiries"]}
                  cursor={{ fill: "rgba(124,58,237,0.06)" }}
                />
                <Bar dataKey="inquiries" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Inquiries + Recent Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recent Inquiries */}
          <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-surface-900">Recent Inquiries</h2>
              <a href="/vendor/inquiries" className="text-xs text-primary-600 font-medium hover:underline">View all</a>
            </div>
            <div className="divide-y divide-surface-50">
              {recentInquiries.map((inq, idx) => (
                <div key={inq.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-surface-50 transition-colors">
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${
                    ["bg-primary-600","bg-pink-500","bg-blue-500","bg-green-500","bg-orange-500"][idx % 5]
                  }`}>
                    {inq.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-surface-900 truncate">{inq.from}</p>
                      <span className={INQUIRY_STATUS[inq.status]}>{inq.status}</span>
                    </div>
                    <p className="text-[11px] text-surface-500 truncate mt-0.5">{inq.service}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-surface-400">{inq.eventDate}</span>
                      <button className="flex items-center gap-1 text-[10px] font-semibold text-primary-600 hover:text-primary-700 cursor-pointer border-none bg-transparent">
                        <Send size={10} /> Quick Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-surface-900">Recent Reviews</h2>
              <a href="/vendor/reviews" className="text-xs text-primary-600 font-medium hover:underline">View all</a>
            </div>
            <div className="divide-y divide-surface-50">
              {recentReviews.map((review, idx) => (
                <div key={review.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-surface-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${
                    ["bg-primary-600","bg-pink-500","bg-blue-500","bg-green-500","bg-orange-500"][idx % 5]
                  }`}>
                    {review.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-xs font-semibold text-surface-900 truncate">{review.author}</p>
                      <span className="text-[10px] text-surface-400">{review.date}</span>
                    </div>
                    <StarRow rating={review.rating} />
                    <p className="text-[11px] text-surface-500 mt-0.5 line-clamp-2 leading-relaxed">{review.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Most Viewed Services */}
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-surface-900">Most Viewed Services</h2>
            <a href="/vendor/services" className="text-xs text-primary-600 font-medium hover:underline">Manage services</a>
          </div>
          <div className="divide-y divide-surface-50">
            {TOP_SERVICES.map((svc, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                <span className="text-xs font-bold text-surface-300 w-5 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-surface-800 truncate">{svc.name}</p>
                    <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                      <Eye size={11} className="text-surface-400" />
                      <span className="text-xs font-semibold text-surface-700">{svc.views.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-600 rounded-full transition-all"
                      style={{ width: `${svc.pct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
