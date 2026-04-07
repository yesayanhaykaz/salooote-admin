"use client";
import { useState } from "react";
import {
  Tag, Mail, Image, Star, Plus, Trash2, Edit2, Send, Clock, FileText,
  GripVertical, X, ToggleLeft, ToggleRight, ChevronUp, ChevronDown,
} from "lucide-react";
import TopBar from "@/components/TopBar";

// ─── Sample data ────────────────────────────────────────────────────────────
const PROMO_CODES_DEFAULT = [
  { code: "WELCOME20", discount: 20, uses: 48,  maxUses: 100, expiry: "Jun 30, 2025", status: "active" },
  { code: "SPRING15",  discount: 15, uses: 112, maxUses: 200, expiry: "May 15, 2025", status: "active" },
  { code: "VIP50",     discount: 50, uses: 8,   maxUses: 10,  expiry: "Apr 30, 2025", status: "active" },
  { code: "SAVE10",    discount: 10, uses: 200, maxUses: 200, expiry: "Mar 31, 2025", status: "expired" },
  { code: "FLASH30",   discount: 30, uses: 0,   maxUses: 50,  expiry: "Apr 20, 2025", status: "scheduled" },
];

const CAMPAIGNS = [
  { name: "Spring Wedding Promo",     status: "sent",      sentDate: "Mar 28, 2025", openRate: "42%", clicks: 318, recipients: 1840 },
  { name: "New Vendor Welcome",       status: "sent",      sentDate: "Apr 1, 2025",  openRate: "61%", clicks: 89,  recipients: 146 },
  { name: "April Offers Newsletter",  status: "scheduled", sentDate: "Apr 10, 2025", openRate: "—",   clicks: 0,   recipients: 2100 },
  { name: "Platform Feature Update",  status: "draft",     sentDate: "—",            openRate: "—",   clicks: 0,   recipients: 0 },
];

const FEATURED_VENDORS_DEFAULT = [
  { id: 1, name: "Salooote Flowers" },
  { id: 2, name: "Sweet Dreams Bakery" },
  { id: 3, name: "Sound Wave DJ" },
  { id: 4, name: "Glamour Makeup" },
];

const FEATURED_PRODUCTS_DEFAULT = [
  { id: 1, name: "Premium Wedding Cake" },
  { id: 2, name: "Red Rose Bouquet (50pc)" },
  { id: 3, name: "DJ Event Package 3hr" },
];

const TABS = ["Promo Codes", "Campaigns", "Banners", "Featured"];

const STATUS_BADGE = {
  active:    "badge badge-success",
  expired:   "badge badge-danger",
  scheduled: "badge badge-info",
  draft:     "badge badge-gray",
  sent:      "badge badge-success",
};

const CAMPAIGN_ICON = { sent: Send, scheduled: Clock, draft: FileText };

// ─── Promo Codes Tab ─────────────────────────────────────────────────────────
function PromoCodesTab() {
  const [codes, setCodes] = useState(PROMO_CODES_DEFAULT);
  const [form, setForm] = useState({ code: "", discount: "", validFrom: "", validTo: "", maxUses: "", applyTo: "All Plans" });

  const addCode = () => {
    if (!form.code || !form.discount) return;
    setCodes(prev => [...prev, {
      code: form.code.toUpperCase(),
      discount: Number(form.discount),
      uses: 0,
      maxUses: Number(form.maxUses) || 100,
      expiry: form.validTo || "—",
      status: "active",
    }]);
    setForm({ code: "", discount: "", validFrom: "", validTo: "", maxUses: "", applyTo: "All Plans" });
  };

  const removeCode = (code) => setCodes(prev => prev.filter(c => c.code !== code));

  return (
    <div className="space-y-6">
      {/* Create form */}
      <div className="bg-white rounded-xl border border-surface-200 p-5">
        <h3 className="text-sm font-bold text-surface-900 mb-4">Create Promo Code</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-surface-500 mb-1.5 block">Code</label>
            <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="e.g. SUMMER25"
              className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400 uppercase" />
          </div>
          <div>
            <label className="text-xs font-semibold text-surface-500 mb-1.5 block">Discount %</label>
            <input type="number" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
              placeholder="e.g. 20"
              className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-surface-500 mb-1.5 block">Max Uses</label>
            <input type="number" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
              placeholder="e.g. 100"
              className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-surface-500 mb-1.5 block">Valid From</label>
            <input type="date" value={form.validFrom} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))}
              className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-surface-500 mb-1.5 block">Valid To</label>
            <input type="date" value={form.validTo} onChange={e => setForm(f => ({ ...f, validTo: e.target.value }))}
              className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-surface-500 mb-1.5 block">Apply To</label>
            <select value={form.applyTo} onChange={e => setForm(f => ({ ...f, applyTo: e.target.value }))}
              className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400 bg-white cursor-pointer">
              <option>All Plans</option>
              <option>Pro</option>
              <option>Premium</option>
            </select>
          </div>
        </div>
        <button onClick={addCode} className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none">
          <Plus size={14} /> Create Code
        </button>
      </div>

      {/* Codes table */}
      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-100">
          <h3 className="text-sm font-bold text-surface-900">Promo Codes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50">
                {["Code", "Discount", "Uses / Max", "Expiry", "Status", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {codes.map((c, i) => (
                <tr key={i} className="border-b border-surface-50 last:border-0 hover:bg-surface-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-sm font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md">{c.code}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-surface-800">{c.discount}% off</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-surface-700">{c.uses} / {c.maxUses}</span>
                      <div className="w-16 h-1.5 rounded-full bg-surface-100 overflow-hidden">
                        <div className="h-full rounded-full bg-primary-400 transition-all" style={{ width: `${Math.min(100, (c.uses / c.maxUses) * 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-surface-600">{c.expiry}</td>
                  <td className="px-5 py-3.5">
                    <span className={STATUS_BADGE[c.status] || "badge badge-gray"}>{c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button className="text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg cursor-pointer border-none transition-colors">Edit</button>
                      <button onClick={() => removeCode(c.code)} className="flex items-center justify-center w-7 h-7 rounded-lg text-danger-500 hover:bg-danger-50 cursor-pointer border-none bg-transparent transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Campaigns Tab ───────────────────────────────────────────────────────────
function CampaignsTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors cursor-pointer border-none">
          <Plus size={14} /> Create Campaign
        </button>
      </div>
      {CAMPAIGNS.map((c, i) => {
        const Icon = CAMPAIGN_ICON[c.status] || FileText;
        return (
          <div key={i} className="bg-white rounded-xl border border-surface-200 p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-800">{c.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-surface-400">{c.sentDate !== "—" ? (c.status === "scheduled" ? `Scheduled: ${c.sentDate}` : `Sent: ${c.sentDate}`) : "Not scheduled"}</span>
                  {c.recipients > 0 && <span className="text-xs text-surface-400">{c.recipients.toLocaleString()} recipients</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {c.openRate !== "—" && (
                <div className="text-center">
                  <p className="text-lg font-bold text-surface-900">{c.openRate}</p>
                  <p className="text-xs text-surface-400">Open Rate</p>
                </div>
              )}
              {c.clicks > 0 && (
                <div className="text-center">
                  <p className="text-lg font-bold text-surface-900">{c.clicks}</p>
                  <p className="text-xs text-surface-400">Clicks</p>
                </div>
              )}
              <span className={STATUS_BADGE[c.status] || "badge badge-gray"}>{c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span>
              <div className="flex items-center gap-1.5">
                <button className="text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg cursor-pointer border-none transition-colors">Edit</button>
                {c.status === "draft" && (
                  <button className="flex items-center gap-1 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 px-2.5 py-1 rounded-lg cursor-pointer border-none transition-colors">
                    <Send size={11} /> Send
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Banners Tab ─────────────────────────────────────────────────────────────
function BannersTab() {
  const [banners, setBanners] = useState([
    { id: 1, label: "Banner 1 — Hero", slot: "hero",     active: true },
    { id: 2, label: "Banner 2 — Mid-page", slot: "mid",  active: true },
    { id: 3, label: "Banner 3 — Sidebar", slot: "sidebar", active: false },
  ]);

  const toggle = (id) => setBanners(prev => prev.map(b => b.id === id ? { ...b, active: !b.active } : b));

  return (
    <div className="space-y-4">
      {banners.map(banner => (
        <div key={banner.id} className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-surface-900">{banner.label}</h3>
              <p className="text-xs text-surface-400 mt-0.5 capitalize">{banner.slot} slot</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={banner.active ? "badge badge-success" : "badge badge-gray"}>
                {banner.active ? "Active" : "Inactive"}
              </span>
              <button onClick={() => toggle(banner.id)}
                className="border-none bg-transparent cursor-pointer p-0 flex items-center">
                {banner.active
                  ? <ToggleRight size={28} className="text-primary-600" />
                  : <ToggleLeft  size={28} className="text-surface-300" />}
              </button>
            </div>
          </div>
          {/* Upload zone */}
          <div className="border-2 border-dashed border-surface-200 rounded-xl h-32 flex flex-col items-center justify-center gap-2 bg-surface-50 hover:bg-surface-100 transition-colors cursor-pointer group">
            <Image size={22} className="text-surface-300 group-hover:text-surface-400 transition-colors" />
            <p className="text-xs text-surface-400 group-hover:text-surface-500 font-medium">Click or drag to upload banner image</p>
            <p className="text-[11px] text-surface-300">Recommended: 1200×400px, PNG/JPG</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Featured Tab ─────────────────────────────────────────────────────────────
function FeaturedList({ title, items, setItems }) {
  const move = (index, dir) => {
    const next = [...items];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    setItems(next);
  };
  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
        <h3 className="text-sm font-bold text-surface-900">{title}</h3>
        <button className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg cursor-pointer border-none transition-colors">
          <Plus size={12} /> Add
        </button>
      </div>
      <div className="divide-y divide-surface-50">
        {items.map((item, i) => (
          <div key={item.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-50/50 transition-colors group">
            <GripVertical size={14} className="text-surface-300 cursor-grab flex-shrink-0" />
            <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
            <span className="flex-1 text-sm font-medium text-surface-800">{item.name}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => move(i, -1)} disabled={i === 0}
                className="w-6 h-6 rounded flex items-center justify-center hover:bg-surface-100 text-surface-400 cursor-pointer border-none bg-transparent disabled:opacity-30">
                <ChevronUp size={12} />
              </button>
              <button onClick={() => move(i, 1)} disabled={i === items.length - 1}
                className="w-6 h-6 rounded flex items-center justify-center hover:bg-surface-100 text-surface-400 cursor-pointer border-none bg-transparent disabled:opacity-30">
                <ChevronDown size={12} />
              </button>
              <button onClick={() => remove(item.id)}
                className="w-6 h-6 rounded flex items-center justify-center hover:bg-danger-50 text-danger-400 cursor-pointer border-none bg-transparent">
                <X size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturedTab() {
  const [vendors, setVendors] = useState(FEATURED_VENDORS_DEFAULT);
  const [products, setProducts] = useState(FEATURED_PRODUCTS_DEFAULT);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FeaturedList title="Featured Vendors" items={vendors} setItems={setVendors} />
      <FeaturedList title="Featured Products" items={products} setItems={setProducts} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState("Promo Codes");

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Marketing" subtitle="Promos, campaigns, banners and featured content" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-surface-100 rounded-xl p-1 w-fit">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer border-none ${
                activeTab === tab
                  ? "bg-white text-surface-900 shadow-sm"
                  : "text-surface-500 hover:text-surface-700 bg-transparent"
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Promo Codes" && <PromoCodesTab />}
        {activeTab === "Campaigns"   && <CampaignsTab />}
        {activeTab === "Banners"     && <BannersTab />}
        {activeTab === "Featured"    && <FeaturedTab />}
      </div>
    </div>
  );
}
