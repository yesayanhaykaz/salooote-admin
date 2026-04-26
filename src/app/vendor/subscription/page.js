"use client";
import { useState, useEffect, useMemo } from "react";
import { Check, Zap, Crown, Star, AlertCircle, CreditCard, X, Save, RefreshCw, Clock, CalendarCheck } from "lucide-react";
import TopBar from "@/components/TopBar";
import { vendorAPI } from "@/lib/api";

// ─── Constants ───────────────────────────────────────────────────────────────

const PLAN_ICONS  = { basic: Star, pro: Zap, premium: Crown };
const PLAN_STYLES = {
  basic:   { icon: "bg-surface-100", color: "text-surface-500", border: "border-surface-200", btn: "bg-white text-surface-700 border border-surface-200 hover:bg-surface-50" },
  pro:     { icon: "bg-primary-50",  color: "text-primary-600", border: "border-primary-500",  btn: "bg-primary-600 text-white hover:bg-primary-700", badge: "Most Popular" },
  premium: { icon: "bg-amber-50",    color: "text-amber-500",   border: "border-amber-400",    btn: "bg-amber-400 text-white hover:bg-amber-500",     badge: "Best Value" },
};

const STATUS_BADGE = {
  completed: "badge-success",
  paid:      "badge-success",
  pending:   "badge-warning",
  failed:    "badge-danger",
  refunded:  "badge-gray",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtAMD(n) {
  return Number(n || 0).toLocaleString() + " AMD";
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function daysBetween(target) {
  if (!target) return null;
  const now = new Date();
  const t = new Date(target);
  const ms = t.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

// ─── Payment Method Modal ────────────────────────────────────────────────────

function PaymentMethodModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState({
    card_holder: "",
    card_number: "",
    expiry: "",
    cvv: "",
    ...initial,
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };
  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const handleSave = async () => {
    if (!form.card_number || !form.expiry || !form.card_holder) return;
    setSaving(true);
    try {
      // Store masked version — never store full CVV
      const masked = {
        card_holder: form.card_holder,
        last4: form.card_number.replace(/\s/g, "").slice(-4),
        expiry: form.expiry,
        brand: detectBrand(form.card_number),
      };
      await onSave(masked);
      onClose();
    } catch {}
    setSaving(false);
  };

  const detectBrand = (num) => {
    const n = num.replace(/\s/g, "");
    if (/^4/.test(n)) return "Visa";
    if (/^5[1-5]/.test(n)) return "Mastercard";
    if (/^3[47]/.test(n)) return "Amex";
    return "Card";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-elevated">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h2 className="font-bold text-surface-900">
            {initial ? "Update Payment Method" : "Add Payment Method"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-100 cursor-pointer border-none bg-transparent">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">Cardholder Name</label>
            <input value={form.card_holder} onChange={e => set("card_holder", e.target.value)}
              placeholder="Full name as on card"
              className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">Card Number</label>
            <input value={form.card_number} onChange={e => set("card_number", formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456" maxLength={19}
              className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 font-mono" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">Expiry</label>
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
          <p className="text-[11px] text-surface-400">Your card details are encrypted and stored securely. CVV is never saved.</p>
        </div>
        <div className="px-6 py-4 border-t border-surface-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-surface-200 rounded-lg text-surface-600 hover:bg-surface-50 cursor-pointer bg-white">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.card_holder || !form.card_number || !form.expiry}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer border-none disabled:opacity-40">
            <Save size={14} /> {saving ? "Saving…" : "Save Card"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VendorSubscription() {
  const [current, setCurrent]       = useState(null);
  const [plans, setPlans]           = useState([]);
  const [history, setHistory]       = useState([]);
  const [profile, setProfile]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [histLoading, setHistLoading] = useState(true);
  const [billing, setBilling]       = useState("monthly");
  const [changing, setChanging]     = useState(null); // slug being applied
  const [cancelling, setCancelling] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [renewing, setRenewing] = useState(false);

  const paymentMethod = profile?.payment_method || null;

  // Compute renewal info
  const renewalInfo = useMemo(() => {
    if (!current) return null;
    const remaining = daysBetween(current.ends_at);
    const currentPlan = current.plan || {};
    const isFree = currentPlan.is_free || currentPlan.price === 0;
    return {
      remaining,                                              // days remaining (negative if expired)
      isExpired: remaining != null && remaining < 0,
      isExpiringSoon: remaining != null && remaining >= 0 && remaining <= 7,
      renewalPrice: currentPlan.price || 0,
      isFree,
    };
  }, [current]);

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

    vendorAPI.billingHistory().catch(() => null).then(res => {
      setHistory(res?.data || []);
      setHistLoading(false);
    });
  }, []);

  const currentPlanSlug = current?.plan?.slug || null;

  const fmtPrice = (price) => billing === "yearly" ? Math.round(price * 0.8) : price;

  const handleChangePlan = async (slug) => {
    if (slug === currentPlanSlug) return;
    const plan = plans.find(p => p.slug === slug);
    const label = plan?.price === 0 ? "downgrade to" : "upgrade to";
    if (!confirm(`Are you sure you want to ${label} the ${plan?.name} plan?`)) return;
    setChanging(slug);
    try {
      const res = await vendorAPI.changePlan(slug);
      if (res?.data) setCurrent(res.data);
    } catch (e) {
      alert("Failed to change plan: " + (e?.message || "Unknown error"));
    }
    setChanging(null);
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You will lose access to paid features at the end of the period.")) return;
    setCancelling(true);
    try {
      await vendorAPI.cancelSubscription();
      setCurrent(prev => prev ? { ...prev, status: "cancelled" } : prev);
    } catch (e) {
      alert("Failed to cancel: " + (e?.message || "Unknown error"));
    }
    setCancelling(false);
  };

  const handleSavePaymentMethod = async (masked) => {
    await vendorAPI.updateProfile({ payment_method: masked });
    setProfile(prev => ({ ...prev, payment_method: masked }));
  };

  const handleRenew = async () => {
    if (!current?.plan?.slug) return;
    if (!paymentMethod && !renewalInfo?.isFree) {
      if (!confirm("You don't have a payment method on file. Add one now?")) return;
      setShowCardModal(true);
      return;
    }
    if (!confirm(`Renew the ${current.plan.name} plan for ${fmtAMD(renewalInfo?.renewalPrice || 0)}?`)) return;
    setRenewing(true);
    try {
      const res = await vendorAPI.renewSubscription(current.plan.slug);
      if (res?.data) setCurrent(res.data);
      // Refresh billing history
      vendorAPI.billingHistory().catch(() => null).then(r => setHistory(r?.data || []));
    } catch (e) {
      alert("Failed to renew: " + (e?.message || "Unknown error"));
    }
    setRenewing(false);
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title="Subscription" subtitle="Manage your plan and billing" />

      <div className="flex-1 p-6 space-y-6">

        {/* Current Plan Banner */}
        {!loading && current && (
          <div className={`rounded-2xl p-6 ${
            current.status === "cancelled"
              ? "bg-gradient-to-br from-surface-700 to-surface-800"
              : renewalInfo?.isExpired
              ? "bg-gradient-to-br from-danger-600 to-danger-700"
              : renewalInfo?.isExpiringSoon
              ? "bg-gradient-to-br from-amber-500 to-amber-600"
              : "bg-gradient-to-br from-primary-600 to-primary-700"
          }`}>
            <div className="flex items-start justify-between flex-wrap gap-5">
              <div className="flex items-center gap-3 flex-1 min-w-[260px]">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Zap size={22} className="text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-bold text-lg leading-tight">{current.plan?.name} Plan</p>
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-white/20 rounded-full uppercase tracking-wide text-white">
                      {current.status}
                    </span>
                  </div>
                  <p className="text-white/75 text-xs mt-1">
                    Active since {fmtDate(current.starts_at)}
                    {current.cancelled_at ? ` · Cancelled ${fmtDate(current.cancelled_at)}` : ""}
                  </p>
                </div>
              </div>

              {/* Renewal stats grid */}
              {!renewalInfo?.isFree && current.ends_at && (
                <div className="grid grid-cols-3 gap-3 sm:gap-5 text-white">
                  <div className="bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm border border-white/15 min-w-[110px]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Expires</p>
                    <p className="text-sm font-bold mt-1 leading-tight">{fmtDate(current.ends_at)}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm border border-white/15 min-w-[110px]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                      {renewalInfo?.isExpired ? "Expired" : "Days Left"}
                    </p>
                    <p className="text-sm font-bold mt-1 leading-tight">
                      {renewalInfo?.remaining != null
                        ? renewalInfo.isExpired
                          ? `${Math.abs(renewalInfo.remaining)} days ago`
                          : `${renewalInfo.remaining} day${renewalInfo.remaining === 1 ? "" : "s"}`
                        : "—"}
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm border border-white/15 min-w-[110px]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Renewal</p>
                    <p className="text-sm font-bold mt-1 leading-tight">{fmtAMD(renewalInfo?.renewalPrice)}/mo</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action row */}
            {(current.status === "active" || current.status === "cancelled") && !renewalInfo?.isFree && (
              <div className="mt-5 flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleRenew}
                  disabled={renewing}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-primary-700 text-sm font-bold rounded-xl hover:bg-white/95 transition-all shadow cursor-pointer border-none disabled:opacity-60 disabled:cursor-wait"
                >
                  {renewing ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  {renewing ? "Renewing…" : renewalInfo?.isExpired ? "Reactivate Plan" : "Renew Now"}
                </button>
                {current.status === "active" && (
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="px-4 py-2.5 bg-white/15 border border-white/25 text-white text-sm font-medium rounded-xl hover:bg-white/25 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    {cancelling ? "Cancelling…" : "Cancel Plan"}
                  </button>
                )}
              </div>
            )}

            {/* Expiry warning */}
            {renewalInfo?.isExpiringSoon && !renewalInfo.isExpired && current.status === "active" && (
              <div className="mt-4 flex items-center gap-2 text-white/90 text-xs font-medium">
                <Clock size={13} /> Your plan renews in {renewalInfo.remaining} day{renewalInfo.remaining === 1 ? "" : "s"} — renew now to avoid interruption.
              </div>
            )}
            {renewalInfo?.isExpired && (
              <div className="mt-4 flex items-center gap-2 text-white/90 text-xs font-medium">
                <AlertCircle size={13} /> Your subscription has expired. Renew to restore access to paid features.
              </div>
            )}
          </div>
        )}

        {!loading && !current && (
          <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle size={18} className="text-warning-500 flex-shrink-0" />
            <p className="text-sm text-warning-700">You don&apos;t have an active subscription. Choose a plan below to get started.</p>
          </div>
        )}

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${billing === "monthly" ? "text-surface-900" : "text-surface-400"}`}>Monthly</span>
          <button onClick={() => setBilling(b => b === "monthly" ? "yearly" : "monthly")}
            className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer border-none ${billing === "yearly" ? "bg-primary-600" : "bg-surface-300"}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${billing === "yearly" ? "left-7" : "left-1"}`} />
          </button>
          <span className={`text-sm font-medium ${billing === "yearly" ? "text-surface-900" : "text-surface-400"}`}>
            Yearly <span className="text-success-600 text-xs font-bold">−20%</span>
          </span>
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-surface-400">Loading plans…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map(plan => {
              const slug  = plan.slug || plan.name?.toLowerCase();
              const style = PLAN_STYLES[slug] || PLAN_STYLES.basic;
              const Icon  = PLAN_ICONS[slug] || Star;
              const isCurrent = currentPlanSlug === slug;
              const price = fmtPrice(plan.price);
              const isChanging = changing === slug;

              return (
                <div key={plan.id}
                  className={`relative rounded-xl border-2 ${isCurrent ? "border-primary-500" : style.border} bg-white p-6 flex flex-col transition-all hover:shadow-elevated`}>

                  {style.badge && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold ${
                      slug === "pro" ? "bg-primary-600 text-white" : "bg-amber-400 text-white"
                    }`}>
                      {style.badge}
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
                    {isCurrent && <span className="badge badge-purple text-[10px]">Current</span>}
                  </div>

                  <div className="mb-5">
                    <span className="text-3xl font-bold text-surface-900">
                      {plan.price === 0 ? "Free" : fmtAMD(price)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-surface-400 text-sm ml-1">/ {billing === "yearly" ? "mo (billed yearly)" : "month"}</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 mb-6">
                    {(plan.features || []).map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check size={14} className="text-success-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-surface-600">
                          {f.value && f.value !== "true" ? `${f.feature}: ${f.value}` : f.feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => !isCurrent && handleChangePlan(slug)}
                    disabled={isCurrent || isChanging || !!changing}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer border-none transition-all disabled:opacity-50 ${
                      isCurrent ? "bg-surface-100 text-surface-400 cursor-default" : style.btn
                    }`}>
                    {isChanging ? "Applying…" :
                     isCurrent  ? "Current Plan" :
                     plan.price === 0 ? "Downgrade to Free" :
                     currentPlanSlug && plans.find(p => p.slug === currentPlanSlug)?.price > plan.price ? "Downgrade" : "Upgrade"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Payment Method */}
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900 text-sm">Payment Method</h3>
            <button onClick={() => setShowCardModal(true)}
              className="text-xs text-primary-600 font-semibold hover:text-primary-700 cursor-pointer bg-transparent border-none">
              {paymentMethod ? "Update Card" : "+ Add Card"}
            </button>
          </div>
          {paymentMethod ? (
            <div className="flex items-center gap-4 p-4 border border-surface-200 rounded-xl bg-surface-50">
              <div className="w-10 h-7 bg-surface-800 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[9px] font-bold">{paymentMethod.brand?.toUpperCase() || "CARD"}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-surface-800">•••• •••• •••• {paymentMethod.last4}</p>
                <p className="text-xs text-surface-400">{paymentMethod.card_holder} · Expires {paymentMethod.expiry}</p>
              </div>
              <span className="badge badge-success text-[10px]">Default</span>
              <button onClick={() => setShowCardModal(true)}
                className="text-xs text-primary-600 hover:text-primary-700 cursor-pointer bg-transparent border-none font-medium">
                Edit
              </button>
            </div>
          ) : (
            <button onClick={() => setShowCardModal(true)}
              className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-surface-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/30 transition-all cursor-pointer bg-transparent">
              <CreditCard size={16} className="text-surface-400" />
              <span className="text-sm text-surface-400 font-medium">Add a payment card</span>
            </button>
          )}
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-100">
            <h3 className="font-semibold text-surface-900 text-sm">Billing History</h3>
          </div>
          {histLoading ? (
            <div className="px-5 py-8 text-center text-sm text-surface-400">Loading history…</div>
          ) : history.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-surface-400">No billing records yet.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-100">
                  {["Date", "Plan", "Amount", "Status"].map(h => (
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
                    <td className="px-5 py-3.5">
                      <span className={`badge ${STATUS_BADGE[row.status] || "badge-gray"}`}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {showCardModal && (
        <PaymentMethodModal
          initial={paymentMethod}
          onClose={() => setShowCardModal(false)}
          onSave={handleSavePaymentMethod}
        />
      )}
    </div>
  );
}
