"use client";
import { useState } from "react";
import {
  UserPlus, Eye, Star, X, MessageSquare,
  ShieldOff, Zap, MapPin, Package,
  DollarSign, Calendar, BadgeCheck,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import { SAMPLE_VENDORS } from "@/lib/data";

const STATUS_TABS = ["All", "Active", "Pending", "Suspended"];

function PlanBadge({ plan }) {
  const map = {
    Basic:   "badge badge-gray",
    Pro:     "badge badge-info",
    Premium: "badge badge-purple",
  };
  return <span className={map[plan] || "badge badge-gray"}>{plan}</span>;
}

function StatusBadge({ status }) {
  const map = {
    active:    "badge badge-success",
    pending:   "badge badge-warning",
    suspended: "badge badge-danger",
  };
  return <span className={map[status] || "badge badge-gray"}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

function StarRating({ rating }) {
  if (!rating) return <span className="text-xs text-surface-300">No reviews yet</span>;
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          size={12}
          className={i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-surface-200 fill-surface-200"}
        />
      ))}
      <span className="text-xs text-surface-500 ml-0.5">{rating}</span>
    </div>
  );
}

function VendorDetailPanel({ vendor, onClose }) {
  const FAKE_REVIEWS = [
    { author: "Anna H.", rating: 5, comment: "Amazing service, highly recommend!", date: "Apr 3, 2025" },
    { author: "Tigran A.", rating: 4, comment: "Great quality, slight delay but worth it.", date: "Mar 28, 2025" },
    { author: "Lilit S.", rating: 5, comment: "Professional and creative team.", date: "Mar 15, 2025" },
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-surface-200 shadow-2xl flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 flex-shrink-0">
        <h2 className="text-sm font-bold text-surface-900">Vendor Details</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-100 text-surface-400 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Profile */}
      <div className="px-6 py-5 border-b border-surface-100">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-primary-600">{vendor.name.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-surface-900">{vendor.name}</h3>
              {vendor.status === "active" && <BadgeCheck size={16} className="text-primary-600" />}
            </div>
            <p className="text-sm text-surface-500 mt-0.5">{vendor.category}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={vendor.status} />
              <PlanBadge plan={vendor.plan} />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-surface-600">
            <MapPin size={13} className="text-surface-400" />
            {vendor.city}
          </div>
          <div className="flex items-center gap-2 text-surface-600">
            <Calendar size={13} className="text-surface-400" />
            Joined {vendor.joined}
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="px-6 py-4 border-b border-surface-100">
        <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3">Subscription</h4>
        <div className={`rounded-xl p-4 ${vendor.plan === "Premium" ? "bg-violet-50 border border-violet-100" : vendor.plan === "Pro" ? "bg-blue-50 border border-blue-100" : "bg-surface-50 border border-surface-100"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-surface-900">{vendor.plan} Plan</p>
              <p className="text-xs text-surface-500 mt-0.5">
                {vendor.plan === "Basic" ? "Free" : vendor.plan === "Pro" ? "$29 / month" : "$79 / month"}
              </p>
            </div>
            <PlanBadge plan={vendor.plan} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-surface-500">
            {vendor.plan === "Premium" && <span>Full analytics · 24/7 support · Top placement · API access</span>}
            {vendor.plan === "Pro" && <span>Advanced analytics · Priority support · Featured badge</span>}
            {vendor.plan === "Basic" && <span>Basic analytics · Email support · Standard listing</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4 border-b border-surface-100">
        <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3">Stats</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface-50 rounded-xl p-3 text-center">
            <Package size={14} className="text-surface-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-surface-900">{vendor.products}</p>
            <p className="text-xs text-surface-400">Products</p>
          </div>
          <div className="bg-surface-50 rounded-xl p-3 text-center">
            <Calendar size={14} className="text-surface-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-surface-900">—</p>
            <p className="text-xs text-surface-400">Bookings</p>
          </div>
          <div className="bg-surface-50 rounded-xl p-3 text-center">
            <DollarSign size={14} className="text-surface-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-surface-900">{vendor.revenue}</p>
            <p className="text-xs text-surface-400">Revenue</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="px-6 py-4 border-b border-surface-100 flex-1">
        <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3">Recent Reviews</h4>
        {vendor.rating === 0 ? (
          <p className="text-sm text-surface-400">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {FAKE_REVIEWS.map((r, i) => (
              <div key={i} className="bg-surface-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-surface-700">{r.author}</span>
                  <StarRating rating={r.rating} />
                </div>
                <p className="text-xs text-surface-500">{r.comment}</p>
                <p className="text-xs text-surface-300 mt-1">{r.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 border-t border-surface-100 flex flex-col gap-2 flex-shrink-0">
        <button className="w-full py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors">
          Edit Profile
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button className="py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5">
            <ShieldOff size={13} /> Suspend
          </button>
          <button className="py-2 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-600 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5">
            <MessageSquare size={13} /> Message
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VendorsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [featured, setFeatured] = useState(new Set([1]));

  const filtered = SAMPLE_VENDORS.filter(v => {
    const matchTab =
      activeTab === "All" ||
      (activeTab === "Active"    && v.status === "active") ||
      (activeTab === "Pending"   && v.status === "pending") ||
      (activeTab === "Suspended" && v.status === "suspended");
    const q = search.toLowerCase();
    const matchSearch = !q ||
      v.name.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      v.city.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const toggleFeatured = (id) => {
    setFeatured(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        title="Vendors"
        subtitle="Manage vendor accounts"
        actions={
          <button className="flex items-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <UserPlus size={14} />
            Add Vendor
          </button>
        }
      />

      <div className="flex-1 p-6 space-y-5 overflow-auto">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Vendors", value: "8",  color: "text-blue-600" },
            { label: "Active",        value: "5",  color: "text-green-600" },
            { label: "Pending",       value: "2",  color: "text-amber-600" },
            { label: "Suspended",     value: "1",  color: "text-red-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-surface-200 px-5 py-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-surface-400 font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-xl border border-surface-200 px-5 py-3.5 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            {STATUS_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === tab
                    ? "bg-primary-600 text-white"
                    : "text-surface-500 hover:bg-surface-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <div className="flex items-center bg-surface-50 rounded-lg px-3 py-2 border border-surface-200 w-[220px] gap-2 focus-within:border-primary-400 transition-colors">
            <svg className="w-3.5 h-3.5 text-surface-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search vendors…"
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-surface-400"
            />
          </div>
          <span className="text-xs text-surface-400">{filtered.length} results</span>
        </div>

        {/* Vendor Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {filtered.map(v => (
            <div
              key={v.id}
              className={`bg-white rounded-xl border overflow-hidden transition-all ${
                selectedVendor?.id === v.id ? "border-primary-300 ring-2 ring-primary-100" : "border-surface-200 hover:border-surface-300"
              }`}
            >
              {/* Card header strip */}
              <div className="h-16 bg-gradient-to-r from-surface-100 to-surface-50 relative">
                {featured.has(v.id) && (
                  <span className="absolute top-2 right-2 badge badge-purple flex items-center gap-1">
                    <Zap size={10} /> Featured
                  </span>
                )}
              </div>

              {/* Logo + Name */}
              <div className="px-4 pb-4 -mt-6">
                <div className="w-12 h-12 rounded-xl bg-primary-100 border-2 border-white flex items-center justify-center shadow-sm mb-3">
                  <span className="text-base font-bold text-primary-600">{v.name.charAt(0)}</span>
                </div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-surface-900 leading-tight">{v.name}</h3>
                    <p className="text-xs text-surface-500 mt-0.5">{v.category}</p>
                  </div>
                  <StatusBadge status={v.status} />
                </div>

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <PlanBadge plan={v.plan} />
                  <span className="flex items-center gap-1 text-xs text-surface-400">
                    <MapPin size={11} />{v.city}
                  </span>
                </div>

                <StarRating rating={v.rating} />

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-surface-50 rounded-lg p-2 text-center">
                    <p className="font-bold text-surface-800">{v.products}</p>
                    <p className="text-surface-400">Products</p>
                  </div>
                  <div className="bg-surface-50 rounded-lg p-2 text-center">
                    <p className="font-bold text-surface-800">{v.revenue}</p>
                    <p className="text-surface-400">Revenue</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedVendor(selectedVendor?.id === v.id ? null : v)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-600 text-xs font-semibold transition-colors"
                    >
                      <Eye size={12} /> View
                    </button>
                    <button
                      onClick={() => toggleFeatured(v.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        featured.has(v.id)
                          ? "bg-violet-100 text-violet-700 hover:bg-violet-200"
                          : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                      }`}
                    >
                      <Zap size={12} /> {featured.has(v.id) ? "Unfeature" : "Feature"}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 text-xs font-semibold transition-colors">
                      <ShieldOff size={12} /> Suspend
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-surface-100 hover:bg-primary-50 text-surface-600 hover:text-primary-600 text-xs font-semibold transition-colors">
                      <MessageSquare size={12} /> Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-sm text-surface-400">
              No vendors found
            </div>
          )}
        </div>

      </div>

      {/* Slide-out detail panel */}
      {selectedVendor && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setSelectedVendor(null)}
          />
          <VendorDetailPanel vendor={selectedVendor} onClose={() => setSelectedVendor(null)} />
        </>
      )}
    </div>
  );
}
