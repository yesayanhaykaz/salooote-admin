"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Save, X, ImageIcon, Check, Bell, CreditCard, Store, User, Images, Upload, Trash2, Tag } from "lucide-react";
import TopBar from "@/components/TopBar";
import RichTextEditor from "@/components/RichTextEditor";
import CategoryPicker from "@/components/CategoryPicker";
import { vendorAPI, uploadAPI } from "@/lib/api";

const TABS = [
  { id: "Profile",       icon: User },
  { id: "Categories",   icon: Tag },
  { id: "Store",         icon: Store },
  { id: "Gallery",       icon: Images },
  { id: "Notifications", icon: Bell },
  { id: "Payout",        icon: CreditCard },
];

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const DEFAULT_HOURS = Object.fromEntries(
  DAYS.map(d => [d, { open: "09:00", close: "18:00", enabled: true }])
);
const DEFAULT_DELIVERY = { pickup: true, delivery: true, express: false };
const DEFAULT_NOTIFS = {
  newOrder: true, orderUpdate: true, newMessage: true,
  review: true, promo: false, report: true,
};
const DEFAULT_PAYOUT = { holder: "", bank: "", account: "", swift: "", iban: "", schedule: "weekly" };

// ─── Helpers ────────────────────────────────────────────────────────────────

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

function SaveBtn({ onClick, saving, saved }) {
  return (
    <button onClick={onClick} disabled={saving || saved}
      className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer border-none disabled:opacity-60 ${
        saved ? "bg-success-500 text-white" : "bg-primary-600 text-white hover:bg-primary-700"
      }`}>
      {saved ? <><Check size={14} /> Saved!</> : saving ? "Saving…" : <><Save size={14} /> Save Changes</>}
    </button>
  );
}

function useSave(fn) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const handle = async () => {
    setSaving(true);
    try {
      await fn();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error(e);
      alert("Save failed: " + (e?.message || "Unknown error"));
    }
    setSaving(false);
  };
  return { saving, saved, handle };
}

function ImageBox({ label, hint, aspectClass, shape = "square", image, onImage }) {
  const ref = useRef();
  const [drag, setDrag] = useState(false);
  const pick = file => {
    if (!file || !file.type.startsWith("image/")) return;
    onImage(file, URL.createObjectURL(file));
  };
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-surface-700 mb-1.5">{label}</label>}
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
          <p className="text-xs text-surface-400 text-center px-2">Click or drag to upload</p>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => pick(e.target.files[0])} />
    </div>
  );
}

// ─── Profile Tab ─────────────────────────────────────────────────────────────

function ProfileTab({ profile, loading }) {
  const [form, setForm] = useState({
    business_name: "", phone: "", website: "", address: "",
    city: "", facebook_url: "", instagram_url: "", description: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  useEffect(() => {
    if (!profile) return;
    setForm({
      business_name: profile.business_name || "",
      phone: profile.phone || "",
      website: profile.website || "",
      address: profile.address || "",
      city: profile.city || "",
      facebook_url: profile.facebook_url || "",
      instagram_url: profile.instagram_url || "",
      description: profile.description || "",
    });
    if (profile.logo_url) setLogoPreview(profile.logo_url);
    if (profile.banner_url) setBannerPreview(profile.banner_url);
  }, [profile]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const { saving, saved, handle } = useSave(async () => {
    const update = { ...form };
    if (logoFile) {
      const res = await uploadAPI.image(logoFile, "vendor");
      if (res?.data?.url) { update.logo_url = res.data.url; setLogoPreview(res.data.url); setLogoFile(null); }
    } else if (logoPreview && profile?.logo_url !== logoPreview) {
      update.logo_url = logoPreview;
    } else if (!logoPreview) {
      update.logo_url = "";
    }
    if (bannerFile) {
      const res = await uploadAPI.image(bannerFile, "vendor");
      if (res?.data?.url) { update.banner_url = res.data.url; setBannerPreview(res.data.url); setBannerFile(null); }
    } else if (bannerPreview && profile?.banner_url !== bannerPreview) {
      update.banner_url = bannerPreview;
    } else if (!bannerPreview) {
      update.banner_url = "";
    }
    await vendorAPI.updateProfile(update);
  });

  if (loading) return <div className="py-12 text-center text-sm text-surface-400">Loading…</div>;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <h3 className="text-sm font-semibold text-surface-900 mb-1">Cover / Banner</h3>
        <p className="text-[11px] text-surface-400 mb-4">Recommended: 1200×400px</p>
        <ImageBox aspectClass="w-full h-36" shape="square" image={bannerPreview}
          onImage={(f, p) => { setBannerFile(f); setBannerPreview(p); }} />
      </div>

      {/* Logo */}
      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <h3 className="text-sm font-semibold text-surface-900 mb-4">Business Logo</h3>
        <p className="text-[11px] text-surface-400 mb-3">Square image, min 200×200px</p>
        <ImageBox aspectClass="w-28 h-28" shape="square" image={logoPreview}
          onImage={(f, p) => { setLogoFile(f); setLogoPreview(p); }} />
      </div>

      {/* Info */}
      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <h3 className="text-sm font-semibold text-surface-900 mb-5">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Business Name *" value={form.business_name} onChange={v => set("business_name", v)} />
          <Field label="Contact Email" value={profile?.email || ""} disabled placeholder="(from account)" />
          <Field label="Phone Number" type="tel" value={form.phone} onChange={v => set("phone", v)} placeholder="+374 XX XXX XXX" />
          <Field label="Website" value={form.website} onChange={v => set("website", v)} placeholder="https://..." />
          <Field label="City" value={form.city} onChange={v => set("city", v)} placeholder="Yerevan" />
          <Field label="Address" value={form.address} onChange={v => set("address", v)} placeholder="Street, building" />
          <Field label="Facebook URL" value={form.facebook_url} onChange={v => set("facebook_url", v)} placeholder="https://facebook.com/..." />
          <Field label="Instagram URL" value={form.instagram_url} onChange={v => set("instagram_url", v)} placeholder="https://instagram.com/..." />
        </div>
        <div className="mt-4">
          <label className="block text-xs font-semibold text-surface-700 mb-1.5">Business Description / Bio</label>
          <RichTextEditor
            value={form.description}
            onChange={v => set("description", v)}
            placeholder="Tell customers about your business, what makes you special…"
            minHeight={140}
          />
        </div>
        <div className="flex justify-end mt-5">
          <SaveBtn onClick={handle} saving={saving} saved={saved} />
        </div>
      </div>
    </div>
  );
}

// ─── Store Tab ────────────────────────────────────────────────────────────────

function StoreTab({ profile }) {
  const [delivery, setDelivery] = useState(DEFAULT_DELIVERY);
  const [hours, setHours] = useState(DEFAULT_HOURS);

  useEffect(() => {
    if (!profile) return;
    if (profile.delivery_options && typeof profile.delivery_options === "object") {
      setDelivery({ ...DEFAULT_DELIVERY, ...profile.delivery_options });
    }
    if (profile.working_hours && typeof profile.working_hours === "object") {
      // merge with defaults so all days are present
      const merged = { ...DEFAULT_HOURS };
      for (const [day, val] of Object.entries(profile.working_hours)) {
        if (merged[day] && typeof val === "object") {
          merged[day] = { ...merged[day], ...val };
        }
      }
      setHours(merged);
    }
  }, [profile]);

  const { saving, saved, handle } = useSave(async () => {
    await vendorAPI.updateProfile({
      working_hours: hours,
      delivery_options: delivery,
    });
  });

  return (
    <div className="space-y-6">
      {/* Delivery */}
      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <h3 className="text-sm font-semibold text-surface-900 mb-4">Delivery Options</h3>
        <div className="space-y-4">
          {[
            { key: "pickup",   label: "In-store Pickup",   desc: "Customers collect at your location" },
            { key: "delivery", label: "Standard Delivery",  desc: "2–3 business days" },
            { key: "express",  label: "Express Delivery",   desc: "Same day (additional fee applies)" },
          ].map(opt => (
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

      {/* Working hours */}
      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <h3 className="text-sm font-semibold text-surface-900 mb-4">Working Hours</h3>
        <div className="space-y-3">
          {DAYS.map(day => (
            <div key={day} className="flex items-center gap-3">
              <Toggle
                on={hours[day]?.enabled}
                onToggle={() => setHours(h => ({ ...h, [day]: { ...h[day], enabled: !h[day].enabled } }))}
              />
              <span className={`text-sm w-24 font-medium ${hours[day]?.enabled ? "text-surface-800" : "text-surface-400"}`}>{day}</span>
              <input type="time" value={hours[day]?.open || "09:00"}
                disabled={!hours[day]?.enabled}
                onChange={e => setHours(h => ({ ...h, [day]: { ...h[day], open: e.target.value } }))}
                className="px-3 py-1.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 disabled:opacity-40 disabled:bg-surface-50" />
              <span className="text-surface-400 text-xs">–</span>
              <input type="time" value={hours[day]?.close || "18:00"}
                disabled={!hours[day]?.enabled}
                onChange={e => setHours(h => ({ ...h, [day]: { ...h[day], close: e.target.value } }))}
                className="px-3 py-1.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 disabled:opacity-40 disabled:bg-surface-50" />
              {!hours[day]?.enabled && <span className="text-xs text-surface-400 italic">Closed</span>}
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-5">
          <SaveBtn onClick={handle} saving={saving} saved={saved} />
        </div>
      </div>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

const NOTIF_ITEMS = [
  { key: "newOrder",    label: "New Orders",          desc: "When a customer places a new order" },
  { key: "orderUpdate", label: "Order Updates",        desc: "Status changes and cancellations" },
  { key: "newMessage",  label: "New Messages",         desc: "Customer messages and inquiries" },
  { key: "review",      label: "New Reviews",          desc: "Customer reviews and ratings" },
  { key: "promo",       label: "Promotions & Offers",  desc: "Platform promotions and discounts" },
  { key: "report",      label: "Weekly Reports",       desc: "Sales and performance summaries" },
];

function NotificationsTab({ profile }) {
  const [notifs, setNotifs] = useState(DEFAULT_NOTIFS);

  useEffect(() => {
    if (profile?.notification_prefs && typeof profile.notification_prefs === "object") {
      setNotifs({ ...DEFAULT_NOTIFS, ...profile.notification_prefs });
    }
  }, [profile]);

  const { saving, saved, handle } = useSave(async () => {
    await vendorAPI.updateProfile({ notification_prefs: notifs });
  });

  return (
    <div className="bg-white rounded-xl border border-surface-200 p-6">
      <h3 className="text-sm font-semibold text-surface-900 mb-5">Notification Preferences</h3>
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
        <SaveBtn onClick={handle} saving={saving} saved={saved} />
      </div>
    </div>
  );
}

// ─── Payout Tab ───────────────────────────────────────────────────────────────

function PayoutTab({ profile }) {
  const [form, setForm] = useState(DEFAULT_PAYOUT);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (profile?.payout_info && typeof profile.payout_info === "object") {
      setForm({ ...DEFAULT_PAYOUT, ...profile.payout_info });
    }
  }, [profile]);

  const { saving, saved, handle } = useSave(async () => {
    await vendorAPI.updateProfile({ payout_info: form });
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <h3 className="text-sm font-semibold text-surface-900 mb-5">Bank Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Account Holder Name" value={form.holder} onChange={v => set("holder", v)} placeholder="Full legal name" />
          <Field label="Bank Name" value={form.bank} onChange={v => set("bank", v)} placeholder="e.g. ACBA Bank" />
          <Field label="Account Number" value={form.account} onChange={v => set("account", v)} placeholder="Account number" />
          <Field label="SWIFT / BIC Code" value={form.swift} onChange={v => set("swift", v)} placeholder="e.g. ARMBAM22" />
        </div>
        <div className="mt-4">
          <Field label="IBAN" value={form.iban} onChange={v => set("iban", v)} placeholder="AM XX XXXX XXXX XXXX XXXX XXXX" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <h3 className="text-sm font-semibold text-surface-900 mb-4">Payout Schedule</h3>
        <div className="space-y-2">
          {[
            { key: "weekly",   label: "Weekly", desc: "Every Monday" },
            { key: "biweekly", label: "Bi-weekly", desc: "Every other Monday" },
            { key: "monthly",  label: "Monthly", desc: "1st of each month" },
          ].map(opt => (
            <label key={opt.key}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors ${form.schedule === opt.key ? "border-primary-500 bg-primary-50" : "border-surface-100 hover:border-surface-200"}`}>
              <input type="radio" name="payout_schedule" checked={form.schedule === opt.key}
                onChange={() => set("schedule", opt.key)} className="accent-primary-600" />
              <div>
                <p className="text-sm font-semibold text-surface-800">{opt.label}</p>
                <p className="text-xs text-surface-400">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
        <div className="flex justify-end mt-5">
          <SaveBtn onClick={handle} saving={saving} saved={saved} />
        </div>
      </div>
    </div>
  );
}

// ─── Gallery Tab ─────────────────────────────────────────────────────────────

function GalleryTab() {
  const [images, setImages]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting]   = useState(null);
  const [drag, setDrag]           = useState(false);
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
    const arr = Array.from(files);
    const results = [];
    for (const file of arr) {
      try {
        const res = await uploadAPI.galleryImage(file);
        if (res?.data) results.push(res.data);
      } catch (e) { console.error("Gallery upload failed:", e); }
    }
    if (fileRef.current) fileRef.current.value = "";
    setImages(prev => [...prev, ...results]);
    setUploading(false);
  }, []);

  const handleDelete = async (img) => {
    setDeleting(img.id);
    try {
      await uploadAPI.deleteGalleryImage(img.id);
      setImages(prev => prev.filter(i => i.id !== img.id));
    } catch (e) { console.error(e); }
    finally { setDeleting(null); }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  if (loading) return <div className="py-12 text-center text-sm text-surface-400">Loading gallery…</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-surface-900">Business Gallery</h3>
          <span className="text-xs text-surface-400">{images.length} photo{images.length !== 1 ? "s" : ""}</span>
        </div>
        <p className="text-[11px] text-surface-400 mb-5">Showcase your work — customers see these on your profile page.</p>

        {/* Drop zone */}
        <div
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onClick={() => !uploading && fileRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer mb-5 ${
            drag ? "border-primary-500 bg-primary-50/60" : "border-surface-200 bg-surface-50 hover:border-primary-300 hover:bg-primary-50/20"
          }`}
        >
          <div className="flex items-center justify-center gap-3 py-6 px-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${drag ? "bg-primary-100" : "bg-surface-100"}`}>
              <Upload size={18} className={drag ? "text-primary-600" : "text-surface-400"} />
            </div>
            <div>
              <p className={`text-sm font-semibold ${drag ? "text-primary-700" : "text-surface-600"}`}>
                {uploading ? "Uploading…" : drag ? "Drop photos here" : "Click or drag to upload photos"}
              </p>
              <p className="text-xs text-surface-400 mt-0.5">PNG, JPG — select multiple at once</p>
            </div>
          </div>
          {uploading && (
            <div className="absolute inset-0 rounded-xl bg-white/70 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium text-primary-600">Uploading…</span>
              </div>
            </div>
          )}
        </div>

        {/* Gallery grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map(img => (
              <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-surface-200 group">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />
                <button
                  onClick={() => handleDelete(img)}
                  disabled={deleting === img.id}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer border-none shadow disabled:opacity-40"
                >
                  {deleting === img.id
                    ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Trash2 size={12} />
                  }
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center">
              <ImageIcon size={22} className="text-surface-300" />
            </div>
            <p className="text-sm font-medium text-surface-500">No gallery photos yet</p>
            <p className="text-xs text-surface-400">Upload photos to showcase your work to customers</p>
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => handleFiles(e.target.files)} />
      </div>
    </div>
  );
}

// ─── Categories Tab ───────────────────────────────────────────────────────────

function CategoriesTab() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    vendorAPI.getCategories()
      .then(res => {
        const cats = res?.data || [];
        setSelectedIds(cats.map(c => c.id));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const { saving, saved, handle } = useSave(async () => {
    await vendorAPI.setCategories(selectedIds);
  });

  if (loading) return <div className="py-12 text-center text-sm text-surface-400">Loading…</div>;

  return (
    <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-surface-900 mb-1">Business Categories</h3>
        <p className="text-xs text-surface-400">
          Select all categories that describe your business. Customers use these to find you.
          You can select multiple — for example, a bakery might pick <em>Cakes</em>, <em>Desserts</em>, and <em>Catering</em>.
        </p>
      </div>

      <CategoryPicker selected={selectedIds} onChange={setSelectedIds} />

      <div className="flex justify-end pt-2">
        <SaveBtn onClick={handle} saving={saving} saved={saved} />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VendorSettings() {
  const [activeTab, setActiveTab] = useState("Profile");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorAPI.getProfile()
      .then(res => setProfile(res?.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title="Settings" subtitle="Manage your vendor account" />
      <main className="flex-1 p-6 max-w-4xl">
        {/* Tab bar */}
        <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-xl p-1 w-fit mb-6">
          {TABS.map(({ id, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none ${activeTab === id ? "bg-primary-600 text-white" : "text-surface-600 hover:bg-surface-50"}`}>
              <Icon size={14} />
              {id}
            </button>
          ))}
        </div>

        {activeTab === "Profile"       && <ProfileTab profile={profile} loading={loading} />}
        {activeTab === "Categories"    && <CategoriesTab />}
        {activeTab === "Store"         && <StoreTab profile={profile} />}
        {activeTab === "Gallery"       && <GalleryTab />}
        {activeTab === "Notifications" && <NotificationsTab profile={profile} />}
        {activeTab === "Payout"        && <PayoutTab profile={profile} />}
      </main>
    </div>
  );
}
