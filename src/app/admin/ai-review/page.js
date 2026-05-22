"use client";
import { useState, useEffect } from "react";
import {
  Sparkles, CheckCircle, XCircle, ChevronRight, ChevronLeft,
  Search, Globe, Image, Tag, Users, Calendar, Loader2,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import { adminAIReviewAPI } from "@/lib/api";

const LOCALES = ["en", "hy", "ru"];
const LOCALE_LABELS = { en: "English", hy: "Հայերեն", ru: "Русский" };
const LOCALE_FLAGS  = { en: "🇬🇧", hy: "🇦🇲", ru: "🇷🇺" };

// ── Small helpers ────────────────────────────────────────────────────────────

function Badge({ children, color = "gray" }) {
  const cls = {
    gray:   "bg-surface-100 text-surface-600",
    violet: "bg-primary-50 text-primary-700",
    green:  "bg-success-50 text-success-600",
    red:    "bg-danger-50 text-danger-600",
    amber:  "bg-warning-50 text-warning-600",
  }[color] || "bg-surface-100 text-surface-600";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${cls}`}>
      {children}
    </span>
  );
}

function TranslationCard({ translation, imageAlt }) {
  if (!translation) return (
    <div className="flex items-center justify-center h-24 text-surface-400 text-sm italic rounded-xl border border-dashed border-surface-200">
      No AI translation
    </div>
  );
  return (
    <div className="space-y-2.5">
      <div>
        <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wide mb-1">Title</p>
        <p className="text-sm font-semibold text-surface-900 leading-snug">{translation.name || "—"}</p>
      </div>
      <div>
        <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wide mb-1">Description</p>
        <p className="text-sm text-surface-700 leading-relaxed line-clamp-5">{translation.description || "—"}</p>
      </div>
      {imageAlt && (
        <div>
          <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wide mb-1">Image Alt</p>
          <p className="text-xs text-surface-500 italic">{imageAlt}</p>
        </div>
      )}
    </div>
  );
}

// ── Detail panel ─────────────────────────────────────────────────────────────

function DetailPanel({ product, onApprove, onReject, onClose, approving, rejecting }) {
  const [activeLocale, setActiveLocale] = useState("en");
  if (!product) return null;

  const trMap = {};
  (product.translations || []).forEach(t => { trMap[t.locale] = t; });

  const imageAltByLocale = {
    en: product.image_alt_en,
    hy: product.image_alt_hy,
    ru: product.image_alt_ru,
  };

  const img = product.primary_image || product.thumbnail_url;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-500 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-surface-900 truncate">{product.name}</p>
            <p className="text-xs text-surface-400">{product.vendor_name} · {product.category_name}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onReject(product.id)}
              disabled={rejecting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold bg-danger-50 text-danger-600 hover:bg-danger-100 disabled:opacity-50 transition-colors border border-danger-100"
            >
              {rejecting ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
              Reject
            </button>
            <button
              onClick={() => onApprove(product.id)}
              disabled={approving}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold bg-success-600 text-white hover:bg-success-700 disabled:opacity-50 transition-colors"
            >
              {approving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              Approve
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Product image + meta */}
          <div className="flex gap-4 p-6 border-b border-surface-100">
            <div className="w-28 h-28 rounded-xl overflow-hidden bg-surface-100 flex-shrink-0">
              {img ? (
                <img src={img} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-surface-300">
                  <Image size={28} />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-xs text-surface-500 font-medium">
                {product.price.toLocaleString()} {product.currency}
              </p>
              {product.tags?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Tag size={10} /> Keywords ({product.tags.length})
                  </p>
                  <div className="flex flex-wrap gap-1 max-h-16 overflow-hidden">
                    {product.tags.slice(0, 18).map(t => (
                      <Badge key={t} color="gray">{t}</Badge>
                    ))}
                    {product.tags.length > 18 && <Badge color="gray">+{product.tags.length - 18}</Badge>}
                  </div>
                </div>
              )}
              {product.for_whom?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Users size={10} /> For Whom
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {product.for_whom.map(v => <Badge key={v} color="violet">{v.replace(/_/g," ")}</Badge>)}
                  </div>
                </div>
              )}
              {product.occasions?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Calendar size={10} /> Occasions
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {product.occasions.map(v => <Badge key={v} color="amber">{v.replace(/_/g," ")}</Badge>)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Locale tabs */}
          <div className="px-6 pt-5">
            <div className="flex gap-1 mb-4 bg-surface-50 rounded-xl p-1">
              {LOCALES.map(l => (
                <button
                  key={l}
                  onClick={() => setActiveLocale(l)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeLocale === l
                      ? "bg-white text-primary-700 shadow-sm"
                      : "text-surface-500 hover:text-surface-700"
                  }`}
                >
                  <span>{LOCALE_FLAGS[l]}</span>
                  {LOCALE_LABELS[l]}
                </button>
              ))}
            </div>

            <TranslationCard
              translation={trMap[activeLocale]}
              imageAlt={imageAltByLocale[activeLocale]}
            />
          </div>

          {/* Side-by-side comparison for all 3 at once */}
          <div className="px-6 py-5 mt-2 border-t border-surface-100">
            <p className="text-xs font-bold text-surface-500 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Globe size={12} /> All Titles at a Glance
            </p>
            <div className="space-y-2">
              {LOCALES.map(l => {
                const tr = trMap[l];
                return (
                  <div key={l} className="flex items-start gap-3 p-3 rounded-xl bg-surface-50">
                    <span className="text-base mt-0.5">{LOCALE_FLAGS[l]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-surface-900 truncate">{tr?.name || <em className="text-surface-400 font-normal">missing</em>}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Product card ─────────────────────────────────────────────────────────────

function ProductCard({ product, onSelect }) {
  const trMap = {};
  (product.translations || []).forEach(t => { trMap[t.locale] = t; });
  const img = product.primary_image || product.thumbnail_url;
  const localesDone = LOCALES.filter(l => trMap[l]?.name).length;

  return (
    <button
      onClick={() => onSelect(product)}
      className="w-full text-left bg-white rounded-xl border border-surface-200 hover:border-primary-300 hover:shadow-md transition-all group p-4 flex gap-4"
    >
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-100 flex-shrink-0">
        {img ? (
          <img src={img} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-surface-300 text-xs">
            No img
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-surface-900 truncate">{product.name}</p>
        <p className="text-xs text-surface-400 mb-2">{product.vendor_name} · {product.category_name}</p>
        <div className="flex flex-wrap gap-1">
          {LOCALES.map(l => (
            <Badge key={l} color={trMap[l]?.name ? "green" : "gray"}>
              {LOCALE_FLAGS[l]} {trMap[l]?.name ? "✓" : "–"}
            </Badge>
          ))}
          {product.for_whom?.length > 0 && <Badge color="violet">{product.for_whom.length} recipients</Badge>}
          {product.occasions?.length > 0 && <Badge color="amber">{product.occasions.length} occasions</Badge>}
          {product.tags?.length > 0 && <Badge color="gray">{product.tags.length} keywords</Badge>}
        </div>
      </div>

      <div className="flex items-center text-surface-300 group-hover:text-primary-500 transition-colors flex-shrink-0">
        <ChevronLeft size={18} />
      </div>
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AIReviewPage() {
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState(null);
  const [search, setSearch]           = useState("");
  const [approving, setApproving]     = useState(false);
  const [rejecting, setRejecting]     = useState(false);
  const [doneIDs, setDoneIDs]         = useState(new Set());

  useEffect(() => {
    adminAIReviewAPI.list()
      .then(res => setProducts(res?.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const visible = products.filter(p => {
    if (doneIDs.has(p.id)) return false;
    if (!search) return true;
    const hay = [p.name, p.vendor_name, p.category_name].join(" ").toLowerCase();
    return hay.includes(search.toLowerCase());
  });

  const handleApprove = async (id) => {
    setApproving(true);
    try {
      await adminAIReviewAPI.approve(id);
      setDoneIDs(prev => new Set([...prev, id]));
      setSelected(null);
    } catch (e) {
      alert("Approve failed: " + (e?.message || "Unknown error"));
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (id) => {
    if (!confirm("Reject this AI content? Translations will be deleted.")) return;
    setRejecting(true);
    try {
      await adminAIReviewAPI.reject(id);
      setDoneIDs(prev => new Set([...prev, id]));
      setSelected(null);
    } catch (e) {
      alert("Reject failed: " + (e?.message || "Unknown error"));
    } finally {
      setRejecting(false);
    }
  };

  const pending = visible.length;
  const done    = doneIDs.size;

  return (
    <div className="flex flex-col h-screen">
      <TopBar
        title="AI Content Review"
        subtitle={
          loading
            ? "Loading…"
            : `${pending} pending · ${done} reviewed this session`
        }
        icon={<Sparkles size={18} className="text-primary-600" />}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Progress bar */}
        {!loading && products.length > 0 && (
          <div className="bg-white rounded-xl border border-surface-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-surface-600">Review progress</p>
              <p className="text-xs text-surface-400">{done} / {products.length} done</p>
            </div>
            <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-500"
                style={{ width: products.length ? `${(done / products.length) * 100}%` : "0%" }}
              />
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:border-primary-400 bg-white"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-surface-400">
            <Loader2 size={28} className="animate-spin text-primary-400" />
            <p className="text-sm">Loading AI-enriched products…</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-surface-400">
            <CheckCircle size={36} className="text-success-400" />
            <p className="text-sm font-medium">
              {doneIDs.size > 0 ? "All done! Great work." : "No products pending AI review."}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {visible.map(p => (
              <ProductCard key={p.id} product={p} onSelect={setSelected} />
            ))}
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <DetailPanel
          product={selected}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setSelected(null)}
          approving={approving}
          rejecting={rejecting}
        />
      )}
    </div>
  );
}
