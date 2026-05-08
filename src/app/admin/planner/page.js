"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Plus, Pencil, Trash2, X, ChevronDown, ChevronUp,
  GripVertical, Eye, EyeOff, Search, Check, Loader2,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import { adminPlannerAPI } from "@/lib/api";

// ── Constants ─────────────────────────────────────────────────────────────────

const ENTITY_TYPES = ["product", "service", "vendor", "venue", "custom"];
const STATUSES     = ["active", "inactive"];
const LOCALES      = [
  { key: "en", label: "EN", placeholder_title: "e.g. Christening / Baptism", placeholder_desc: "Short description…" },
  { key: "hy", label: "HY", placeholder_title: "e.g. Մկրտություն", placeholder_desc: "Կարճ նկարագրություն…" },
  { key: "ru", label: "RU", placeholder_title: "e.g. Крестины", placeholder_desc: "Краткое описание…" },
];

const ACCENT_PRESETS = [
  "#e11d5c","#f97316","#eab308","#22c55e","#3b82f6",
  "#7c3aed","#0ea5e9","#ec4899","#475569","#d97706",
];

const DEFAULT_ET_FORM = {
  slug: "", accent: "#e11d5c", gradient: "linear-gradient(135deg,#e11d5c,#f43f5e)",
  icon: "", image_url: "", status: "active", sort_order: 100,
  title_en: "", description_en: "", title_hy: "", description_hy: "", title_ru: "", description_ru: "",
};

const DEFAULT_CI_FORM = {
  item_key: "", entity_type: "custom", category_slug: "", search_query: "",
  can_search: false, is_required: false, is_default: true,
  sort_order: 10, icon: "", status: "active",
  title_en: "", description_en: "", title_hy: "", description_hy: "", title_ru: "", description_ru: "",
};

// ── Small helpers ─────────────────────────────────────────────────────────────

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

function Field({ label, value, onChange, placeholder, mono, type = "text", small }) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-surface-700 mb-1">{label}</label>}
      <input
        type={type}
        value={value ?? ""}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-xl border border-surface-200 text-sm placeholder:text-surface-400 focus:border-primary-500 outline-none transition-colors ${mono ? "font-mono text-surface-500 bg-surface-50" : "text-surface-800"} ${small ? "py-1.5 text-xs" : ""}`}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-surface-700 mb-1">{label}</label>}
      <select
        value={value ?? ""}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-surface-200 text-sm text-surface-800 bg-white focus:border-primary-500 outline-none cursor-pointer"
      >
        {options.map(o => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${checked ? "bg-primary-500" : "bg-surface-300"}`}
      >
        <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </div>
      <span className="text-xs text-surface-700">{label}</span>
    </label>
  );
}

// ── Locale tabs ───────────────────────────────────────────────────────────────

function LocaleTabs({ active, onChange }) {
  return (
    <div className="flex gap-1 bg-surface-100 rounded-lg p-0.5 w-fit">
      {LOCALES.map(l => (
        <button
          key={l.key}
          onClick={() => onChange(l.key)}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer border-0 ${active === l.key ? "bg-white text-primary-600 shadow-sm" : "text-surface-500 hover:text-surface-700"}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

// ── Checklist item row ────────────────────────────────────────────────────────

function ChecklistRow({ item, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-surface-100 bg-white hover:border-surface-200 transition-colors group">
      <GripVertical size={14} className="text-surface-300 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-surface-800 truncate">{item.title_en || item.item_key}</span>
          <span className="font-mono text-xs text-surface-400 bg-surface-50 px-1.5 py-0.5 rounded">{item.item_key}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${item.entity_type === "custom" ? "bg-surface-100 text-surface-500" : "bg-blue-50 text-blue-600"}`}>
            {item.entity_type}
          </span>
          {item.can_search && <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full">searchable</span>}
          {item.is_required && <span className="text-xs bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded-full">required</span>}
          {item.status === "inactive" && <span className="text-xs bg-surface-100 text-surface-400 px-1.5 py-0.5 rounded-full">inactive</span>}
        </div>
        {item.category_slug && (
          <p className="text-xs text-surface-400 mt-0.5">{item.category_slug}</p>
        )}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-500 hover:text-surface-700 cursor-pointer border-0 bg-transparent">
          <Pencil size={13} />
        </button>
        <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg hover:bg-danger-50 text-surface-500 hover:text-danger-600 cursor-pointer border-0 bg-transparent">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Checklist item modal ──────────────────────────────────────────────────────

function ChecklistItemModal({ item, eventTypeId, onSave, onClose }) {
  const [form, setForm] = useState(item ? { ...item } : { ...DEFAULT_CI_FORM });
  const [locale, setLocale] = useState("en");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setF = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const locConf = LOCALES.find(l => l.key === locale);

  const handleSave = async () => {
    if (!form.item_key || !form.title_en) { setError("Item key and English title are required."); return; }
    setSaving(true); setError("");
    try {
      if (item) {
        await adminPlannerAPI.updateChecklistItem(item.id, form);
      } else {
        await adminPlannerAPI.createChecklistItem(eventTypeId, form);
      }
      onSave();
    } catch (e) {
      setError(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h3 className="font-semibold text-surface-800">{item ? "Edit Checklist Item" : "Add Checklist Item"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 cursor-pointer border-0 bg-transparent text-surface-500"><X size={16} /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Item Key *" value={form.item_key} onChange={v => { setF("item_key", slugify(v)); }} placeholder="e.g. cake" mono />
            <Field label="Icon" value={form.icon} onChange={v => setF("icon", v)} placeholder="e.g. cake" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Entity Type" value={form.entity_type} onChange={v => setF("entity_type", v)} options={ENTITY_TYPES} />
            <Select label="Status" value={form.status} onChange={v => setF("status", v)} options={STATUSES} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category Slug" value={form.category_slug} onChange={v => setF("category_slug", v)} placeholder="e.g. cakes-desserts" mono />
            <Field label="Search Query" value={form.search_query} onChange={v => setF("search_query", v)} placeholder="e.g. wedding cake" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sort Order" value={form.sort_order} onChange={v => setF("sort_order", parseInt(v) || 0)} type="number" />
          </div>
          <div className="flex gap-6">
            <Toggle label="Can Search" checked={form.can_search} onChange={v => setF("can_search", v)} />
            <Toggle label="Required" checked={form.is_required} onChange={v => setF("is_required", v)} />
            <Toggle label="Default" checked={form.is_default} onChange={v => setF("is_default", v)} />
          </div>

          <div className="border-t border-surface-100 pt-4 space-y-3">
            <LocaleTabs active={locale} onChange={setLocale} />
            <Field
              label={`Title (${locale.toUpperCase()}) *`}
              value={form[`title_${locale}`]}
              onChange={v => setF(`title_${locale}`, v)}
              placeholder={locConf.placeholder_title}
            />
            <Field
              label={`Description (${locale.toUpperCase()})`}
              value={form[`description_${locale}`]}
              onChange={v => setF(`description_${locale}`, v)}
              placeholder={locConf.placeholder_desc}
            />
          </div>

          {error && <p className="text-xs text-danger-600 bg-danger-50 border border-danger-200 rounded-xl px-4 py-2">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-surface-600 hover:text-surface-800 cursor-pointer border-0 bg-transparent">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 disabled:opacity-50 cursor-pointer border-0 flex items-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {item ? "Update" : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Event type side drawer ────────────────────────────────────────────────────

function EventTypeDrawer({ eventType, onSave, onClose }) {
  const isNew = !eventType;
  const [form, setForm]     = useState(isNew ? { ...DEFAULT_ET_FORM } : { ...eventType });
  const [locale, setLocale] = useState("en");
  const [tab, setTab]       = useState("details"); // "details" | "checklist"
  const [checklist, setChecklist]   = useState([]);
  const [loadingCl, setLoadingCl]   = useState(false);
  const [ciModal, setCiModal]       = useState(null); // null | "new" | item
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");

  const setF = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const locConf = LOCALES.find(l => l.key === locale);

  // Load checklist when switching to checklist tab (only for existing event types)
  useEffect(() => {
    if (tab !== "checklist" || isNew || !eventType?.id) return;
    setLoadingCl(true);
    adminPlannerAPI.getChecklist(eventType.id)
      .then(res => setChecklist(res?.data?.items || []))
      .catch(() => {})
      .finally(() => setLoadingCl(false));
  }, [tab]);

  const reloadChecklist = useCallback(() => {
    if (!eventType?.id) return;
    adminPlannerAPI.getChecklist(eventType.id)
      .then(res => setChecklist(res?.data?.items || []))
      .catch(() => {});
  }, [eventType?.id]);

  const handleDeleteItem = async (itemId) => {
    if (!confirm("Delete this checklist item?")) return;
    await adminPlannerAPI.deleteChecklistItem(itemId);
    reloadChecklist();
  };

  const handleSave = async () => {
    if (!form.slug || !form.title_en) { setError("Slug and English title are required."); return; }
    setSaving(true); setError("");
    try {
      if (isNew) {
        await adminPlannerAPI.createEventType(form);
      } else {
        await adminPlannerAPI.updateEventType(eventType.id, form);
      }
      onSave();
    } catch (e) {
      setError(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 flex-shrink-0">
          <div>
            <h2 className="font-semibold text-surface-800">{isNew ? "New Event Type" : `Edit: ${form.title_en || form.slug}`}</h2>
            {!isNew && <p className="text-xs text-surface-400 mt-0.5 font-mono">{eventType.slug}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-100 cursor-pointer border-0 bg-transparent text-surface-500"><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-surface-100 px-6 flex-shrink-0">
          {[
            { key: "details", label: "Details" },
            { key: "checklist", label: `Checklist${checklist.length ? ` (${checklist.length})` : ""}`, disabled: isNew },
          ].map(t => (
            <button
              key={t.key}
              disabled={t.disabled}
              onClick={() => !t.disabled && setTab(t.key)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors cursor-pointer border-0 bg-transparent ${tab === t.key ? "border-primary-500 text-primary-600" : "border-transparent text-surface-500 hover:text-surface-700"} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "details" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Slug *" value={form.slug} onChange={v => setF("slug", slugify(v))} placeholder="e.g. christening" mono />
                <Field label="Icon key" value={form.icon} onChange={v => setF("icon", v)} placeholder="e.g. church" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select label="Status" value={form.status} onChange={v => setF("status", v)} options={STATUSES} />
                <Field label="Sort Order" value={form.sort_order} onChange={v => setF("sort_order", parseInt(v) || 0)} type="number" />
              </div>

              {/* Accent color */}
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-2">Accent Color</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {ACCENT_PRESETS.map(c => (
                    <button
                      key={c}
                      onClick={() => setF("accent", c)}
                      style={{ backgroundColor: c }}
                      className={`w-7 h-7 rounded-full border-4 transition-all cursor-pointer ${form.accent === c ? "border-surface-800 scale-110" : "border-transparent"}`}
                    />
                  ))}
                  <input
                    type="color"
                    value={form.accent}
                    onChange={e => setF("accent", e.target.value)}
                    className="w-7 h-7 rounded-full cursor-pointer border border-surface-200 p-0.5 bg-white"
                  />
                </div>
              </div>

              {/* Gradient */}
              <Field label="Gradient CSS" value={form.gradient} onChange={v => setF("gradient", v)} placeholder="linear-gradient(135deg,#e11d5c,#f43f5e)" />

              {/* Preview strip */}
              {(form.accent || form.gradient) && (
                <div className="h-8 rounded-xl" style={{ background: form.gradient || form.accent }} />
              )}

              {/* Translations */}
              <div className="border-t border-surface-100 pt-4 space-y-3">
                <LocaleTabs active={locale} onChange={setLocale} />
                <Field
                  label={`Title (${locale.toUpperCase()}) *`}
                  value={form[`title_${locale}`]}
                  onChange={v => {
                    setF(`title_${locale}`, v);
                    if (locale === "en" && isNew) setF("slug", slugify(v));
                  }}
                  placeholder={locConf.placeholder_title}
                />
                <Field
                  label={`Description (${locale.toUpperCase()})`}
                  value={form[`description_${locale}`]}
                  onChange={v => setF(`description_${locale}`, v)}
                  placeholder={locConf.placeholder_desc}
                />
              </div>

              {error && <p className="text-xs text-danger-600 bg-danger-50 border border-danger-200 rounded-xl px-4 py-2">{error}</p>}
            </div>
          )}

          {tab === "checklist" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-surface-500">{checklist.length} item{checklist.length !== 1 ? "s" : ""}</p>
                <button
                  onClick={() => setCiModal("new")}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 cursor-pointer border-0"
                >
                  <Plus size={13} /> Add Item
                </button>
              </div>
              {loadingCl ? (
                <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-surface-400" /></div>
              ) : checklist.length === 0 ? (
                <div className="text-center py-8 text-surface-400 text-sm">No checklist items yet</div>
              ) : (
                <div className="space-y-2">
                  {checklist.map(item => (
                    <ChecklistRow
                      key={item.id}
                      item={item}
                      onEdit={it => setCiModal(it)}
                      onDelete={handleDeleteItem}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer — only show Save on details tab */}
        {tab === "details" && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-100 flex-shrink-0">
            <button onClick={onClose} className="px-4 py-2 text-sm text-surface-600 hover:text-surface-800 cursor-pointer border-0 bg-transparent">Cancel</button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 disabled:opacity-50 cursor-pointer border-0 flex items-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {isNew ? "Create" : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* Checklist item modal */}
      {ciModal && (
        <ChecklistItemModal
          item={ciModal === "new" ? null : ciModal}
          eventTypeId={eventType?.id}
          onSave={() => { setCiModal(null); reloadChecklist(); }}
          onClose={() => setCiModal(null)}
        />
      )}
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminPlannerPage() {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [drawer, setDrawer]         = useState(null); // null | "new" | eventTypeRow

  const load = useCallback(() => {
    setLoading(true);
    adminPlannerAPI.listEventTypes()
      .then(res => setEventTypes(res?.data?.event_types || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this event type and all its checklist items? This cannot be undone.")) return;
    await adminPlannerAPI.deleteEventType(id);
    load();
  };

  const filtered = eventTypes.filter(et =>
    !search || et.slug.includes(search.toLowerCase()) || et.title_en?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-surface-50">
      <TopBar title="Event Planner" subtitle="Manage event types and their checklist templates" />

      <div className="flex-1 overflow-auto p-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="relative max-w-xs w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search event types…"
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-surface-200 text-sm focus:border-primary-500 outline-none"
            />
          </div>
          <button
            onClick={() => setDrawer("new")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 cursor-pointer border-0 whitespace-nowrap"
          >
            <Plus size={16} /> Add Event Type
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-surface-400" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-surface-400">
            <p className="text-sm">{search ? "No event types match your search." : "No event types yet."}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100 text-xs font-semibold text-surface-500 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Event Type</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Slug</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Sort</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {filtered.map(et => (
                  <tr key={et.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* Color dot */}
                        <div
                          className="w-6 h-6 rounded-lg flex-shrink-0"
                          style={{ background: et.gradient || et.accent || "#e11d5c" }}
                        />
                        <div>
                          <p className="font-medium text-surface-800">{et.title_en || et.slug}</p>
                          {et.title_hy && <p className="text-xs text-surface-400">{et.title_hy}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="font-mono text-xs text-surface-500 bg-surface-50 px-2 py-0.5 rounded">{et.slug}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-surface-500 text-xs">{et.sort_order}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${et.status === "active" ? "bg-green-50 text-green-700" : "bg-surface-100 text-surface-400"}`}>
                        {et.status === "active" ? <Eye size={10} /> : <EyeOff size={10} />}
                        {et.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDrawer(et)}
                          className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-500 hover:text-surface-700 cursor-pointer border-0 bg-transparent"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(et.id)}
                          className="p-1.5 rounded-lg hover:bg-danger-50 text-surface-500 hover:text-danger-600 cursor-pointer border-0 bg-transparent"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Side drawer */}
      {drawer && (
        <EventTypeDrawer
          eventType={drawer === "new" ? null : drawer}
          onSave={() => { setDrawer(null); load(); }}
          onClose={() => setDrawer(null)}
        />
      )}
    </div>
  );
}
