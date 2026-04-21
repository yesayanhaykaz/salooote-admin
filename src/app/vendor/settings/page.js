"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Save, X, ImageIcon, Check, Bell, CreditCard, Store, User, Images,
  Upload, Trash2, Tag, Zap, Crown, Star, AlertCircle,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import RichTextEditor from "@/components/RichTextEditor";
import CategoryPicker from "@/components/CategoryPicker";
import { vendorAPI, uploadAPI } from "@/lib/api";
import { useLocale } from "@/lib/i18n";

// ─── Static config ────────────────────────────────────────────────────────────

const TABS_CONFIG = [
  { id: "profile",      icon: User },
  { id: "categories",   icon: Tag },
  { id: "store",        icon: Store },
  { id: "gallery",      icon: Images },
  { id: "subscription", icon: Zap },
  { id: "notifications",icon: Bell },
  { id: "payout",       icon: CreditCard },
];

// DAYS keys match backend-stored keys (English) — displayed via t()
const DAYS     = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const DAY_KEYS = {
  Monday: "monday", Tuesday: "tuesday", Wednesday: "wednesday",
  Thursday: "thursday", Friday: "friday", Saturday: "saturday", Sunday: "sunday",
};

const DEFAULT_HOURS    = Object.fromEntries(DAYS.map(d => [d, { open: "09:00", close: "18:00", enabled: true }]));
const DEFAULT_DELIVERY = { pickup: true, delivery: true, express: false };
const DEFAULT_NOTIFS   = { newOrder: true, orderUpdate: true, newMessage: true, review: true, promo: false, report: true };
const DEFAULT_PAYOUT   = { holder: "", bank: "", account: "", swift: "", iban: "", schedule: "weekly" };

// Subscription plan styles
const PLAN_ICONS  = { basic: Star, pro: Zap, premium: Crown };
const PLAN_STYLES = {
  basic:   { icon: "bg-surface-100", color: "text-surface-500", border: "border-surface-200", btn: "bg-white text-surface-700 border border-surface-200 hover:bg-surface-50" },
  pro:     { icon: "bg-primary-50",  color: "text-primary-600", border: "border-primary-500",  btn: "bg-primary-600 text-white hover:bg-primary-700", badge: "most_popular" },
  premium: { icon: "bg-amber-50",    color: "text-amber-500",   border: "border-amber-400",    btn: "bg-amber-400 text-white hover:bg-amber-500",     badge: "best_value" },
};
const STATUS_BADGE = { completed: "badge-success", paid: "badge-success", pending: "badge-warning", failed: "badge-danger", refunded: "badge-gray" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtAMD(n) { return Number(n || 0).toLocaleString() + " AMD"; }
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function Field({ label, type = "text", value, onChange, placeholder = "", disabled = false }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-surface-700 mb-1.5">{label}</label>
      <input type={type} value={value || ""} onChange={e => onChange && onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg bg-white text-surface-800 placeholder:text-surface-400 focus:border-primary-600 transition-colors outline-none disabled:bg-surface-50 disabled:text-surface-400"
      />
    </div>
  );
}

function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle} style={{ width: 40, height: 22 }}
      className={`relative rounded-full cursor-pointer border-none flex-shrink-0 transition-colors ${on ? "bg-primary-600" : "bg-surface-200"}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function SaveBtn({ onClick, saving, saved, t }) {
  return (
    <button onClick={onClick} disabled={saving || saved}
      className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer border-none disabled:opacity-60 ${
        saved ? "bg-success-500 text-white" : "bg-primary-600 text-white hover:bg-primary-700"
      }`}>
      {saved ? <><Check size={14} /> {t("common.saved")}</> : saving ? t("common.saving") : <><Save size={14} /> {t("common.save_changes")}</>}
    </button>
  );
}

function useSave(fn) {
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const handle = async () => {
    setSaving(true);
    try {
      await fn();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      alert("Save failed: " + (e?.message || "Unknown error"));
    }
    setSaving(false);
  };
  return { saving, saved, handle };
}

function ImageBox({ uploadLabel, hint, aspectClass, shape = "square", image, onImage, t }) {
  const ref = useRef();
  const [drag, setDrag] = useState(false);
  const pick = file => {
    if (!file || !file.type.startsWith("image/")) return;
    onImage(file, URL.createObjectURL(file));
  };
  return (
    <div>
      {uploadLabel && <label className="block text-xs font-semibold text-surface-700 mb-1.5">{uploadLabel}</label>}
      {hint && <p className="text-[11px] text-surface-400 mb-2">{hint}</p>}
      {image ? (
        <div className={`relative overflow-hidden border-2 border-surface-200 ${aspectClass} ${shape === "circle" ? "rounded-full" : "rounded-xl"}`}>
          <img src={image} alt="" className="w-full h-full object-cover" />
          <button onClick={() => onImage(null, null)}
            className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 cursor-pointer border-0">
            <X size={11} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => ref.current?.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
          className={`${aspectClass} border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${shape === "circle" ? "rounded-full" : "rounded-xl"} ${drag ? "border-primary-400 bg-primary-50" : "border-surface-200 bg-surface-50 hover:border-primary-300 hover:bg-primary-50/30"}`}>
          <ImageIcon size={20} className="text-surface-300" />
          <p className="text-xs text-surface-400 text-center px-2">{t("settings.upload_area")}</p>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => pick(e.target.files[0])} />
    </div>
  );
}

// ─── Payment Method Modal ─────────────────────────────────────────────────────

function PaymentMethodModal({ initial, onClose, onSave }) {
  const { t } = useLocale();
  const [form, setForm] = useState({ card_holder: "", card_number: "", expiry: "", cvv: "", ...initial });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const formatCardNumber = v => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry     = v => { const d = v.replace(/\D/g, "").slice(0, 4); return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d; };
  const detectBrand      = num => {
    const n = num.replace(/\s/g, "");
    if (/^4/.test(n)) return "Visa";
    if (/^5[1-5]/.test(n)) return "Mastercard";
    if (/^3[47]/.test(n)) return "Amex";
    return "Card";
  };

  const handleSave = async () => {
    if (!form.card_number || !form.expiry || !form.card_holder) return;
    setSaving(true);
    try {
      await onSave({ card_holder: form.card_holder, last4: form.card_number.replace(/\s/g, "").slice(-4), expiry: form.expiry, brand: detectBrand(form.card_number) });
      onClose();
    } catch {}
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-elevated">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h2 className="font-bold text-surface-900">{initial ? t("subscription.update_payment") : t("subscription.add_payment")}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-100 cursor-pointer border-none bg-transparent"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">{t("subscription.cardholder_name")}</label>
            <input value={form.card_holder} onChange={e => set("card_holder", e.target.value)}
              placeholder={t("subscription.cardholder_placeholder")}
              className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">{t("subscription.card_number")}</label>
            <input value={form.card_number} onChange={e => set("card_number", formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456" maxLength={19}
              className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 font-mono" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">{t("subscription.expiry")}</label>
              <input value={form.expiry} onChange={e => set("expiry", formatExpiry(e.target.value))}
                placeholder="MM/YY" maxLength={5}
                className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 font-mono" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">CVV</label>
              <input value={form.cvv} onChange={e => set("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="•••" type="password" maxLength={4}
                className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600" />
            </div>
          </div>
          <p className="text-[11px] text-surface-400">{t("subscription.card_security_note")}</p>
        </div>
        <div className="px-6 py-4 border-t border-surface-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-surface-200 rounded-lg text-surface-600 hover:bg-surface-50 cursor-pointer bg-white">{t("common.cancel")}</button>
          <button onClick={handleSave} disabled={saving || !form.card_holder || !form.card_number || !form.expiry}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer border-none disabled:opacity-40">
            <Save size={14} /> {saving ? t("common.saving") : t("subscription.save_card")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab({ profile, loading: profileLoading }) {
  const { t } = useLocale();
  const [form, setForm] = useState({ business_name: "", phone: "", website: "", address: "", city: "", facebook_url: "", instagram_url: "", description: "" });
  const [logoFile,      setLogoFile]      = useState(null);
  const [logoPreview,   setLogoPreview]   = useState(null);
  const [bannerFile,    setBannerFile]    = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  useEffect(() => {
    if (!profile) return;
    setForm({ business_name: profile.business_name || "", phone: profile.phone || "", website: profile.website || "", address: profile.address || "", city: profile.city || "", facebook_url: profile.facebook_url || "", instagram_url: profile.instagram_url || "", description: profile.description || "" });
    if (profile.logo_url)   setLogoPreview(profile.logo_url);
    if (profile.banner_url) setBannerPreview(profile.banner_url);
  }, [profile]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const { saving, saved, handle } = useSave(async () => {
    const update = { ...form };
    if (logoFile) {
      const res = await uploadAPI.image(logoFile, "vendor");
      if (res?.data?.url) { update.logo_url = res.data.url; setLogoPreview(res.data.url); setLogoFile(null); }
    } else if (!logoPreview) { update.logo_url = ""; }
    if (bannerFile) {
      const res = await uploadAPI.image(bannerFile, "vendor");
      if (res?.data?.url) { update.banner_url = res.data.url; setBannerPreview(res.data.url); setBannerFile(null); }
    } else if (!bannerPreview) { update.banner_url = ""; }
    await vendorAPI.updateProfile(update);
  });

  if (profileLoading) return <div className="py-12 text-center text-sm text-surface-400">{t("common.loading")}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <h3 className="text-sm font-semibold text-surface-900 mb-1">{t("settings.cover_banner")}</h3>
        <p className="text-[11px] text-surface-400 mb-4">{t("settings.cover_banner_hint")}</p>
        <ImageBox t={t} aspectClass="w-full h-36" image={bannerPreview} onImage={(f, p) => { setBannerFile(f); setBannerPreview(p); }} />
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <h3 className="text-sm font-semibold text-surface-900 mb-4">{t("settings.business_logo")}</h3>
        <p className="text-[11px] text-surface-400 mb-3">{t("settings.business_logo_hint")}</p>
        <ImageBox t={t} aspectClass="w-28 h-28" image={logoPreview} onImage={(f, p) => { setLogoFile(f); setLogoPreview(p); }} />
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <h3 className="text-sm font-semibold text-surface-900 mb-5">{t("settings.business_information")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t("settings.business_name")} value={form.business_name} onChange={v => set("business_name", v)} />
          <Field label={t("settings.contact_email")} value={profile?.email || ""} disabled placeholder={t("settings.from_account")} />
          <Field label={t("settings.phone_number")} type="tel" value={form.phone} onChange={v => set("phone", v)} placeholder="+374 XX XXX XXX" />
          <Field label={t("settings.website")} value={form.website} onChange={v => set("website", v)} placeholder="https://..." />
          <Field label={t("settings.city")} value={form.city} onChange={v => set("city", v)} placeholder="Yerevan" />
          <Field label={t("settings.address")} value={form.address} onChange={v => set("address", v)} />
          <Field label={t("settings.facebook_url")} value={form.facebook_url} onChange={v => set("facebook_url", v)} placeholder="https://facebook.com/..." />
          <Field label={t("settings.instagram_url")} value={form.instagram_url} onChange={v => set("instagram_url", v)} placeholder="https://instagram.com/..." />
        </div>
        <div className="mt-4">
          <label className="block text-xs font-semibold text-surface-700 mb-1.5">{t("settings.business_description")}</label>
          <RichTextEditor value={form.description} onChange={v => set("description", v)} placeholder={t("settings.description_placeholder")} minHeight={140} />
        </div>
        <div className="flex justify-end mt-5">
          <SaveBtn onClick={handle} saving={saving} saved={saved} t={t} />
        </div>
      </div>
    </div>
  );
}

// ─── Store Tab ────────────────────────────────────────────────────────────────

function StoreTab({ profile }) {
  const { t } = useLocale();
  const [delivery, setDelivery] = useState(DEFAULT_DELIVERY);
  const [hours,    setHours]    = useState(DEFAULT_HOURS);

  useEffect(() => {
    if (!profile) return;
    if (profile.delivery_options) setDelivery({ ...DEFAULT_DELIVERY, ...profile.delivery_options });
    if (profile.working_hours) {
      const merged = { ...DEFAULT_HOURS };
      for (const [day, val] of Object.entries(profile.working_hours)) {
        if (merged[day] && typeof val === "object") merged[day] = { ...merged[day], ...val };
      }
      setHours(merged);
    }
  }, [profile]);

  const { saving, saved, handle } = useSave(async () => {
    await vendorAPI.updateProfile({ working_hours: hours, delivery_options: delivery });
  });

  const DELIVERY_OPTIONS = [
    { key: "pickup",   label: t("settings.in_store_pickup"),  desc: t("settings.pickup_desc") },
    { key: "delivery", label: t("settings.standard_delivery"), desc: t("settings.standard_delivery_desc") },
    { key: "express",  label: t("settings.express_delivery"),  desc: t("settings.express_delivery_desc") },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <h3 className="text-sm font-semibold text-surface-900 mb-4">{t("settings.delivery_options")}</h3>
        <div className="space-y-4">
          {DELIVERY_OPTIONS.map(opt => (
            <div key={opt.key} className="flex items-center justify-between py-2 border-b border-surface-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-surface-800">{opt.label}</p>
                <p className="text-xs text-surface-400 mt-0.5">{opt.desc}</p>
              </div>
              <Toggle on={delivery[opt.key]} onToggle={() => setDelivery(d => ({ ...d, [opt.key]: !d[opt.key] }))} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <h3 className="text-sm font-semibold text-surface-900 mb-4">{t("settings.working_hours")}</h3>
        <div className="space-y-3">
          {DAYS.map(day => (
            <div key={day} className="flex items-center gap-3">
              <Toggle on={hours[day]?.enabled} onToggle={() => setHours(h => ({ ...h, [day]: { ...h[day], enabled: !h[day].enabled } }))} />
              <span className={`text-sm w-28 font-medium ${hours[day]?.enabled ? "text-surface-800" : "text-surface-400"}`}>
                {t(`settings.days.${DAY_KEYS[day]}`)}
              </span>
              <input type="time" value={hours[day]?.open || "09:00"} disabled={!hours[day]?.enabled}
                onChange={e => setHours(h => ({ ...h, [day]: { ...h[day], open: e.target.value } }))}
                className="px-3 py-1.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 disabled:opacity-40 disabled:bg-surface-50" />
              <span className="text-surface-400 text-xs">–</span>
              <input type="time" value={hours[day]?.close || "18:00"} disabled={!hours[day]?.enabled}
                onChange={e => setHours(h => ({ ...h, [day]: { ...h[day], close: e.target.value } }))}
                className="px-3 py-1.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 disabled:opacity-40 disabled:bg-surface-50" />
              {!hours[day]?.enabled && <span className="text-xs text-surface-400 italic">{t("settings.closed")}</span>}
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-5">
          <SaveBtn onClick={handle} saving={saving} saved={saved} t={t} />
        </div>
      </div>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

function NotificationsTab({ profile }) {
  const { t } = useLocale();
  const [notifs, setNotifs] = useState(DEFAULT_NOTIFS);

  useEffect(() => {
    if (profile?.notification_prefs) setNotifs({ ...DEFAULT_NOTIFS, ...profile.notification_prefs });
  }, [profile]);

  const { saving, saved, handle } = useSave(async () => {
    await vendorAPI.updateProfile({ notification_prefs: notifs });
  });

  const NOTIF_ITEMS = [
    { key: "newOrder",    label: t("settings.new_orders"),         desc: t("settings.new_orders_desc") },
    { key: "orderUpdate", label: t("settings.order_updates"),      desc: t("settings.order_updates_desc") },
    { key: "newMessage",  label: t("settings.new_messages"),       desc: t("settings.new_messages_desc") },
    { key: "review",      label: t("settings.new_reviews"),        desc: t("settings.new_reviews_desc") },
    { key: "promo",       label: t("settings.promotions_offers"),  desc: t("settings.promotions_offers_desc") },
    { key: "report",      label: t("settings.weekly_reports"),     desc: t("settings.weekly_reports_desc") },
  ];

  return (
    <div className="bg-white rounded-xl border border-surface-200 p-6">
      <h3 className="text-sm font-semibold text-surface-900 mb-5">{t("settings.notification_preferences")}</h3>
      <div className="space-y-1">
        {NOTIF_ITEMS.map(item => (
          <div key={item.key} className="flex items-center justify-between py-3 border-b border-surface-50 last:border-0">
            <div>
              <p className="text-sm font-medium text-surface-800">{item.label}</p>
              <p className="text-xs text-surface-400 mt-0.5">{item.desc}</p>
            </div>
            <Toggle on={notifs[item.key]} onToggle={() => setNotifs(n => ({ ...n, [item.key]: !n[item.key] }))} />
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-5">
        <SaveBtn onClick={handle} saving={saving} saved={saved} t={t} />
      </div>
    </div>
  );
}

// ─── Payout Tab ───────────────────────────────────────────────────────────────

function PayoutTab({ profile }) {
  const { t } = useLocale();
  const [form, setForm] = useState(DEFAULT_PAYOUT);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (profile?.payout_info) setForm({ ...DEFAULT_PAYOUT, ...profile.payout_info });
  }, [profile]);

  const { saving, saved, handle } = useSave(async () => {
    await vendorAPI.updateProfile({ payout_info: form });
  });

  const SCHEDULE_OPTIONS = [
    { key: "weekly",   label: t("settings.weekly"),    desc: t("settings.every_monday") },
    { key: "biweekly", label: t("settings.bi_weekly"), desc: t("settings.every_other_monday") },
    { key: "monthly",  label: t("settings.monthly"),   desc: t("settings.first_of_each_month") },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <h3 className="text-sm font-semibold text-surface-900 mb-5">{t("settings.bank_account_info")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t("settings.account_holder_name")} value={form.holder} onChange={v => set("holder", v)} placeholder={t("settings.full_legal_name")} />
          <Field label={t("settings.bank_name")} value={form.bank} onChange={v => set("bank", v)} placeholder="e.g. ACBA Bank" />
          <Field label={t("settings.account_number")} value={form.account} onChange={v => set("account", v)} />
          <Field label={t("settings.swift_bic")} value={form.swift} onChange={v => set("swift", v)} placeholder="e.g. ARMBAM22" />
        </div>
        <div className="mt-4">
          <Field label={t("settings.iban")} value={form.iban} onChange={v => set("iban", v)} placeholder="AM XX XXXX XXXX XXXX XXXX XXXX" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <h3 className="text-sm font-semibold text-surface-900 mb-4">{t("settings.payout_schedule")}</h3>
        <div className="space-y-2">
          {SCHEDULE_OPTIONS.map(opt => (
            <label key={opt.key}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors ${form.schedule === opt.key ? "border-primary-500 bg-primary-50" : "border-surface-100 hover:border-surface-200"}`}>
              <input type="radio" name="payout_schedule" checked={form.schedule === opt.key} onChange={() => set("schedule", opt.key)} className="accent-primary-600" />
              <div>
                <p className="text-sm font-semibold text-surface-800">{opt.label}</p>
                <p className="text-xs text-surface-400">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
        <div className="flex justify-end mt-5">
          <SaveBtn onClick={handle} saving={saving} saved={saved} t={t} />
        </div>
      </div>
    </div>
  );
}

// ─── Gallery Tab ──────────────────────────────────────────────────────────────

function GalleryTab() {
  const { t } = useLocale();
  const [images,    setImages]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting,  setDeleting]  = useState(null);
  const [drag,      setDrag]      = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    uploadAPI.getGallery()
      .then(res => setImages(res?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFiles = useCallback(async (files) => {
    if (!files?.length) return;
    setUploading(true);
    const results = [];
    for (const file of Array.from(files)) {
      try { const res = await uploadAPI.galleryImage(file); if (res?.data) results.push(res.data); } catch {}
    }
    if (fileRef.current) fileRef.current.value = "";
    setImages(prev => [...prev, ...results]);
    setUploading(false);
  }, []);

  const handleDelete = async (img) => {
    setDeleting(img.id);
    try { await uploadAPI.deleteGalleryImage(img.id); setImages(prev => prev.filter(i => i.id !== img.id)); } catch {}
    finally { setDeleting(null); }
  };

  const onDrop = useCallback((e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }, [handleFiles]);

  if (loading) return <div className="py-12 text-center text-sm text-surface-400">{t("settings.loading_gallery")}</div>;

  const photoCount = images.length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-surface-900">{t("settings.business_gallery")}</h3>
          <span className="text-xs text-surface-400">{photoCount} {photoCount === 1 ? t("settings.photo") : t("settings.photos")}</span>
        </div>
        <p className="text-[11px] text-surface-400 mb-5">{t("settings.gallery_text")}</p>

        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onClick={() => !uploading && fileRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer mb-5 ${drag ? "border-primary-500 bg-primary-50/60" : "border-surface-200 bg-surface-50 hover:border-primary-300 hover:bg-primary-50/20"}`}
        >
          <div className="flex items-center justify-center gap-3 py-6 px-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${drag ? "bg-primary-100" : "bg-surface-100"}`}>
              <Upload size={18} className={drag ? "text-primary-600" : "text-surface-400"} />
            </div>
            <div>
              <p className={`text-sm font-semibold ${drag ? "text-primary-700" : "text-surface-600"}`}>
                {uploading ? t("settings.uploading") : drag ? t("settings.drop_here") : t("settings.upload_area")}
              </p>
              <p className="text-xs text-surface-400 mt-0.5">{t("settings.upload_hint")}</p>
            </div>
          </div>
          {uploading && (
            <div className="absolute inset-0 rounded-xl bg-white/70 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium text-primary-600">{t("settings.uploading")}</span>
              </div>
            </div>
          )}
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map(img => (
              <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-surface-200 group">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
                <button onClick={() => handleDelete(img)} disabled={deleting === img.id}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer border-none shadow disabled:opacity-40">
                  {deleting === img.id
                    ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Trash2 size={12} />}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center">
              <ImageIcon size={22} className="text-surface-300" />
            </div>
            <p className="text-sm font-medium text-surface-500">{t("settings.no_gallery_photos")}</p>
            <p className="text-xs text-surface-400">{t("settings.gallery_empty_text")}</p>
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
      </div>
    </div>
  );
}

// ─── Categories Tab ───────────────────────────────────────────────────────────

function CategoriesTab() {
  const { t } = useLocale();
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    vendorAPI.getCategories()
      .then(res => setSelectedIds((res?.data || []).map(c => c.id)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const { saving, saved, handle } = useSave(async () => { await vendorAPI.setCategories(selectedIds); });

  if (loading) return <div className="py-12 text-center text-sm text-surface-400">{t("common.loading")}</div>;

  return (
    <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-surface-900 mb-1">{t("settings.business_categories")}</h3>
        <p className="text-xs text-surface-400">{t("settings.categories_text")}</p>
      </div>
      <CategoryPicker selected={selectedIds} onChange={setSelectedIds} />
      <div className="flex justify-end pt-2">
        <SaveBtn onClick={handle} saving={saving} saved={saved} t={t} />
      </div>
    </div>
  );
}

// ─── Subscription Tab ─────────────────────────────────────────────────────────

function SubscriptionTab() {
  const { t } = useLocale();
  const [current,      setCurrent]      = useState(null);
  const [plans,        setPlans]        = useState([]);
  const [history,      setHistory]      = useState([]);
  const [profile,      setProfile]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [histLoading,  setHistLoading]  = useState(true);
  const [billing,      setBilling]      = useState("monthly");
  const [changing,     setChanging]     = useState(null);
  const [cancelling,   setCancelling]   = useState(false);
  const [showCardModal,setShowCardModal]= useState(false);

  const paymentMethod  = profile?.payment_method || null;
  const currentPlanSlug = current?.plan?.slug || null;

  useEffect(() => {
    Promise.all([
      vendorAPI.subscription().catch(() => null),
      vendorAPI.subscriptionPlans().catch(() => null),
      vendorAPI.getProfile().catch(() => null),
    ]).then(([subRes, plansRes, profileRes]) => {
      setCurrent(subRes?.data || null);
      setPlans(plansRes?.data || []);
      setProfile(profileRes?.data || null);
    }).finally(() => setLoading(false));
    vendorAPI.billingHistory().catch(() => null).then(res => { setHistory(res?.data || []); setHistLoading(false); });
  }, []);

  const fmtPrice = price => billing === "yearly" ? Math.round(price * 0.8) : price;

  const handleChangePlan = async (slug) => {
    if (slug === currentPlanSlug) return;
    const plan  = plans.find(p => p.slug === slug);
    const label = plan?.price === 0 ? "downgrade to" : "upgrade to";
    if (!confirm(`Are you sure you want to ${label} the ${plan?.name} plan?`)) return;
    setChanging(slug);
    try { const res = await vendorAPI.changePlan(slug); if (res?.data) setCurrent(res.data); }
    catch (e) { alert("Failed to change plan: " + (e?.message || "Unknown error")); }
    setChanging(null);
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;
    setCancelling(true);
    try { await vendorAPI.cancelSubscription(); setCurrent(prev => prev ? { ...prev, status: "cancelled" } : prev); }
    catch (e) { alert("Failed to cancel: " + (e?.message || "Unknown error")); }
    setCancelling(false);
  };

  const handleSavePaymentMethod = async (masked) => {
    await vendorAPI.updateProfile({ payment_method: masked });
    setProfile(prev => ({ ...prev, payment_method: masked }));
  };

  return (
    <div className="space-y-6">

      {/* Current Plan Banner */}
      {!loading && current && (
        <div className={`rounded-xl p-5 flex items-center justify-between flex-wrap gap-4 ${current.status === "cancelled" ? "bg-surface-700" : "bg-primary-600"}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base">
                {current.plan?.name} {t("subscription.plan_col")}
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 bg-white/20 rounded-full capitalize">{current.status}</span>
              </p>
              <p className="text-white/70 text-xs mt-0.5">
                {fmtDate(current.starts_at)}
                {current.ends_at ? ` · ${fmtDate(current.ends_at)}` : ""}
              </p>
            </div>
          </div>
          {current.status === "active" && !current.plan?.is_free && (
            <button onClick={handleCancel} disabled={cancelling}
              className="px-4 py-2 bg-white/15 border border-white/25 text-white text-sm font-medium rounded-lg hover:bg-white/25 transition-colors cursor-pointer disabled:opacity-40">
              {cancelling ? t("subscription.cancelling") : t("subscription.cancel_plan")}
            </button>
          )}
        </div>
      )}

      {!loading && !current && (
        <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-warning-500 flex-shrink-0" />
          <p className="text-sm text-warning-700">{t("subscription.subtitle")}</p>
        </div>
      )}

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className={`text-sm font-medium ${billing === "monthly" ? "text-surface-900" : "text-surface-400"}`}>{t("subscription.monthly")}</span>
        <button onClick={() => setBilling(b => b === "monthly" ? "yearly" : "monthly")}
          className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer border-none ${billing === "yearly" ? "bg-primary-600" : "bg-surface-300"}`}>
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${billing === "yearly" ? "left-7" : "left-1"}`} />
        </button>
        <span className={`text-sm font-medium ${billing === "yearly" ? "text-surface-900" : "text-surface-400"}`}>
          {t("subscription.yearly_discount")}
        </span>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-surface-400">{t("subscription.loading")}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map(plan => {
            const slug       = plan.slug || plan.name?.toLowerCase();
            const style      = PLAN_STYLES[slug] || PLAN_STYLES.basic;
            const Icon       = PLAN_ICONS[slug] || Star;
            const isCurrent  = currentPlanSlug === slug;
            const price      = fmtPrice(plan.price);
            const isChanging = changing === slug;

            return (
              <div key={plan.id}
                className={`relative rounded-xl border-2 ${isCurrent ? "border-primary-500" : style.border} bg-white p-6 flex flex-col transition-all hover:shadow-elevated`}>

                {style.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold ${slug === "pro" ? "bg-primary-600 text-white" : "bg-amber-400 text-white"}`}>
                    {t(`subscription.${style.badge}`)}
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className={`w-9 h-9 rounded-lg ${style.icon} flex items-center justify-center mb-3`}>
                      <Icon size={18} className={style.color} />
                    </div>
                    <p className="font-bold text-surface-900 text-lg">{plan.name}</p>
                    {plan.description && <p className="text-xs text-surface-400 mt-0.5">{plan.description}</p>}
                  </div>
                  {isCurrent && <span className="badge badge-purple text-[10px]">{t("subscription.current")}</span>}
                </div>

                <div className="mb-5">
                  <span className="text-3xl font-bold text-surface-900">
                    {plan.price === 0 ? t("subscription.free") : fmtAMD(price)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-surface-400 text-sm ml-1">/ {billing === "yearly" ? "mo (billed yearly)" : t("subscription.monthly").toLowerCase()}</span>
                  )}
                </div>

                <div className="flex-1 space-y-2 mb-6">
                  {(plan.features || []).map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check size={14} className="text-success-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-surface-600">{f.value && f.value !== "true" ? `${f.feature}: ${f.value}` : f.feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => !isCurrent && handleChangePlan(slug)}
                  disabled={isCurrent || isChanging || !!changing}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer border-none transition-all disabled:opacity-50 ${isCurrent ? "bg-surface-100 text-surface-400 cursor-default" : style.btn}`}>
                  {isChanging ? t("subscription.applying") :
                   isCurrent  ? t("subscription.current_plan") :
                   plan.price === 0 ? t("subscription.downgrade_to_free") :
                   currentPlanSlug && plans.find(p => p.slug === currentPlanSlug)?.price > plan.price
                     ? t("subscription.downgrade") : t("subscription.upgrade")}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Method */}
      <div className="bg-white rounded-xl border border-surface-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-surface-900 text-sm">{t("subscription.payment_method")}</h3>
          <button onClick={() => setShowCardModal(true)} className="text-xs text-primary-600 font-semibold hover:text-primary-700 cursor-pointer bg-transparent border-none">
            {paymentMethod ? t("subscription.update_card") : t("subscription.add_card")}
          </button>
        </div>
        {paymentMethod ? (
          <div className="flex items-center gap-4 p-4 border border-surface-200 rounded-xl bg-surface-50">
            <div className="w-10 h-7 bg-surface-800 rounded flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[9px] font-bold">{paymentMethod.brand?.toUpperCase() || "CARD"}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-surface-800">•••• •••• •••• {paymentMethod.last4}</p>
              <p className="text-xs text-surface-400">{paymentMethod.card_holder} · {t("subscription.expiry")} {paymentMethod.expiry}</p>
            </div>
            <span className="badge badge-success text-[10px]">{t("common.default")}</span>
            <button onClick={() => setShowCardModal(true)} className="text-xs text-primary-600 hover:text-primary-700 cursor-pointer bg-transparent border-none font-medium">{t("common.edit")}</button>
          </div>
        ) : (
          <button onClick={() => setShowCardModal(true)}
            className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-surface-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/30 transition-all cursor-pointer bg-transparent">
            <CreditCard size={16} className="text-surface-400" />
            <span className="text-sm text-surface-400 font-medium">{t("subscription.add_card_hint")}</span>
          </button>
        )}
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-100">
          <h3 className="font-semibold text-surface-900 text-sm">{t("subscription.billing_history")}</h3>
        </div>
        {histLoading ? (
          <div className="px-5 py-8 text-center text-sm text-surface-400">{t("subscription.loading_history")}</div>
        ) : history.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-surface-400">{t("subscription.no_billing_records")}</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-100">
                {[t("subscription.date"), t("subscription.plan_col"), t("subscription.amount"), t("common.status")].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map(row => (
                <tr key={row.id} className="border-b border-surface-50 last:border-0">
                  <td className="px-5 py-3.5 text-sm text-surface-600">{fmtDate(row.created_at)}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-surface-800">{row.plan_name}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-surface-900">{fmtAMD(row.amount)}</td>
                  <td className="px-5 py-3.5"><span className={`badge ${STATUS_BADGE[row.status] || "badge-gray"}`}>{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCardModal && (
        <PaymentMethodModal initial={paymentMethod} onClose={() => setShowCardModal(false)} onSave={handleSavePaymentMethod} />
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VendorSettings() {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState("profile");
  const [profile,   setProfile]   = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    vendorAPI.getProfile()
      .then(res => setProfile(res?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title={t("settings.title")} subtitle={t("settings.subtitle")} />
      <main className="flex-1 p-6 max-w-4xl">
        {/* Tab bar */}
        <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-xl p-1 w-fit mb-6 flex-wrap">
          {TABS_CONFIG.map(({ id, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none ${activeTab === id ? "bg-primary-600 text-white" : "text-surface-600 hover:bg-surface-50"}`}>
              <Icon size={14} />
              {t(`settings.tabs.${id}`)}
            </button>
          ))}
        </div>

        {activeTab === "profile"       && <ProfileTab profile={profile} loading={loading} />}
        {activeTab === "categories"    && <CategoriesTab />}
        {activeTab === "store"         && <StoreTab profile={profile} />}
        {activeTab === "gallery"       && <GalleryTab />}
        {activeTab === "subscription"  && <SubscriptionTab />}
        {activeTab === "notifications" && <NotificationsTab profile={profile} />}
        {activeTab === "payout"        && <PayoutTab profile={profile} />}
      </main>
    </div>
  );
}
