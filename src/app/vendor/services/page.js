"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus, Pencil, Trash2, ArrowLeft, Eye, EyeOff,
  Filter, Star, Clock, Save, Send,
  ChevronDown, ChevronUp, Tag, Briefcase, DollarSign,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import ImageManager from "@/components/ImageManager";
import RichTextEditor from "@/components/RichTextEditor";
import { vendorAPI, adminCategoriesAPI } from "@/lib/api";
import { useLocale } from "@/lib/i18n";

/* ─── locale-aware name helper ───────────────────────────────────────────── */
function getLocName(item, locale) {
  if (!item) return "";
  if (locale === "en") return item.name || "";
  const trans = (item.translations || []).find(tr => tr.locale === locale);
  return trans?.name || item.name || "";
}

/* ─── constants ──────────────────────────────────────────────────────────── */
const GRADIENTS = [
  "from-pink-400 to-rose-500","from-violet-400 to-purple-500",
  "from-blue-400 to-indigo-500","from-emerald-400 to-green-500",
  "from-orange-400 to-amber-500","from-teal-400 to-cyan-500",
];
const LANGS = [
  { code: "en", flag: "🇺🇸", label: "EN" },
  { code: "hy", flag: "🇦🇲", label: "HY" },
  { code: "ru", flag: "🇷🇺", label: "RU" },
];

function getPricingTypes(t) {
  return [
    { label: t("services.pricing_fixed"),      value: "fixed" },
    { label: t("services.pricing_quote"),       value: "quote" },
    { label: t("services.pricing_starting"),    value: "starting_from" },
    { label: t("services.pricing_per_hour"),    value: "per_hour" },
    { label: t("services.pricing_per_person"),  value: "per_person" },
    { label: t("services.pricing_per_day"),     value: "per_day" },
    { label: t("services.pricing_package"),     value: "package" },
  ];
}

/* ─── helpers ────────────────────────────────────────────────────────────── */
function Inp({ label, placeholder, type = "text", prefix, suffix, value, onChange, required }) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-surface-700 mb-1.5">
          {label}{required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-0 inset-y-0 flex items-center px-3 text-sm font-medium text-surface-500 bg-surface-50 border-r border-surface-200 rounded-l-xl select-none">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full py-2.5 border border-surface-200 rounded-xl text-sm bg-white text-surface-800 placeholder:text-surface-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all ${prefix ? "pl-16 pr-3.5" : "px-3.5"} ${suffix ? "pr-12" : ""}`}
        />
        {suffix && <span className="absolute right-3 text-xs text-surface-400 select-none">{suffix}</span>}
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-50 transition-colors cursor-pointer border-none bg-transparent"
      >
        <div className="flex items-center gap-2.5">
          {Icon && <Icon size={15} className="text-primary-500" />}
          <span className="text-sm font-bold text-surface-900">{title}</span>
        </div>
        {open ? <ChevronUp size={15} className="text-surface-400" /> : <ChevronDown size={15} className="text-surface-400" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-4 border-t border-surface-100">{children}</div>}
    </div>
  );
}

function TagInput({ label, value = [], onChange }) {
  const [val, setVal] = useState("");
  const add = e => {
    if ((e.key === "Enter" || e.key === ",") && val.trim()) {
      e.preventDefault();
      onChange([...value, val.trim()]);
      setVal("");
    }
  };
  const remove = i => onChange(value.filter((_, j) => j !== i));
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-surface-700 mb-1.5">{label}</label>}
      <div className="flex flex-wrap gap-1.5 p-2.5 border border-surface-200 rounded-xl bg-white min-h-[42px] focus-within:border-primary-400 transition-colors">
        {value.map((t, i) => (
          <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-600 text-xs font-medium rounded-lg">
            {t}
            <button onClick={() => remove(i)} className="border-none bg-transparent cursor-pointer text-primary-400 hover:text-primary-600">×</button>
          </span>
        ))}
        <input
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={add}
          placeholder={value.length === 0 ? "Type and press Enter…" : ""}
          className="flex-1 min-w-[140px] border-none outline-none text-sm text-surface-700 placeholder:text-surface-400 bg-transparent"
        />
      </div>
    </div>
  );
}

function getInitialTrans(translations, locale) {
  const t = (translations || []).find(t => t.locale === locale) || {};
  return {
    name:              t.name              || "",
    description:       t.description       || "",
    short_description: t.short_description || t.short_desc || "",
  };
}

/* ─── Full-page service editor ───────────────────────────────────────────── */
function ServiceEditor({ initial, categories, onBack, onCreate, onUpdate, t }) {
  const isNew = !initial?.id;
  const [serviceId, setServiceId] = useState(initial?.id || null);
  const [images, setImages]       = useState(initial?.images || []);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [activeLang, setActiveLang] = useState("en");
  // Lead time (hours) → friendly value+unit
  const initialLeadHours = initial?.lead_time_hours ?? initial?.min_lead_time_hours ?? null;
  const [leadValue, leadUnit] = (() => {
    if (initialLeadHours == null || initialLeadHours === 0) return ["", "hours"];
    if (initialLeadHours % 24 === 0) return [String(initialLeadHours / 24), "days"];
    return [String(initialLeadHours), "hours"];
  })();

  const [form, setForm] = useState({
    name:              initial?.name              || "",
    description:       initial?.description       || "",
    short_description: initial?.short_description || initial?.short_desc || "",
    category_id:       initial?.category_id       || "",
    pricing_type:      initial?.pricing_type      || "fixed",
    base_price:        initial?.base_price        ?? "",
    currency:          initial?.currency          || "AMD",
    duration_hours:    initial?.duration_hours ?? initial?.duration_hrs ?? "",
    tags:              initial?.tags              || [],
    service_area:      initial?.service_area      || [],
    status:            initial?.status            || "draft",
    is_featured:       initial?.is_featured       || false,
    lead_time:         leadValue,
    lead_time_unit:    leadUnit,
  });
  const [transForm, setTransForm] = useState({
    hy: getInitialTrans(initial?.translations, "hy"),
    ru: getInitialTrans(initial?.translations, "ru"),
  });

  const set = (k, v) => { setSaved(false); setForm(f => ({ ...f, [k]: v })); };
  const setTrans = (locale, k, v) => {
    setSaved(false);
    setTransForm(f => ({ ...f, [locale]: { ...f[locale], [k]: v } }));
  };

  const buildPayload = (status) => {
    const leadHours = form.lead_time !== "" && form.lead_time != null
      ? Math.max(0, Math.round(parseFloat(form.lead_time) * (form.lead_time_unit === "days" ? 24 : 1)))
      : null;
    return {
      name:              form.name.trim(),
      description:       form.description,
      short_description: form.short_description,
      pricing_type:      form.pricing_type,
      base_price:        form.base_price !== "" ? parseFloat(form.base_price) : null,
      currency:          form.currency || "AMD",
      duration_hours:    form.duration_hours !== "" ? parseFloat(form.duration_hours) : null,
      tags:              form.tags,
      service_area:      form.service_area,
      status:            status || form.status,
      is_featured:       form.is_featured,
      ...(leadHours != null ? { lead_time_hours: leadHours, min_lead_time_hours: leadHours } : {}),
      ...(form.category_id ? { category_id: form.category_id } : {}),
    };
  };

  const handleSave = async (statusOverride) => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = buildPayload(statusOverride);
      let sid = serviceId || initial?.id;
      if (isNew && !serviceId) {
        const res = await onCreate(payload);
        sid = res?.data?.id;
        if (sid) setServiceId(sid);
      } else {
        await onUpdate(sid, payload);
      }
      if (sid) {
        await Promise.all(
          ["hy", "ru"]
            .filter(loc => transForm[loc].name || transForm[loc].description || transForm[loc].short_description)
            .map(loc =>
              vendorAPI.upsertServiceTranslation(sid, loc, { ...transForm[loc] }).catch(() => {})
            )
        );
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error(e);
      alert("Save failed: " + (e?.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const currentTrans = activeLang !== "en" ? transForm[activeLang] : null;
  const PRICING_TYPES = getPricingTypes(t);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <div className="bg-white border-b border-surface-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-surface-600 hover:text-surface-900 cursor-pointer border-none bg-transparent transition-colors"
        >
          <ArrowLeft size={15} /> {t("services.back")}
        </button>
        <h2 className="text-sm font-bold text-surface-900">
          {isNew ? t("services.new_service") : `${t("products.edit_prefix")} ${initial.name}`}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving || !form.name.trim()}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-surface-700 bg-white border border-surface-200 rounded-lg hover:bg-surface-50 cursor-pointer disabled:opacity-40 transition-colors"
          >
            <Save size={14} /> {saving ? t("common.saving") : t("common.save_draft")}
          </button>
          <button
            onClick={() => handleSave("active")}
            disabled={saving || !form.name.trim()}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 cursor-pointer border-none disabled:opacity-40 transition-colors"
          >
            <Send size={14} /> {saved ? t("common.saved") : t("common.publish")}
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-5 p-6 max-w-[1200px] w-full mx-auto">
        <div className="flex-1 space-y-4 min-w-0">

          <Section title={t("services.section_basic")} icon={Briefcase} defaultOpen>
            <div className="flex gap-1.5 pt-1">
              {LANGS.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setActiveLang(lang.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                    activeLang === lang.code
                      ? "bg-primary-600 text-white shadow-sm"
                      : "bg-surface-100 text-surface-500 hover:bg-surface-200"
                  }`}
                >
                  {lang.flag} {lang.label}
                </button>
              ))}
              {activeLang !== "en" && (
                <span className="ml-auto text-[11px] text-surface-400 self-center">
                  {t("common.translation_note")}
                </span>
              )}
            </div>

            {activeLang === "en" && (
              <>
                <Inp label={t("services.service_name")} required placeholder={t("services.name_placeholder")} value={form.name} onChange={e => set("name", e.target.value)} />
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1.5">{t("common.description")}</label>
                  <RichTextEditor value={form.description} onChange={v => set("description", v)} placeholder={t("services.desc_placeholder")} minHeight={110} />
                </div>
                <Inp label={t("common.short_description")} placeholder={t("products.short_desc_placeholder")} value={form.short_description} onChange={e => set("short_description", e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-surface-700 mb-1.5">{t("common.category")}</label>
                    <select
                      value={form.category_id}
                      onChange={e => set("category_id", e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white outline-none cursor-pointer focus:border-primary-400"
                    >
                      <option value="">{t("common.select_category")}</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                    </select>
                  </div>
                  <Inp
                    label={t("services.duration")}
                    placeholder="e.g. 4"
                    type="number"
                    suffix={t("services.duration_suffix")}
                    value={form.duration_hours}
                    onChange={e => set("duration_hours", e.target.value)}
                  />
                </div>
              </>
            )}

            {activeLang !== "en" && currentTrans && (
              <>
                <Inp
                  label={`${t("services.service_name")} (${activeLang.toUpperCase()})`}
                  placeholder={activeLang === "hy" ? "Ծառայության անվանում հայերեն" : "Название услуги на русском"}
                  value={currentTrans.name}
                  onChange={e => setTrans(activeLang, "name", e.target.value)}
                />
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                    {t("common.description")} ({activeLang.toUpperCase()})
                  </label>
                  <RichTextEditor
                    value={currentTrans.description}
                    onChange={v => setTrans(activeLang, "description", v)}
                    placeholder={activeLang === "hy" ? "Նկարագրություն հայերեն…" : "Описание на русском…"}
                    minHeight={110}
                  />
                </div>
                <Inp
                  label={`${t("common.short_description")} (${activeLang.toUpperCase()})`}
                  placeholder={activeLang === "hy" ? "Կարճ նկարագրություն" : "Краткое описание"}
                  value={currentTrans.short_description}
                  onChange={e => setTrans(activeLang, "short_description", e.target.value)}
                />
              </>
            )}
          </Section>

          <Section title={t("services.section_tags")} icon={Tag} defaultOpen>
            <TagInput label={t("common.tags")} value={form.tags} onChange={v => set("tags", v)} />
            <TagInput label={t("services.service_areas")} value={form.service_area} onChange={v => set("service_area", v)} />
          </Section>

          <Section title={t("services.section_pricing")} icon={DollarSign} defaultOpen>
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-2">{t("services.pricing_type")}</label>
              <div className="grid grid-cols-4 gap-2">
                {PRICING_TYPES.map(pt => (
                  <button
                    key={pt.value}
                    onClick={() => set("pricing_type", pt.value)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border-2 cursor-pointer transition-all ${
                      form.pricing_type === pt.value
                        ? "border-primary-500 bg-primary-50 text-primary-600"
                        : "border-surface-200 bg-white text-surface-500 hover:border-surface-300"
                    }`}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Inp label={t("services.base_price")} placeholder="0" prefix={form.currency} type="number" value={form.base_price} onChange={e => set("base_price", e.target.value)} />
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1.5">{t("common.currency")}</label>
                <select
                  value={form.currency}
                  onChange={e => set("currency", e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white outline-none cursor-pointer focus:border-primary-400"
                >
                  {["AMD", "USD", "EUR", "RUB"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Min lead time / earliest delivery */}
            <div className="border-t border-surface-100 pt-4">
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                Min lead time
                <span className="ml-1.5 text-surface-400 font-normal text-[11px]">
                  (earliest the service can be delivered)
                </span>
              </label>
              <div className="flex items-stretch gap-2">
                <input
                  type="number"
                  min="0"
                  step={form.lead_time_unit === "hours" ? "1" : "0.5"}
                  value={form.lead_time}
                  onChange={e => set("lead_time", e.target.value)}
                  placeholder={form.lead_time_unit === "hours" ? "e.g. 4" : "e.g. 2"}
                  className="flex-1 px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white text-surface-800 placeholder:text-surface-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                />
                <div className="flex bg-surface-100 rounded-xl p-1 border border-surface-200">
                  {["hours", "days"].map(u => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => set("lead_time_unit", u)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                        form.lead_time_unit === u
                          ? "bg-white text-primary-700 shadow-sm"
                          : "bg-transparent text-surface-500 hover:text-surface-700"
                      }`}
                    >
                      {u === "hours" ? "Hours" : "Days"}
                    </button>
                  ))}
                </div>
              </div>
              {form.lead_time && parseFloat(form.lead_time) > 0 ? (
                <p className="text-[11px] text-primary-600 mt-1.5 font-medium">
                  Customers can only book at least {form.lead_time} {form.lead_time_unit} ahead.
                </p>
              ) : (
                <p className="text-[11px] text-surface-400 mt-1.5">
                  Leave empty for instant / same-day availability.
                </p>
              )}
            </div>
          </Section>
        </div>

        <div className="w-[320px] flex-shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-surface-200 p-4">
            <p className="text-xs font-bold text-surface-700 uppercase tracking-wider mb-3">{t("common.visibility")}</p>
            <div className="flex gap-2 mb-4">
              {["draft", "active"].map(s => (
                <button
                  key={s}
                  onClick={() => set("status", s)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 cursor-pointer transition-all ${
                    form.status === s
                      ? s === "active"
                        ? "border-success-400 text-success-600 bg-white shadow-sm"
                        : "border-surface-300 text-surface-600 bg-white shadow-sm"
                      : "border-surface-100 text-surface-400 bg-surface-50 hover:border-surface-200"
                  }`}
                >
                  {s === "active" ? t("products.status_active") : t("products.status_draft")}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between py-3 border-t border-surface-100">
              <div>
                <p className="text-xs font-semibold text-surface-700">{t("services.featured")}</p>
                <p className="text-[11px] text-surface-400">{t("services.highlight_store")}</p>
              </div>
              <button
                onClick={() => set("is_featured", !form.is_featured)}
                style={{ width: 36, height: 20 }}
                className={`relative rounded-full cursor-pointer border-none flex-shrink-0 transition-colors ${form.is_featured ? "bg-primary-600" : "bg-surface-200"}`}
              >
                <span className={`absolute top-[3px] w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-all ${form.is_featured ? "left-[19px]" : "left-[3px]"}`} />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              <button
                onClick={() => handleSave("active")}
                disabled={saving || !form.name.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 cursor-pointer border-none disabled:opacity-40 transition-colors"
              >
                <Send size={14} /> {saving ? t("common.saving") : saved ? t("common.saved") : t("common.save_publish")}
              </button>
              <button
                onClick={() => handleSave("draft")}
                disabled={saving || !form.name.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-surface-50 text-surface-700 text-sm font-semibold rounded-xl border border-surface-200 hover:bg-surface-100 cursor-pointer disabled:opacity-40 transition-colors"
              >
                <Save size={14} /> {t("common.save_draft")}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-surface-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-surface-700 uppercase tracking-wider">{t("common.images")}</p>
              {images.length > 0 && <span className="text-[11px] text-surface-400">{images.length} {t("common.uploaded")}</span>}
            </div>
            {!serviceId && (
              <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-[11px] text-amber-700 font-medium">{t("services.save_first")}</p>
              </div>
            )}
            <ImageManager entityId={serviceId} type="service" images={images} onChange={setImages} />
          </div>

          {(form.name || form.base_price) && (
            <div className="bg-surface-50 rounded-2xl border border-surface-200 p-4">
              <p className="text-xs font-bold text-surface-700 uppercase tracking-wider mb-3">{t("common.summary")}</p>
              <div className="space-y-2 text-xs text-surface-600">
                {form.name && <div className="flex justify-between"><span className="text-surface-400">{t("common.name_label")}</span><span className="font-medium text-right max-w-[160px] truncate">{form.name}</span></div>}
                {form.base_price && <div className="flex justify-between"><span className="text-surface-400">{t("common.price_label")}</span><span className="font-medium">{form.currency} {parseFloat(form.base_price).toLocaleString()}</span></div>}
                {form.duration_hours && <div className="flex justify-between"><span className="text-surface-400">{t("services.duration")}</span><span className="font-medium">{form.duration_hours}{t("services.duration_suffix")}</span></div>}
                <div className="flex justify-between"><span className="text-surface-400">{t("common.images")}</span><span className="font-medium">{images.length}</span></div>
                <div className="flex justify-between">
                  <span className="text-surface-400">{t("common.languages")}</span>
                  <span className="font-medium text-primary-600">
                    EN{transForm.hy?.name ? " · HY" : ""}{transForm.ru?.name ? " · RU" : ""}
                  </span>
                </div>
                <div className="flex justify-between"><span className="text-surface-400">{t("common.status")}</span>
                  <span className={`font-bold ${form.status === "active" ? "text-success-600" : "text-surface-500"}`}>
                    {form.status === "active" ? t("products.status_active") : t("products.status_draft")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── List page ──────────────────────────────────────────────────────────── */
export default function VendorServices() {
  const { t, locale } = useLocale();
  const searchParams = useSearchParams();
  const [mode, setMode]               = useState("list");
  const [editService, setEditService] = useState(null);
  const [services, setServices]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterCat, setFilterCat]     = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const PRICING_TYPES = getPricingTypes(t);

  const fetchServices = useCallback(() => {
    return vendorAPI.services({ limit: 100, locale })
      .then(res => { setServices(res?.data || []); return res?.data || []; })
      .catch(() => [])
      .finally(() => setLoading(false));
  }, [locale]);

  const openEdit = useCallback(async (serviceOrId) => {
    const id = typeof serviceOrId === "string" ? serviceOrId : serviceOrId?.id;
    if (!id) return;
    try {
      const res = await vendorAPI.getService(id);
      setEditService(res?.data || (typeof serviceOrId === "object" ? serviceOrId : null));
    } catch {
      setEditService(typeof serviceOrId === "object" ? serviceOrId : null);
    }
    setMode("edit");
  }, []);

  useEffect(() => {
    const editId = searchParams?.get("edit");
    fetchServices().then(() => { if (editId) openEdit(editId); });
    adminCategoriesAPI.list().then(res => setCategories(res?.data || [])).catch(() => {});
  }, [locale]);

  const handleCreate   = async (data) => { const res = await vendorAPI.createService(data); fetchServices(); return res; };
  const handleUpdate   = async (id, data) => { await vendorAPI.updateService(id, data); fetchServices(); };
  const handleDelete   = async (id) => {
    if (!confirm("Delete this service?")) return;
    try { await vendorAPI.deleteService(id); setServices(prev => prev.filter(s => s.id !== id)); } catch (e) { console.error(e); }
  };
  const handlePublish   = async (id) => { try { await vendorAPI.publishService(id);   setServices(prev => prev.map(s => s.id === id ? { ...s, status: "active" } : s)); } catch (e) { console.error(e); } };
  const handleUnpublish = async (id) => { try { await vendorAPI.unpublishService(id); setServices(prev => prev.map(s => s.id === id ? { ...s, status: "draft" }  : s)); } catch (e) { console.error(e); } };
  const goBack = () => { setMode("list"); setEditService(null); fetchServices(); };

  if (mode === "create") return <ServiceEditor initial={null} categories={categories} onBack={goBack} onCreate={handleCreate} onUpdate={handleUpdate} t={t} />;
  if (mode === "edit" && editService) return <ServiceEditor initial={editService} categories={categories} onBack={goBack} onCreate={handleCreate} onUpdate={handleUpdate} t={t} />;

  const filtered = services.filter(s => {
    if (filterCat && s.category_id !== filterCat) return false;
    if (filterStatus && s.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar
        title={t("services.title")}
        subtitle={loading ? t("common.loading") : `${filtered.length} of ${services.length} services`}
        actions={
          <button onClick={() => setMode("create")} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 cursor-pointer border-none">
            <Plus size={15} /> {t("services.add_service")}
          </button>
        }
      />

      <div className="px-6 pt-4 pb-2 flex items-center gap-3">
        <Filter size={14} className="text-surface-400" />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-1.5 border border-surface-200 rounded-lg text-sm bg-white outline-none cursor-pointer text-surface-700">
          <option value="">{t("services.all_categories")}</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 border border-surface-200 rounded-lg text-sm bg-white outline-none cursor-pointer text-surface-700">
          <option value="">{t("services.all_statuses")}</option>
          <option value="active">{t("products.status_active")}</option>
          <option value="draft">{t("products.status_draft")}</option>
        </select>
        {(filterCat || filterStatus) && (
          <button onClick={() => { setFilterCat(""); setFilterStatus(""); }}
            className="text-xs text-primary-600 hover:underline cursor-pointer border-none bg-transparent">{t("common.clear")}</button>
        )}
      </div>

      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-surface-400">{t("services.loading")}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm text-surface-400">{services.length === 0 ? t("services.no_services") : t("services.no_match")}</p>
            {services.length === 0 && (
              <button onClick={() => setMode("create")} className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 cursor-pointer border-none">
                {t("services.add_first")}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((svc, idx) => {
              const thumb = svc.thumbnail_url || svc.images?.find(i => i.is_primary)?.url || svc.images?.[0]?.url;
              return (
                <div key={svc.id} className="bg-white rounded-xl border border-surface-200 overflow-hidden hover:shadow-elevated transition-all group">
                  <div className={`h-40 relative ${!thumb ? `bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]}` : ""}`}>
                    {thumb && <img src={thumb} alt={svc.name} className="w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                    <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => openEdit(svc)} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-card cursor-pointer border-none"><Pencil size={12} className="text-primary-600" /></button>
                      <button onClick={() => handleDelete(svc.id)} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-card cursor-pointer border-none"><Trash2 size={12} className="text-danger-500" /></button>
                    </div>
                    <span className={`absolute top-3 left-3 badge ${svc.status === "active" ? "badge-success" : "badge-gray"} text-[10px]`}>
                      {svc.status === "active" ? t("products.status_active") : t("products.status_draft")}
                    </span>
                    <div className="absolute bottom-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      {svc.status !== "active"
                        ? <button onClick={() => handlePublish(svc.id)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-white text-primary-600 rounded-lg cursor-pointer border-none shadow-card"><Eye size={10} />{t("common.publish")}</button>
                        : <button onClick={() => handleUnpublish(svc.id)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-white text-surface-600 rounded-lg cursor-pointer border-none shadow-card"><EyeOff size={10} />{t("common.unpublish")}</button>
                      }
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-surface-400 mb-1">{svc.category_name || categories.find(c => c.id === svc.category_id)?.name || "—"}</p>
                    <p className="text-sm font-semibold text-surface-800 mb-3 leading-snug line-clamp-2">{getLocName(svc, locale)}</p>
                    <div className="flex items-center gap-3 text-xs text-surface-500 mb-3">
                      {(svc.duration_hours > 0 || svc.duration_hrs > 0) && (
                        <span className="flex items-center gap-1"><Clock size={11} />{svc.duration_hours || svc.duration_hrs}{t("services.duration_suffix")}</span>
                      )}
                      {svc.review_count > 0 && (
                        <span className="flex items-center gap-1"><Star size={11} className="fill-warning-400 text-warning-400" />{svc.rating?.toFixed(1)}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-surface-900">{svc.currency || "AMD"} {Number(svc.base_price || 0).toLocaleString()}</span>
                      <span className="text-xs text-surface-400">{PRICING_TYPES.find(p => p.value === svc.pricing_type)?.label || svc.pricing_type || ""}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <button onClick={() => setMode("create")}
              className="border-2 border-dashed border-surface-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary-400 hover:bg-primary-50/30 transition-all cursor-pointer bg-transparent min-h-[240px]">
              <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center"><Plus size={20} className="text-surface-400" /></div>
              <p className="text-sm font-medium text-surface-400">{t("services.add_service")}</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
