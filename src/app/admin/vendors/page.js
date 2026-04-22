"use client";
import { useState, useEffect } from "react";
import {
  UserPlus, Eye, Star, X, MessageSquare, Pencil,
  ShieldOff, MapPin, Package, DollarSign, Calendar, BadgeCheck, Tag, Link2,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import CategoryPicker from "@/components/CategoryPicker";
import { adminVendorsAPI, aiAPI } from "@/lib/api";

const STATUS_TABS = ["All", "Active", "Pending", "Suspended"];

// ─── Standalone field component (must be outside modal to prevent remount on each keystroke) ──
function VendorField({ label, name, value, onChange, type = "text", placeholder, required }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-surface-700 mb-1.5">
        {label}{required && <span className="text-danger-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value ?? ""}
        onChange={e => onChange(name, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-800 placeholder:text-surface-400 focus:border-primary-500 outline-none transition-colors"
      />
    </div>
  );
}

function PlanBadge({ plan }) {
  const map = { Basic: "badge badge-gray", Pro: "badge badge-info", Premium: "badge badge-purple" };
  return <span className={map[plan] || "badge badge-gray"}>{plan || "Basic"}</span>;
}

function StatusBadge({ status }) {
  const map = { active: "badge badge-success", pending: "badge badge-warning", suspended: "badge badge-danger" };
  return <span className={map[status] || "badge badge-gray"}>{status?.charAt(0).toUpperCase() + status?.slice(1)}</span>;
}

function StarRating({ rating }) {
  if (!rating) return <span className="text-xs text-surface-300">No reviews yet</span>;
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12} className={i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-surface-200 fill-surface-200"} />
      ))}
      <span className="text-xs text-surface-500 ml-0.5">{Number(rating).toFixed(1)}</span>
    </div>
  );
}

/* ── Toast ── */
function Toast({ message, type = "success", onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  const colors = type === "error"
    ? "bg-red-50 border-red-200 text-red-700"
    : "bg-green-50 border-green-200 text-green-700";
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium animate-fade-in ${colors}`}>
      {type === "error" ? "⚠️" : "✅"} {message}
    </div>
  );
}

/* ── Import from Website Modal ── */
function ImportFromWebsiteModal({ onClose, onImported }) {
  const [url, setUrl] = useState("https://");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImport = async () => {
    const trimmed = url.trim();
    if (!trimmed || trimmed === "https://") {
      setError("Please enter a valid URL.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const prompt = `You are a data extraction assistant. Visit or analyze this business website URL: ${trimmed}\n\nExtract the following information and return ONLY a valid JSON object with these exact keys (use empty string if not found):\n{\n  "business_name": "",\n  "description": "",\n  "phone": "",\n  "email": "",\n  "city": "",\n  "address": "",\n  "website": "${trimmed}",\n  "facebook_url": "",\n  "instagram_url": ""\n}\n\nReturn ONLY the JSON, no markdown, no explanation.`;

      const res = await aiAPI.adminChat([{ role: "user", content: prompt }]);
      const raw = res?.data?.content || res?.data?.message || "";

      // Extract JSON from response (strip markdown fences if present)
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");

      const extracted = JSON.parse(jsonMatch[0]);
      onImported(extracted);
      onClose();
    } catch (e) {
      console.error(e);
      setError("Could not extract info, please fill manually.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
              <Link2 size={14} className="text-primary-600" />
            </div>
            <h2 className="text-sm font-bold text-surface-900">Import Vendor from Website</h2>
          </div>
          {!loading && (
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-surface-400 hover:bg-surface-100 border-0 bg-transparent cursor-pointer">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">Website URL</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !loading && handleImport()}
              disabled={loading}
              placeholder="https://example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-800 placeholder:text-surface-400 focus:border-primary-500 outline-none transition-colors disabled:opacity-50"
            />
          </div>
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2">{error}</p>
          )}
          <p className="text-xs text-surface-400">
            The AI will attempt to extract business info from the URL. Results may be partial — review before saving.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-surface-100 bg-surface-50/50">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-medium text-surface-600 border border-surface-200 bg-white hover:bg-surface-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700 transition-colors cursor-pointer border-0 disabled:opacity-60"
          >
            {loading ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Scraping…
              </>
            ) : (
              <>Import & Fill →</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Vendor Create/Edit Modal ── */
function VendorModal({ onClose, onSave, initial, prefill }) {
  const isEdit = !!initial;
  const [activeSection, setActiveSection] = useState("info");
  const [form, setForm] = useState(initial ? {
    business_name: initial.business_name || initial.name || "",
    description:   initial.description || "",
    phone:         initial.phone || "",
    email:         initial.email || "",
    website:       initial.website || "",
    city:          initial.city || "",
    address:       initial.address || "",
    status:        initial.status || "active",
  } : {
    first_name: "", last_name: "", email: "", password: "",
    business_name: prefill?.business_name || "",
    business_type: "",
    description:   prefill?.description || "",
    phone:         prefill?.phone || "",
    email:         prefill?.email || "",
    city:          prefill?.city || "",
    website:       prefill?.website || "",
    address:       prefill?.address || "",
    status: "active",
  });
  const [categoryIds, setCategoryIds] = useState([]);
  const [catLoading, setCatLoading]   = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load existing categories when editing
  useEffect(() => {
    if (!isEdit || !initial?.id) return;
    adminVendorsAPI.getCategories(initial.id)
      .then(res => setCategoryIds((res?.data || []).map(c => c.id)))
      .catch(console.error)
      .finally(() => setCatLoading(false));
  }, [isEdit, initial?.id]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setField = (name, val) => set(name, val);

  const handleSubmit = async () => {
    if (!isEdit && (!form.first_name?.trim() || !form.email?.trim() || !form.password?.trim() || !form.business_name?.trim())) {
      setError("First name, email, password and business name are required.");
      setActiveSection("info");
      return;
    }
    if (isEdit && !form.business_name?.trim()) {
      setError("Business name is required.");
      setActiveSection("info");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const saved = await onSave(form);
      // After save, update categories (edit mode — use vendor id; create mode — use returned vendor id)
      const vendorId = saved?.id || initial?.id;
      if (vendorId) {
        await adminVendorsAPI.setCategories(vendorId, categoryIds);
      }
      onClose();
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // Use the top-level VendorField component (avoids remount on each keystroke)

  const SECTIONS = [
    { key: "info",       label: "Info" },
    { key: "categories", label: "Categories", icon: Tag },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-surface-900">{isEdit ? "Edit Vendor" : "Add Vendor"}</h2>
            <p className="text-xs text-surface-400 mt-0.5">{isEdit ? "Update vendor profile" : "Create a new vendor account"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:bg-surface-100 cursor-pointer border-0 bg-transparent">
            <X size={16} />
          </button>
        </div>

        {/* Section tabs — only in edit mode */}
        {isEdit && (
          <div className="flex items-center gap-1 px-6 pt-4 flex-shrink-0">
            {SECTIONS.map(s => (
              <button key={s.key} onClick={() => setActiveSection(s.key)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold cursor-pointer border-none transition-colors ${
                  activeSection === s.key ? "bg-primary-600 text-white" : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                }`}
              >
                {s.icon && <s.icon size={13} />}
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* ── Info section ── */}
          {activeSection === "info" && (
            <>
              {!isEdit && (
                <>
                  <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">Account</p>
                  <div className="grid grid-cols-2 gap-4">
                    <VendorField label="First Name" name="first_name" value={form.first_name} onChange={setField} placeholder="John" required />
                    <VendorField label="Last Name" name="last_name" value={form.last_name} onChange={setField} placeholder="Doe" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <VendorField label="Email" name="email" value={form.email} onChange={setField} type="email" placeholder="vendor@example.com" required />
                    <VendorField label="Password" name="password" value={form.password} onChange={setField} type="password" placeholder="Min. 6 characters" required />
                  </div>
                </>
              )}

              <p className="text-xs font-bold text-surface-500 uppercase tracking-wider pt-2">Business Info</p>
              <div className="grid grid-cols-2 gap-4">
                <VendorField label="Business Name" name="business_name" value={form.business_name} onChange={setField} placeholder="Royal Bakes" required />
                {!isEdit && <VendorField label="Business Type" name="business_type" value={form.business_type} onChange={setField} placeholder="Bakery, Photography…" />}
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1.5">Description</label>
                <textarea
                  value={form.description || ""}
                  onChange={e => set("description", e.target.value)}
                  rows={3}
                  placeholder="Brief description of the business…"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-800 placeholder:text-surface-400 focus:border-primary-500 outline-none transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <VendorField label="Phone" name="phone" value={form.phone} onChange={setField} placeholder="+374 91 000 000" />
                <VendorField label="City" name="city" value={form.city} onChange={setField} placeholder="Yerevan" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <VendorField label="Website" name="website" value={form.website} onChange={setField} placeholder="https://example.com" />
                {isEdit && <VendorField label="Address" name="address" value={form.address} onChange={setField} placeholder="Street, building" />}
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={e => set("status", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-800 bg-white focus:border-primary-500 outline-none cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </>
          )}

          {/* ── Categories section ── */}
          {activeSection === "categories" && (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-1">Business Categories</p>
                <p className="text-xs text-surface-400">Select all categories that apply to this vendor. Changes are saved when you click "Save Changes".</p>
              </div>
              {catLoading ? (
                <p className="text-sm text-surface-400 py-4 text-center">Loading categories…</p>
              ) : (
                <CategoryPicker selected={categoryIds} onChange={setCategoryIds} />
              )}
            </div>
          )}

          {error && <p className="text-xs text-danger-600 bg-danger-50 border border-danger-200 rounded-xl px-4 py-2">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-surface-100 bg-surface-50/50 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-surface-600 border border-surface-200 bg-white hover:bg-surface-50 transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700 transition-colors cursor-pointer border-0 disabled:opacity-50"
          >
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Vendor"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Vendor Detail Panel ── */
function VendorDetailPanel({ vendor, onClose, onStatusChange, onEdit }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!vendor?.id) return;
    adminVendorsAPI.getCategories(vendor.id)
      .then(res => setCategories(res?.data || []))
      .catch(() => {});
  }, [vendor?.id]);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-surface-200 shadow-2xl flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 flex-shrink-0">
        <h2 className="text-sm font-bold text-surface-900">Vendor Details</h2>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-100 text-surface-400 transition-colors border-0 bg-transparent cursor-pointer">
          <X size={16} />
        </button>
      </div>

      <div className="px-6 py-5 border-b border-surface-100">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-primary-600">{(vendor.business_name || vendor.name || "?").charAt(0)}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-surface-900">{vendor.business_name || vendor.name}</h3>
              {vendor.status === "active" && <BadgeCheck size={16} className="text-primary-600" />}
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={vendor.status} />
              <PlanBadge plan={vendor.subscription_plan || vendor.plan} />
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          {vendor.city && <div className="flex items-center gap-2 text-surface-600"><MapPin size={13} className="text-surface-400" />{vendor.city}</div>}
          <div className="flex items-center gap-2 text-surface-600"><Calendar size={13} className="text-surface-400" />Joined {vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : "—"}</div>
          {vendor.email && <div className="col-span-2 text-xs text-surface-400 truncate">{vendor.email}</div>}
          {vendor.phone && <div className="col-span-2 text-xs text-surface-400">{vendor.phone}</div>}
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 py-4 border-b border-surface-100">
        <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <Tag size={11} /> Categories
        </h4>
        {categories.length === 0 ? (
          <p className="text-xs text-surface-400 italic">No categories assigned — click Edit to add some.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <span key={cat.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-50 border border-primary-100 text-xs font-semibold text-primary-700">
                {cat.emoji && <span>{cat.emoji}</span>}
                {cat.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-b border-surface-100">
        <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3">Stats</h4>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Package, label: "Products", value: vendor.product_count || 0 },
            { icon: Calendar, label: "Bookings", value: vendor.booking_count || "—" },
            { icon: DollarSign, label: "Revenue", value: `$${vendor.total_revenue || "0"}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-surface-50 rounded-xl p-3 text-center">
              <Icon size={14} className="text-surface-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-surface-900">{value}</p>
              <p className="text-xs text-surface-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-surface-100 flex flex-col gap-2 flex-shrink-0 mt-auto">
        <button
          onClick={() => { onEdit(vendor); onClose(); }}
          className="w-full py-2 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-600 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 border-0 cursor-pointer"
        >
          <Pencil size={13} /> Edit Vendor
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { onStatusChange(vendor.id, vendor.status === "active" ? "suspended" : "active"); onClose(); }}
            className="py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 border-0 cursor-pointer"
          >
            <ShieldOff size={13} /> {vendor.status === "active" ? "Suspend" : "Activate"}
          </button>
          <button className="py-2 rounded-xl bg-surface-50 hover:bg-surface-100 text-surface-600 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 border border-surface-200 cursor-pointer bg-white">
            <MessageSquare size={13} /> Message
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function VendorsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editVendor, setEditVendor] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPrefill, setImportPrefill] = useState(null);
  const [toast, setToast] = useState(null); // { message, type }

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (activeTab !== "All") params.status = activeTab.toLowerCase();
      if (search) params.search = search;
      const res = await adminVendorsAPI.list(params);
      setVendors(res?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendors(); }, [activeTab]);
  useEffect(() => {
    const t = setTimeout(() => fetchVendors(), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleCreate = async (form) => {
    const res = await adminVendorsAPI.create(form);
    setVendors(prev => [res.data, ...prev]);
    return res.data; // return vendor so modal can save categories
  };

  const handleEdit = async (form) => {
    const res = await adminVendorsAPI.update(editVendor.id, form);
    setVendors(prev => prev.map(v => v.id === editVendor.id ? { ...v, ...res.data } : v));
    return res.data;
  };

  const handleStatusChange = async (id, status) => {
    try {
      await adminVendorsAPI.updateStatus(id, status);
      setVendors(prev => prev.map(v => v.id === id ? { ...v, status } : v));
    } catch (e) { console.error(e); }
  };

  const countByStatus = (s) => vendors.filter(v => v.status === s).length;

  const handleImported = (data) => {
    setImportPrefill(data);
    setEditVendor(null);
    setShowModal(true);
    setToast({ message: "Vendor info imported! Review and save.", type: "success" });
  };

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        title="Vendors"
        subtitle="Manage vendor accounts"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-surface-50 text-surface-700 text-sm font-semibold rounded-lg transition-colors border border-surface-200 cursor-pointer"
            >
              <Link2 size={14} /> Import from Website
            </button>
            <button
              onClick={() => { setEditVendor(null); setImportPrefill(null); setShowModal(true); }}
              className="flex items-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors border-0 cursor-pointer"
            >
              <UserPlus size={14} /> Add Vendor
            </button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-5 overflow-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Vendors", value: vendors.length,              color: "text-blue-600" },
            { label: "Active",        value: countByStatus("active"),     color: "text-green-600" },
            { label: "Pending",       value: countByStatus("pending"),    color: "text-amber-600" },
            { label: "Suspended",     value: countByStatus("suspended"),  color: "text-red-600" },
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
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border-0 cursor-pointer ${activeTab === tab ? "bg-primary-600 text-white" : "text-surface-500 hover:bg-surface-100 bg-transparent"}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <div className="flex items-center bg-surface-50 rounded-lg px-3 py-2 border border-surface-200 w-[220px] gap-2 focus-within:border-primary-400 transition-colors">
            <svg className="w-3.5 h-3.5 text-surface-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors…"
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-surface-400" />
          </div>
          <span className="text-xs text-surface-400">{vendors.length} results</span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="py-16 text-center text-sm text-surface-400">Loading vendors…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {vendors.map(v => (
              <div key={v.id} className={`bg-white rounded-xl border overflow-hidden transition-all ${selectedVendor?.id === v.id ? "border-primary-300 ring-2 ring-primary-100" : "border-surface-200 hover:border-surface-300"}`}>
                <div className="h-14 bg-gradient-to-r from-surface-100 to-surface-50" />
                <div className="px-4 pb-4 -mt-5">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 border-2 border-white flex items-center justify-center shadow-sm mb-2">
                    <span className="text-sm font-bold text-primary-600">{(v.business_name || v.name || "?").charAt(0)}</span>
                  </div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h3 className="text-sm font-bold text-surface-900 leading-tight">{v.business_name || v.name}</h3>
                      <p className="text-xs text-surface-500 mt-0.5">{v.category_name || v.category || v.email}</p>
                    </div>
                    <StatusBadge status={v.status} />
                  </div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <PlanBadge plan={v.subscription_plan || v.plan} />
                    {v.city && <span className="flex items-center gap-1 text-xs text-surface-400"><MapPin size={11} />{v.city}</span>}
                  </div>
                  <StarRating rating={v.rating || v.avg_rating} />
                  <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-surface-50 rounded-lg p-2 text-center">
                      <p className="font-bold text-surface-800">{v.product_count || 0}</p>
                      <p className="text-surface-400">Products</p>
                    </div>
                    <div className="bg-surface-50 rounded-lg p-2 text-center">
                      <p className="font-bold text-surface-800">${v.total_revenue || "0"}</p>
                      <p className="text-surface-400">Revenue</p>
                    </div>
                  </div>
                  <div className="mt-2.5 flex gap-2">
                    <button
                      onClick={() => setSelectedVendor(selectedVendor?.id === v.id ? null : v)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-600 text-xs font-semibold transition-colors border-0 cursor-pointer"
                    >
                      <Eye size={12} /> View
                    </button>
                    <button
                      onClick={() => { setEditVendor(v); setImportPrefill(null); setShowModal(true); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-surface-50 hover:bg-surface-100 text-surface-600 text-xs font-semibold transition-colors border border-surface-200 cursor-pointer bg-white"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {vendors.length === 0 && (
              <div className="col-span-full py-16 text-center text-sm text-surface-400">No vendors found</div>
            )}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selectedVendor && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setSelectedVendor(null)} />
          <VendorDetailPanel
            vendor={selectedVendor}
            onClose={() => setSelectedVendor(null)}
            onStatusChange={handleStatusChange}
            onEdit={(v) => { setEditVendor(v); setImportPrefill(null); setShowModal(true); }}
          />
        </>
      )}

      {/* Create/Edit modal */}
      {showModal && (
        <VendorModal
          onClose={() => { setShowModal(false); setEditVendor(null); setImportPrefill(null); }}
          onSave={editVendor ? handleEdit : handleCreate}
          initial={editVendor}
          prefill={importPrefill}
        />
      )}

      {/* Import from Website modal */}
      {showImportModal && (
        <ImportFromWebsiteModal
          onClose={() => setShowImportModal(false)}
          onImported={handleImported}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}
    </div>
  );
}
