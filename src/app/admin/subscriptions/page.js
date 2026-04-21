"use client";
import { useState, useEffect } from "react";
import {
  CreditCard, TrendingUp, UserX, RefreshCw, Users, Edit2, X,
  CheckCircle, Search, Plus,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import StatsCard from "@/components/StatsCard";
import DataTable from "@/components/DataTable";
import { adminSubscriptionsAPI, adminVendorsAPI } from "@/lib/api";

const PLANS_DEFAULT = [
  { key: "basic",   name: "Basic",   price: "Free",  features: "Basic analytics\nEmail support\nStandard listing", listings: 10,  active: true },
  { key: "pro",     name: "Pro",     price: "$29",   features: "Advanced analytics\nPriority support\nFeatured badge\nCustom URL", listings: 100, active: true },
  { key: "premium", name: "Premium", price: "$79",   features: "Full analytics\n24/7 support\nTop placement\nAPI access\nBulk import", listings: 999, active: true },
];

const PLAN_BADGE = {
  basic:   "badge badge-gray",
  pro:     "badge badge-info",
  premium: "badge badge-purple",
  Basic:   "badge badge-gray",
  Pro:     "badge badge-info",
  Premium: "badge badge-purple",
};

const STATUS_BADGE = {
  active:    "badge badge-success",
  expiring:  "badge badge-warning",
  cancelled: "badge badge-danger",
  inactive:  "badge badge-gray",
};

function fmt(dateStr) {
  if (!dateStr) return "—";
  try { return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
  catch { return "—"; }
}

// ─── Plan capacity bar ───────────────────────────────────────────────────────
function CapacityBar({ used, max }) {
  const pct = max > 0 ? Math.round((used / max) * 100) : 0;
  const color = pct >= 90 ? "bg-danger-500" : pct >= 70 ? "bg-warning-500" : "bg-primary-500";
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-surface-400 mb-1">
        <span>{used} vendors</span><span>{max} slots</span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-100 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Manage Plans Modal ──────────────────────────────────────────────────────
function ManagePlansModal({ onClose }) {
  const [plans, setPlans] = useState(PLANS_DEFAULT);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const openEdit = (plan) => { setEditing(plan.key); setForm({ ...plan }); };
  const save = () => {
    setPlans(prev => prev.map(p => p.key === editing ? { ...p, ...form } : p));
    setEditing(null);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h2 className="text-base font-bold text-surface-900">Manage Plans</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-100 cursor-pointer border-none bg-transparent">
            <X size={16} className="text-surface-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {plans.map(plan => (
            <div key={plan.key} className="border border-surface-200 rounded-xl p-4">
              {editing === plan.key ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-surface-500 mb-1 block">Name</label>
                      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-surface-500 mb-1 block">Price</label>
                      <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                        className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-surface-500 mb-1 block">Listing Limit</label>
                      <input type="number" value={form.listings} onChange={e => setForm(f => ({ ...f, listings: e.target.value }))}
                        className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400" />
                    </div>
                    <div className="flex items-end gap-3">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <div onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                          className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${form.active ? "bg-primary-600" : "bg-surface-300"}`}>
                          <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: form.active ? "17px" : "2px" }} />
                        </div>
                        <span className="text-surface-600 font-medium">Active</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-surface-500 mb-1 block">Features (one per line)</label>
                    <textarea value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} rows={4}
                      className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400 resize-none" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm border border-surface-200 rounded-lg hover:bg-surface-50 cursor-pointer bg-white text-surface-700">Cancel</button>
                    <button onClick={save} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer">Save Changes</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-surface-900">{plan.name}</span>
                      <span className="text-sm font-bold text-primary-600">{plan.price}</span>
                      {plan.active
                        ? <span className="badge badge-success">Active</span>
                        : <span className="badge badge-danger">Inactive</span>}
                    </div>
                    <p className="text-xs text-surface-400">{plan.listings === 999 ? "Unlimited" : plan.listings} listings · {plan.features.split("\n").length} features</p>
                  </div>
                  <button onClick={() => openEdit(plan)} className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 cursor-pointer border-none bg-transparent px-3 py-1.5 rounded-lg hover:bg-primary-50">
                    <Edit2 size={13} /> Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Assign Plan Modal ────────────────────────────────────────────────────────
function AssignPlanModal({ vendors, onAssign, onClose }) {
  const [vendorId, setVendorId]     = useState("");
  const [planSlug, setPlanSlug]     = useState("pro");
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");
  const [vendorSearch, setVendorSearch] = useState("");

  const filtered = vendors.filter(v =>
    v.business_name?.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  async function handleSubmit(e) {
    e.preventDefault();
    if (!vendorId) { setError("Select a vendor"); return; }
    setSaving(true);
    setError("");
    try {
      await adminSubscriptionsAPI.assignPlan(vendorId, planSlug);
      onAssign();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to assign plan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h2 className="text-base font-bold text-surface-900">Assign Subscription Plan</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-100 cursor-pointer border-none bg-transparent">
            <X size={16} className="text-surface-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 text-sm rounded-lg px-4 py-2">{error}</div>
          )}
          <div>
            <label className="text-xs font-semibold text-surface-500 mb-1.5 block">Search Vendor</label>
            <div className="flex items-center border border-surface-200 rounded-lg px-3 py-2 gap-2 focus-within:border-primary-400 transition-colors bg-surface-50 mb-2">
              <Search size={14} className="text-surface-400" />
              <input
                value={vendorSearch}
                onChange={e => setVendorSearch(e.target.value)}
                placeholder="Type vendor name…"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-surface-400"
              />
            </div>
            <select
              value={vendorId}
              onChange={e => setVendorId(e.target.value)}
              size={Math.min(filtered.length + 1, 6)}
              className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400 bg-white cursor-pointer"
            >
              <option value="">— select vendor —</option>
              {filtered.map(v => (
                <option key={v.id} value={v.id}>{v.business_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-surface-500 mb-1.5 block">Select Plan</label>
            <select
              value={planSlug}
              onChange={e => setPlanSlug(e.target.value)}
              className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400 bg-white cursor-pointer"
            >
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-surface-200 rounded-lg hover:bg-surface-50 cursor-pointer bg-white text-surface-700">Cancel</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none disabled:opacity-60">
              <CheckCircle size={14} />
              {saving ? "Assigning…" : "Assign Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [vendors, setVendors]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showManage, setShowManage]       = useState(false);
  const [showAssign, setShowAssign]       = useState(false);

  async function fetchData() {
    setLoading(true);
    try {
      const [subsRes, vendorsRes] = await Promise.all([
        adminSubscriptionsAPI.list(),
        adminVendorsAPI.list({ limit: 200, page: 1 }),
      ]);
      setSubscriptions(subsRes?.data || []);
      setVendors(vendorsRes?.data?.items || vendorsRes?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  // Derived plan counts
  const planCounts = subscriptions.reduce((acc, s) => {
    const key = (s.plan_slug || s.plan_name || "").toLowerCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const activeCount    = subscriptions.filter(s => s.status === "active").length;
  const cancelledCount = subscriptions.filter(s => s.status === "cancelled").length;

  const columns = [
    {
      key: "vendor_name", label: "Vendor", sortable: true,
      render: (val) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
            <span className="text-xs font-bold text-primary-600">{(val || "?").charAt(0)}</span>
          </div>
          <span className="font-medium text-surface-800">{val || "—"}</span>
        </div>
      ),
    },
    {
      key: "plan_name", label: "Plan",
      render: (val, row) => {
        const key = row.plan_slug || val || "";
        return <span className={PLAN_BADGE[val] || PLAN_BADGE[key] || "badge badge-gray"}>{val || "—"}</span>;
      },
    },
    {
      key: "price", label: "Price",
      render: (val) => <span className="text-sm font-semibold text-surface-700">{val != null ? (val === 0 ? "Free" : `$${val}/mo`) : "—"}</span>,
    },
    {
      key: "starts_at", label: "Start Date", sortable: true,
      render: (val) => <span className="text-xs text-surface-500">{fmt(val)}</span>,
    },
    {
      key: "ends_at", label: "End Date",
      render: (val) => <span className="text-xs text-surface-500">{fmt(val)}</span>,
    },
    {
      key: "status", label: "Status",
      render: (val) => <span className={STATUS_BADGE[val] || "badge badge-gray"}>{val ? val.charAt(0).toUpperCase() + val.slice(1) : "—"}</span>,
    },
    {
      key: "vendor_id", label: "Actions",
      render: (vendorId, row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setShowAssign(true); }}
            className="text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg cursor-pointer border-none transition-colors"
          >
            Change
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Subscriptions"
        subtitle="Manage vendor plans and billing"
        actions={
          <button onClick={() => setShowManage(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors cursor-pointer border-none">
            <Edit2 size={14} /> Manage Plans
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard label="Active Subscriptions"    value={activeCount}    icon={CreditCard}  iconBg="bg-primary-50"  iconColor="text-primary-600" />
          <StatsCard label="Total Vendors"           value={subscriptions.length} icon={Users} iconBg="bg-success-50"  iconColor="text-success-600" />
          <StatsCard label="Churned"                 value={cancelledCount} icon={UserX}       iconBg="bg-danger-50"   iconColor="text-danger-600"  />
          <StatsCard label="Renewal Rate"            value={activeCount > 0 ? `${Math.round((activeCount / Math.max(subscriptions.length, 1)) * 100)}%` : "—"} icon={RefreshCw} iconBg="bg-info-50" iconColor="text-info-600" />
        </div>

        {/* Plan Cards */}
        <div>
          <h2 className="text-sm font-bold text-surface-700 mb-3">Plan Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Basic",   slug: "basic",   price: "Free",    color: "text-surface-600", bg: "bg-surface-50",  border: "border-surface-200", capacity: 50 },
              { name: "Pro",     slug: "pro",     price: "$29/mo",  color: "text-primary-600", bg: "bg-primary-50",  border: "border-primary-200", capacity: 50 },
              { name: "Premium", slug: "premium", price: "$79/mo",  color: "text-amber-600",   bg: "bg-amber-50",    border: "border-amber-200",   capacity: 20 },
            ].map(plan => (
              <div key={plan.name} className={`bg-white rounded-xl border ${plan.border} p-5`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className={`text-sm font-bold ${plan.color}`}>{plan.name}</p>
                    <p className="text-xl font-bold text-surface-900 mt-0.5">{plan.price}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-xl ${plan.bg} flex items-center justify-center`}>
                    <Users size={16} className={plan.color} />
                  </div>
                </div>
                <CapacityBar used={planCounts[plan.slug] || 0} max={plan.capacity} />
              </div>
            ))}
          </div>
        </div>

        {/* Subscribers Table */}
        <div>
          <h2 className="text-sm font-bold text-surface-700 mb-3">Active Subscribers</h2>
          {loading ? (
            <div className="bg-white rounded-xl border border-surface-200 py-12 text-center">
              <p className="text-sm text-surface-400">Loading subscriptions…</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={subscriptions}
              pageSize={8}
              searchable
              searchKeys={["vendor_name", "plan_name", "status"]}
            />
          )}
        </div>

        {/* Manual Assign */}
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <h2 className="text-sm font-bold text-surface-900 mb-4">Manual Plan Assignment</h2>
          <p className="text-sm text-surface-500 mb-4">Assign or change a subscription plan for any vendor directly.</p>
          <button
            onClick={() => setShowAssign(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none"
          >
            <Plus size={14} /> Assign Plan to Vendor
          </button>
        </div>
      </div>

      {showManage && <ManagePlansModal onClose={() => setShowManage(false)} />}
      {showAssign && (
        <AssignPlanModal
          vendors={vendors}
          onAssign={fetchData}
          onClose={() => setShowAssign(false)}
        />
      )}
    </div>
  );
}
