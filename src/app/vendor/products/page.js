"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus, LayoutGrid, List, Pencil, Trash2, ArrowLeft,
  Eye, EyeOff, Filter, ImageIcon, Save, Send,
  ChevronDown, ChevronUp, Tag, Package, DollarSign,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import DataTable from "@/components/DataTable";
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
const STATUS_BADGE = {
  active:    "badge badge-success",
  out_stock: "badge badge-danger",
  draft:     "badge badge-gray",
};
const LANGS = [
  { code: "en", flag: "🇺🇸", label: "EN" },
  { code: "hy", flag: "🇦🇲", label: "HY" },
  { code: "ru", flag: "🇷🇺", label: "RU" },
];

/* ─── small helpers ──────────────────────────────────────────────────────── */
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
        {suffix && (
          <span className="absolute right-3 text-xs text-surface-400 select-none">{suffix}</span>
        )}
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

function getInitialTrans(translations, locale) {
  const t = (translations || []).find(t => t.locale === locale) || {};
  return {
    name:              t.name              || "",
    description:       t.description       || "",
    short_description: t.short_description || t.short_desc || "",
  };
}

/* ─── Full-page product editor ───────────────────────────────────────────── */
function ProductEditor({ initial, categories, onBack, onCreate, onUpdate, t }) {
  const isNew = !initial?.id;
  const [productId, setProductId] = useState(initial?.id || null);
  const [images, setImages]       = useState(initial?.images || []);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [activeLang, setActiveLang] = useState("en");
  const [form, setForm] = useState({
    name:              initial?.name              || "",
    description:       initial?.description       || "",
    short_description: initial?.short_description || "",
    category_id:       initial?.category_id       || "",
    price:             initial?.price             ?? "",
    compare_price:     initial?.compare_price     ?? "",
    currency:          initial?.currency          || "AMD",
    sku:               initial?.sku               || "",
    stock:             initial?.stock_qty ?? initial?.stock ?? "",
    tags:              (initial?.tags || []).join(", "),
    status:            initial?.status            || "draft",
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

  const buildPayload = (status) => ({
    name:              form.name.trim(),
    description:       form.description,
    short_description: form.short_description,
    price:             parseFloat(form.price) || 0,
    currency:          form.currency || "AMD",
    sku:               form.sku,
    stock_qty:         form.stock !== "" ? parseInt(form.stock) : null,
    status:            status || form.status,
    tags:              form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
    ...(form.category_id  ? { category_id:    form.category_id }              : {}),
    ...(form.compare_price !== "" ? { compare_price: parseFloat(form.compare_price) } : {}),
  });

  const handleSave = async (statusOverride) => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = buildPayload(statusOverride);
      let pid = productId || initial?.id;
      if (isNew && !productId) {
        const res = await onCreate(payload);
        pid = res?.data?.id;
        if (pid) setProductId(pid);
      } else {
        await onUpdate(pid, payload);
      }
      if (pid) {
        await Promise.all(
          ["hy", "ru"]
            .filter(loc => transForm[loc].name || transForm[loc].description || transForm[loc].short_description)
            .map(loc =>
              vendorAPI.upsertProductTranslation(pid, loc, { ...transForm[loc] }).catch(() => {})
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

  const STATUS_PILLS = [
    { v: "draft",     label: t("products.status_draft"),     color: "border-surface-300 text-surface-600" },
    { v: "active",    label: t("products.status_active"),    color: "border-success-400 text-success-600" },
    { v: "out_stock", label: t("products.status_out_stock"), color: "border-danger-300 text-danger-500" },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <div className="bg-white border-b border-surface-200 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-surface-600 hover:text-surface-900 cursor-pointer border-none bg-transparent transition-colors"
        >
          <ArrowLeft size={15} /> {t("products.back")}
        </button>
        <h2 className="text-sm font-bold text-surface-900">
          {isNew ? t("products.new_product") : `${t("products.edit_prefix")} ${initial.name}`}
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

          <Section title={t("products.section_basic")} icon={Package} defaultOpen>
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
                <Inp label={t("products.product_name")} required placeholder={t("products.name_placeholder")} value={form.name} onChange={e => set("name", e.target.value)} />
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1.5">{t("common.description")}</label>
                  <RichTextEditor value={form.description} onChange={v => set("description", v)} placeholder={t("products.desc_placeholder")} minHeight={110} />
                </div>
                <Inp label={t("common.short_description")} placeholder={t("products.short_desc_placeholder")} value={form.short_description} onChange={e => set("short_description", e.target.value)} />
              </>
            )}

            {activeLang !== "en" && currentTrans && (
              <>
                <Inp
                  label={`${t("products.product_name")} (${activeLang.toUpperCase()})`}
                  placeholder={activeLang === "hy" ? "Ապրանքի անվանում հայերեն" : "Название товара на русском"}
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

          <Section title={t("products.section_cat_tags")} icon={Tag} defaultOpen>
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
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">{t("common.tags")}</label>
              <input
                value={form.tags}
                onChange={e => set("tags", e.target.value)}
                placeholder={t("products.tags_placeholder")}
                className="w-full px-3.5 py-2.5 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 outline-none focus:border-primary-400 transition-all"
              />
              <p className="text-[11px] text-surface-400 mt-1">{t("products.tags_hint")}</p>
            </div>
          </Section>

          <Section title={t("products.section_pricing")} icon={DollarSign} defaultOpen>
            <div className="grid grid-cols-2 gap-4">
              <Inp label={t("common.price_label")} required placeholder="0" prefix="AMD" type="number" value={form.price} onChange={e => set("price", e.target.value)} />
              <Inp label={t("products.compare_price")} placeholder="0" prefix="AMD" type="number" value={form.compare_price} onChange={e => set("compare_price", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Inp label={t("products.sku")} placeholder={t("products.sku_placeholder")} value={form.sku} onChange={e => set("sku", e.target.value)} />
              <Inp label={t("products.stock_qty")} placeholder={t("products.stock_placeholder")} suffix={t("products.stock_units")} type="number" value={form.stock} onChange={e => set("stock", e.target.value)} />
            </div>
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
            {form.compare_price && parseFloat(form.compare_price) > parseFloat(form.price) && (
              <div className="flex items-center gap-2 p-3 bg-success-50 rounded-xl border border-success-100">
                <div className="w-1.5 h-1.5 rounded-full bg-success-500" />
                <p className="text-xs text-success-700 font-medium">
                  {Math.round((1 - parseFloat(form.price) / parseFloat(form.compare_price)) * 100)}{t("products.discount_note")}
                </p>
              </div>
            )}
          </Section>
        </div>

        <div className="w-[320px] flex-shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-surface-200 p-4">
            <p className="text-xs font-bold text-surface-700 uppercase tracking-wider mb-3">{t("common.visibility")}</p>
            <div className="flex gap-2">
              {STATUS_PILLS.map(opt => (
                <button
                  key={opt.v}
                  onClick={() => set("status", opt.v)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 cursor-pointer transition-all ${
                    form.status === opt.v
                      ? `${opt.color} bg-white shadow-sm`
                      : "border-surface-100 text-surface-400 bg-surface-50 hover:border-surface-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-2">
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
              {images.length > 0 && (
                <span className="text-[11px] text-surface-400">{images.length} {t("common.uploaded")}</span>
              )}
            </div>
            {!productId && (
              <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-[11px] text-amber-700 font-medium">{t("products.save_first")}</p>
              </div>
            )}
            <ImageManager entityId={productId} type="product" images={images} onChange={setImages} />
          </div>

          {(form.name || form.price) && (
            <div className="bg-surface-50 rounded-2xl border border-surface-200 p-4">
              <p className="text-xs font-bold text-surface-700 uppercase tracking-wider mb-3">{t("common.summary")}</p>
              <div className="space-y-2 text-xs text-surface-600">
                {form.name && <div className="flex justify-between"><span className="text-surface-400">{t("common.name_label")}</span><span className="font-medium text-right max-w-[160px] truncate">{form.name}</span></div>}
                {form.price && <div className="flex justify-between"><span className="text-surface-400">{t("common.price_label")}</span><span className="font-medium">{form.currency} {parseFloat(form.price).toLocaleString()}</span></div>}
                {form.sku && <div className="flex justify-between"><span className="text-surface-400">{t("products.sku")}</span><span className="font-medium">{form.sku}</span></div>}
                <div className="flex justify-between"><span className="text-surface-400">{t("common.images")}</span><span className="font-medium">{images.length}</span></div>
                <div className="flex justify-between">
                  <span className="text-surface-400">{t("common.languages")}</span>
                  <span className="font-medium text-primary-600">
                    EN{transForm.hy?.name ? " · HY" : ""}{transForm.ru?.name ? " · RU" : ""}
                  </span>
                </div>
                <div className="flex justify-between"><span className="text-surface-400">{t("common.status")}</span>
                  <span className={`font-bold ${form.status === "active" ? "text-success-600" : form.status === "out_stock" ? "text-danger-500" : "text-surface-500"}`}>
                    {form.status === "active" ? t("products.status_active") : form.status === "out_stock" ? t("products.status_out_stock") : t("products.status_draft")}
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

/* ─── Main list page ─────────────────────────────────────────────────────── */
export default function VendorProducts() {
  const { t, locale } = useLocale();
  const searchParams = useSearchParams();
  const [view, setView]               = useState("grid");
  const [mode, setMode]               = useState("list");
  const [editProduct, setEditProduct] = useState(null);
  const [products, setProducts]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterCat, setFilterCat]     = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchProducts = useCallback(() => {
    return vendorAPI.products({ limit: 100, locale })
      .then(res => { setProducts(res?.data || []); setLoading(false); return res?.data || []; })
      .catch(() => { setLoading(false); return []; });
  }, [locale]);

  const openEdit = useCallback(async (productOrId) => {
    const id = typeof productOrId === "string" ? productOrId : productOrId?.id;
    if (!id) return;
    try {
      const res = await vendorAPI.getProduct(id);
      setEditProduct(res?.data || (typeof productOrId === "object" ? productOrId : null));
    } catch {
      setEditProduct(typeof productOrId === "object" ? productOrId : null);
    }
    setMode("edit");
  }, []);

  useEffect(() => {
    const editId = searchParams?.get("edit");
    fetchProducts().then(list => { if (editId) openEdit(editId); });
    adminCategoriesAPI.list().then(res => setCategories(res?.data || [])).catch(() => {});
  }, [locale]);

  const handleCreate   = async (data) => { const res = await vendorAPI.createProduct(data); fetchProducts(); return res; };
  const handleUpdate   = async (id, data) => { await vendorAPI.updateProduct(id, data); fetchProducts(); };
  const handleDelete   = async (id) => {
    if (!confirm("Delete this product?")) return;
    try { await vendorAPI.deleteProduct(id); setProducts(prev => prev.filter(p => p.id !== id)); } catch (e) { console.error(e); }
  };
  const handlePublish  = async (id) => { try { await vendorAPI.publishProduct(id);   setProducts(prev => prev.map(p => p.id === id ? { ...p, status: "active" } : p)); } catch (e) { console.error(e); } };
  const handleUnpublish= async (id) => { try { await vendorAPI.unpublishProduct(id); setProducts(prev => prev.map(p => p.id === id ? { ...p, status: "draft" }  : p)); } catch (e) { console.error(e); } };
  const goBack = () => { setMode("list"); setEditProduct(null); fetchProducts(); };

  if (mode === "create") return <ProductEditor initial={null} categories={categories} onBack={goBack} onCreate={handleCreate} onUpdate={handleUpdate} t={t} />;
  if (mode === "edit" && editProduct) return <ProductEditor initial={editProduct} categories={categories} onBack={goBack} onCreate={handleCreate} onUpdate={handleUpdate} t={t} />;

  const filtered = products.filter(p => {
    if (filterCat && p.category_id !== filterCat) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    return true;
  });

  const listColumns = [
    { key: "name", label: t("products.product_name"), sortable: true, render: (val, row) => (
      <div className="flex items-center gap-3">
        {row.images?.[0]?.url || row.thumbnail_url
          ? <img src={row.images?.[0]?.url || row.thumbnail_url} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" alt="" />
          : <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${GRADIENTS[0]} flex-shrink-0`} />
        }
        <span className="font-medium text-surface-800">{getLocName(row, locale)}</span>
      </div>
    )},
    { key: "category_name", label: t("common.category"), sortable: true, render: v => v || "—" },
    { key: "price", label: t("common.price_label"), render: (v, row) => `${row.currency || "AMD"} ${v}` },
    { key: "stock_qty", label: t("products.stock_qty"), render: v => (
      <span className={v === 0 ? "text-danger-600 font-semibold" : "text-surface-700"}>
        {v === 0 ? t("common.out_of_stock") : v ?? "—"}
      </span>
    )},
    { key: "status", label: t("common.status"), render: v => (
      <span className={STATUS_BADGE[v] || "badge badge-gray"}>
        {v === "active" ? t("products.status_active") : v === "out_stock" ? t("products.status_out_stock") : t("products.status_draft")}
      </span>
    )},
    { key: "id", label: t("common.actions"), render: (id, row) => (
      <div className="flex gap-1.5">
        <button onClick={() => openEdit(row)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 cursor-pointer border-none">
          <Pencil size={12} /> {t("common.edit")}
        </button>
        {row.status !== "active"
          ? <button onClick={() => handlePublish(id)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-success-600 bg-success-50 rounded-lg hover:bg-success-100 cursor-pointer border-none"><Eye size={12} /> {t("common.publish")}</button>
          : <button onClick={() => handleUnpublish(id)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-warning-600 bg-warning-50 rounded-lg hover:bg-yellow-100 cursor-pointer border-none"><EyeOff size={12} /> {t("common.unpublish")}</button>
        }
        <button onClick={() => handleDelete(id)} className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-danger-600 bg-danger-50 rounded-lg hover:bg-red-100 cursor-pointer border-none">
          <Trash2 size={12} /> {t("common.delete")}
        </button>
      </div>
    )},
  ];

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar
        title={t("products.title")}
        subtitle={loading ? t("common.loading") : `${filtered.length} of ${products.length} products`}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-surface-200 rounded-lg overflow-hidden">
              <button onClick={() => setView("grid")} className={`w-8 h-8 flex items-center justify-center cursor-pointer border-none transition-colors ${view === "grid" ? "bg-primary-600 text-white" : "text-surface-500 hover:bg-surface-50"}`}><LayoutGrid size={15} /></button>
              <button onClick={() => setView("list")} className={`w-8 h-8 flex items-center justify-center cursor-pointer border-none transition-colors ${view === "list" ? "bg-primary-600 text-white" : "text-surface-500 hover:bg-surface-50"}`}><List size={15} /></button>
            </div>
            <button onClick={() => setMode("create")} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 cursor-pointer border-none transition-colors">
              <Plus size={15} /> {t("products.add_product")}
            </button>
          </div>
        }
      />

      <div className="px-6 pt-4 pb-2 flex items-center gap-3">
        <Filter size={14} className="text-surface-400" />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-1.5 border border-surface-200 rounded-lg text-sm bg-white outline-none cursor-pointer text-surface-700">
          <option value="">{t("products.all_categories")}</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 border border-surface-200 rounded-lg text-sm bg-white outline-none cursor-pointer text-surface-700">
          <option value="">{t("products.all_statuses")}</option>
          <option value="active">{t("products.status_active")}</option>
          <option value="draft">{t("products.status_draft")}</option>
          <option value="out_stock">{t("products.status_out_stock")}</option>
        </select>
        {(filterCat || filterStatus) && (
          <button onClick={() => { setFilterCat(""); setFilterStatus(""); }}
            className="text-xs text-primary-600 hover:underline cursor-pointer border-none bg-transparent">{t("common.clear")}</button>
        )}
      </div>

      <div className="flex-1 p-6">
        {loading ? (
          <div className="py-16 text-center text-sm text-surface-400">{t("products.loading")}</div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p, i) => {
              const thumb = p.thumbnail_url || p.images?.find(img => img.is_primary)?.url || p.images?.[0]?.url;
              return (
                <div key={p.id} className="bg-white rounded-xl border border-surface-200 overflow-hidden hover:shadow-elevated transition-all group">
                  <div className={`h-36 relative ${!thumb ? `bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}` : ""}`}>
                    {thumb && <img src={thumb} alt={p.name} className="w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => openEdit(p)} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-card cursor-pointer border-none"><Pencil size={12} className="text-primary-600" /></button>
                      <button onClick={() => handleDelete(p.id)} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-card cursor-pointer border-none"><Trash2 size={12} className="text-danger-500" /></button>
                    </div>
                    <span className={`absolute top-2 left-2 badge ${STATUS_BADGE[p.status] || "badge-gray"} text-[10px]`}>
                      {p.status === "active" ? t("products.status_active") : p.status === "out_stock" ? t("products.status_out_stock") : t("products.status_draft")}
                    </span>
                    <div className="absolute bottom-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      {p.status !== "active"
                        ? <button onClick={() => handlePublish(p.id)} className="px-2 py-1 text-[10px] font-bold bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer border-none">{t("common.publish")}</button>
                        : <button onClick={() => handleUnpublish(p.id)} className="px-2 py-1 text-[10px] font-bold bg-white text-surface-600 rounded-lg border border-surface-200 hover:bg-surface-100 cursor-pointer">{t("common.unpublish")}</button>
                      }
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-surface-400 mb-0.5">{p.category_name || "—"}</p>
                    <p className="text-sm font-semibold text-surface-800 line-clamp-2 leading-snug mb-2">{getLocName(p, locale)}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-surface-900">{p.currency || "AMD"} {p.price}</span>
                      {(p.images?.length > 0 || p.thumbnail_url) && (
                        <span className="text-[10px] text-surface-400 flex items-center gap-0.5"><ImageIcon size={10} />{p.images?.length || 1}</span>
                      )}
                    </div>
                    <p className={`text-xs font-medium mt-1.5 ${p.stock_qty === 0 ? "text-danger-500" : "text-surface-500"}`}>
                      {p.stock_qty === 0 ? t("common.out_of_stock") : p.stock_qty != null ? `${p.stock_qty} ${t("products.in_stock_suffix")}` : t("common.unlimited")}
                    </p>
                  </div>
                </div>
              );
            })}
            <button onClick={() => setMode("create")}
              className="border-2 border-dashed border-surface-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary-400 hover:bg-primary-50/30 transition-all cursor-pointer bg-transparent h-[220px]">
              <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center"><Plus size={20} className="text-surface-400" /></div>
              <p className="text-sm font-medium text-surface-400">{t("products.add_product")}</p>
            </button>
          </div>
        ) : (
          <DataTable columns={listColumns} data={filtered} searchKeys={["name", "category_name"]} />
        )}
      </div>
    </div>
  );
}
