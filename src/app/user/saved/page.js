"use client";
import { useState, useEffect } from "react";
import { Heart, Package, Store, Briefcase, X, Plus } from "lucide-react";
import TopBar from "@/components/TopBar";
import { userAPI, publicAPI } from "@/lib/api";

const TYPE_ICONS = {
  vendor:  Store,
  product: Package,
  service: Briefcase,
};

const TYPE_BADGE_CLS = {
  vendor:  "badge badge-purple",
  product: "badge badge-info",
  service: "badge badge-success",
};

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function SavedPage() {
  const [saved, setSaved] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    userAPI.saved({ limit: 50 })
      .then(res => setSaved(res?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    publicAPI.vendors({ limit: 8 })
      .then(res => setVendors(res?.data || []))
      .catch(() => {})
      .finally(() => setVendorsLoading(false));
  }, []);

  async function unsave(id) {
    setSaving(prev => ({ ...prev, [id]: true }));
    try {
      await userAPI.unsaveItem(id);
      setSaved(prev => prev.filter(s => s.id !== id));
    } catch {}
    setSaving(prev => ({ ...prev, [id]: false }));
  }

  async function saveVendor(vendorId) {
    setSaving(prev => ({ ...prev, [`v-${vendorId}`]: true }));
    try {
      const res = await userAPI.saveItem("vendor", vendorId);
      const newItem = res?.data || res;
      if (newItem?.id) setSaved(prev => [...prev, newItem]);
    } catch {}
    setSaving(prev => ({ ...prev, [`v-${vendorId}`]: false }));
  }

  const savedVendorIds = new Set(
    saved.filter(s => s.target_type === "vendor").map(s => s.target_id)
  );

  const TABS = ["All", "Vendors", "Products", "Services"];

  const filtered = activeTab === "All"
    ? saved
    : saved.filter(s => s.target_type === activeTab.toLowerCase());

  const counts = {
    vendor:  saved.filter(s => s.target_type === "vendor").length,
    product: saved.filter(s => s.target_type === "product").length,
    service: saved.filter(s => s.target_type === "service").length,
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title="Saved" subtitle="Your saved items" />

      <main className="flex-1 p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Saved Vendors",  value: counts.vendor,  icon: Store,    bg: "bg-violet-50", color: "text-violet-500" },
            { label: "Saved Products", value: counts.product, icon: Package,  bg: "bg-blue-50",   color: "text-blue-500" },
            { label: "Saved Services", value: counts.service, icon: Briefcase, bg: "bg-green-50", color: "text-green-500" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-surface-200 p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900">{s.value}</p>
                <p className="text-xs text-surface-400 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-xl px-2 py-1.5 w-fit">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border-none ${
                activeTab === tab ? "bg-primary-600 text-white" : "text-surface-500 hover:bg-surface-100 bg-transparent"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Saved Items List */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-surface-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-surface-200 flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center mb-3">
              <Heart size={24} className="text-pink-300" />
            </div>
            <p className="text-sm font-semibold text-surface-600">Nothing saved yet</p>
            <p className="text-xs text-surface-400 mt-1">
              {activeTab === "All" ? "Browse vendors and products to save your favorites." : `No saved ${activeTab.toLowerCase()} yet.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => {
              const Icon = TYPE_ICONS[item.target_type] || Package;
              const badgeCls = TYPE_BADGE_CLS[item.target_type] || "badge badge-gray";
              return (
                <div key={item.id} className="bg-white rounded-xl border border-surface-200 p-4 flex flex-col gap-3 hover:shadow-card transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0">
                        <Icon size={18} className="text-surface-400" />
                      </div>
                      <div>
                        <span className={badgeCls}>{item.target_type}</span>
                        <p className="text-xs text-surface-500 mt-0.5 font-mono">{item.target_id?.slice(-12)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => unsave(item.id)}
                      disabled={saving[item.id]}
                      className="w-7 h-7 rounded-full bg-surface-100 flex items-center justify-center hover:bg-danger-50 hover:text-danger-500 text-surface-400 transition-colors cursor-pointer border-none flex-shrink-0"
                    >
                      <X size={13} />
                    </button>
                  </div>
                  {item.created_at && (
                    <p className="text-[11px] text-surface-400">Saved {formatDate(item.created_at)}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Discover Vendors Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-surface-900">Discover Vendors</h2>
            <p className="text-xs text-surface-400">Save vendors you like</p>
          </div>

          {vendorsLoading ? (
            <div className="text-sm text-surface-400 text-center py-8">Loading vendors…</div>
          ) : vendors.length === 0 ? (
            <div className="bg-white rounded-xl border border-surface-200 py-10 text-center text-sm text-surface-400">
              No vendors available.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {vendors.map(v => {
                const alreadySaved = savedVendorIds.has(v.id);
                const isSaving = saving[`v-${v.id}`];
                const initials = [v.first_name, v.last_name].filter(Boolean).map(s => s[0]).join("") ||
                  (v.name || v.business_name || "V").slice(0, 2).toUpperCase();

                return (
                  <div key={v.id} className="bg-white rounded-xl border border-surface-200 p-4 flex flex-col gap-3 hover:shadow-card transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 flex-shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-surface-900 truncate">
                          {v.business_name || v.name || `Vendor`}
                        </p>
                        {v.city && <p className="text-xs text-surface-400 truncate">{v.city}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => !alreadySaved && saveVendor(v.id)}
                      disabled={alreadySaved || isSaving}
                      className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                        alreadySaved
                          ? "border-pink-200 bg-pink-50 text-pink-600 cursor-default"
                          : "border-surface-200 text-surface-600 hover:bg-surface-50"
                      }`}
                    >
                      <Heart size={12} className={alreadySaved ? "fill-pink-500 text-pink-500" : ""} />
                      {isSaving ? "Saving…" : alreadySaved ? "Saved" : "Save"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
