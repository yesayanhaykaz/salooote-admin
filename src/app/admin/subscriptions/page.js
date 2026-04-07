"use client";
import { useState } from "react";
import {
  CreditCard, TrendingUp, UserX, RefreshCw, Users, Edit2, X,
  ChevronUp, CheckCircle, Search, Plus,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import StatsCard from "@/components/StatsCard";
import DataTable from "@/components/DataTable";

// ─── Sample data ────────────────────────────────────────────────────────────
const SUBSCRIPTIONS = [
  { id: 1, vendor: "Salooote Flowers",    plan: "Premium", startDate: "Jan 1, 2025",  endDate: "Dec 31, 2025", status: "active" },
  { id: 2, vendor: "Sweet Dreams Bakery", plan: "Pro",     startDate: "Feb 3, 2025",  endDate: "Feb 3, 2026",  status: "active" },
  { id: 3, vendor: "Sound Wave DJ",       plan: "Pro",     startDate: "Mar 15, 2025", endDate: "Mar 15, 2026", status: "active" },
  { id: 4, vendor: "Glamour Makeup",      plan: "Pro",     startDate: "Apr 1, 2025",  endDate: "Apr 1, 2026",  status: "active" },
  { id: 5, vendor: "Bloom Studio",        plan: "Basic",   startDate: "Aug 10, 2024", endDate: "—",            status: "active" },
  { id: 6, vendor: "Lense & Light",       plan: "Basic",   startDate: "Apr 2, 2025",  endDate: "—",            status: "active" },
  { id: 7, vendor: "Party Planet",        plan: "Basic",   startDate: "Apr 5, 2025",  endDate: "—",            status: "active" },
  { id: 8, vendor: "Cater King",          plan: "Pro",     startDate: "Sep 1, 2024",  endDate: "Sep 1, 2025",  status: "expiring" },
];

const CHURNED = [
  { vendor: "Bloom Weddings",  plan: "Pro",     date: "Mar 28, 2025", reason: "Too expensive" },
  { vendor: "DJ Artak",        plan: "Basic",   date: "Mar 10, 2025", reason: "No longer operating" },
  { vendor: "Fancy Cakes",     plan: "Premium", date: "Feb 22, 2025", reason: "Switched to competitor" },
];

const PLANS_DEFAULT = [
  { key: "basic",   name: "Basic",   price: "Free",  vendors: 0,  capacity: 50, features: "Basic analytics\nEmail support\nStandard listing", listings: 10,  active: true },
  { key: "pro",     name: "Pro",     price: "$29",   vendors: 28, capacity: 50, features: "Advanced analytics\nPriority support\nFeatured badge\nCustom URL", listings: 100, active: true },
  { key: "premium", name: "Premium", price: "$79",   vendors: 10, capacity: 20, features: "Full analytics\n24/7 support\nTop placement\nAPI access\nBulk import", listings: 999, active: true },
];

const PLAN_BADGE = {
  Basic:   "badge badge-gray",
  Pro:     "badge badge-info",
  Premium: "badge badge-purple",
};

const STATUS_BADGE = {
  active:   "badge badge-success",
  expiring: "badge badge-warning",
  cancelled:"badge badge-danger",
};

// ─── Plan capacity bar ───────────────────────────────────────────────────────
function CapacityBar({ used, max }) {
  const pct = Math.round((used / max) * 100);
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
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.active ? "left-4.5" : "left-0.5"}`} style={{ left: form.active ? "17px" : "2px" }} />
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

// ─── Page ────────────────────────────────────────────────────────────────────
export default function SubscriptionsPage() {
  const [showModal, setShowModal] = useState(false);
  const [assignVendor, setAssignVendor] = useState("");
  const [assignPlan, setAssignPlan] = useState("Pro");

  const columns = [
    {
      key: "vendor", label: "Vendor", sortable: true,
      render: (val) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
            <span className="text-xs font-bold text-primary-600">{val.charAt(0)}</span>
          </div>
          <span className="font-medium text-surface-800">{val}</span>
        </div>
      ),
    },
    {
      key: "plan", label: "Plan",
      render: (val) => <span className={PLAN_BADGE[val] || "badge badge-gray"}>{val}</span>,
    },
    { key: "startDate", label: "Start Date", sortable: true },
    { key: "endDate",   label: "End Date" },
    {
      key: "status", label: "Status",
      render: (val) => <span className={STATUS_BADGE[val] || "badge badge-gray"}>{val.charAt(0).toUpperCase() + val.slice(1)}</span>,
    },
    {
      key: "id", label: "Actions",
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button className="text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg cursor-pointer border-none transition-colors">Upgrade</button>
          <button className="text-xs font-medium text-info-600 hover:text-info-700 bg-info-50 hover:bg-info-100 px-2.5 py-1 rounded-lg cursor-pointer border-none transition-colors">Extend</button>
          <button className="text-xs font-medium text-danger-600 hover:text-danger-700 bg-danger-50 hover:bg-danger-100 px-2.5 py-1 rounded-lg cursor-pointer border-none transition-colors">Cancel</button>
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
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors cursor-pointer border-none">
            <Edit2 size={14} /> Manage Plans
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard label="Active Subscriptions" value="38" change={5.6}  changeLabel="vs last month" icon={CreditCard}   iconBg="bg-primary-50"  iconColor="text-primary-600" />
          <StatsCard label="Monthly Recurring Revenue" value="$1,420" change={8.2} changeLabel="MRR" icon={TrendingUp} iconBg="bg-success-50"  iconColor="text-success-600" />
          <StatsCard label="Churned This Month" value="2"    change={-33.3} changeLabel="vs last month" icon={UserX}        iconBg="bg-danger-50"   iconColor="text-danger-600" />
          <StatsCard label="Renewal Rate" value="94%"  change={1.1}  changeLabel="30-day period"  icon={RefreshCw}    iconBg="bg-info-50"     iconColor="text-info-600" />
        </div>

        {/* Plan Cards */}
        <div>
          <h2 className="text-sm font-bold text-surface-700 mb-3">Plan Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Basic", price: "Free", vendors: 0,  capacity: 50, color: "text-surface-600", bg: "bg-surface-50",  border: "border-surface-200" },
              { name: "Pro",   price: "$29/mo", vendors: 28, capacity: 50, color: "text-primary-600", bg: "bg-primary-50", border: "border-primary-200" },
              { name: "Premium", price: "$79/mo", vendors: 10, capacity: 20, color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200" },
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
                <CapacityBar used={plan.vendors} max={plan.capacity} />
              </div>
            ))}
          </div>
        </div>

        {/* Active Subscribers Table */}
        <div>
          <h2 className="text-sm font-bold text-surface-700 mb-3">Active Subscribers</h2>
          <DataTable
            columns={columns}
            data={SUBSCRIPTIONS}
            pageSize={8}
            searchable
            searchKeys={["vendor", "plan", "status"]}
          />
        </div>

        {/* Manual Assign */}
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <h2 className="text-sm font-bold text-surface-900 mb-4">Manual Plan Assignment</h2>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[180px]">
              <label className="text-xs font-semibold text-surface-500 mb-1.5 block">Search Vendor</label>
              <div className="flex items-center border border-surface-200 rounded-lg px-3 py-2 gap-2 focus-within:border-primary-400 transition-colors bg-surface-50">
                <Search size={14} className="text-surface-400" />
                <input
                  value={assignVendor}
                  onChange={e => setAssignVendor(e.target.value)}
                  placeholder="Vendor name…"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-surface-400"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-surface-500 mb-1.5 block">Select Plan</label>
              <select
                value={assignPlan}
                onChange={e => setAssignPlan(e.target.value)}
                className="border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400 bg-white cursor-pointer"
              >
                <option>Basic</option>
                <option>Pro</option>
                <option>Premium</option>
              </select>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none">
              <Plus size={14} /> Apply Plan
            </button>
          </div>
        </div>

        {/* Churned Vendors */}
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-surface-900">Churned Vendors</h2>
            <span className="badge badge-danger">{CHURNED.length} this month</span>
          </div>
          <div className="space-y-3">
            {CHURNED.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-danger-50 border border-danger-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-danger-100 flex items-center justify-center">
                    <UserX size={14} className="text-danger-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-800">{c.vendor}</p>
                    <p className="text-xs text-surface-400">Reason: {c.reason}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={PLAN_BADGE[c.plan] || "badge badge-gray"}>{c.plan}</span>
                  <p className="text-xs text-surface-400 mt-1">{c.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && <ManagePlansModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
