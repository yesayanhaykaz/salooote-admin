"use client";
import { useState } from "react";
import { Check, Zap, Crown, Star, AlertCircle } from "lucide-react";
import TopBar from "@/components/TopBar";

const PLANS = [
  {
    key: "basic",
    name: "Basic",
    price: 0,
    period: "Free forever",
    icon: Star,
    color: "text-surface-500",
    border: "border-surface-200",
    bg: "bg-white",
    badge: null,
    features: [
      "Up to 10 products",
      "Up to 5 services",
      "Basic analytics",
      "Email support",
      "Standard listing",
      "1 store photo",
      "Order management",
    ],
    missing: [
      "Featured placement",
      "Custom store URL",
      "Priority support",
      "Advanced analytics",
      "API access",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: 29,
    period: "per month",
    icon: Zap,
    color: "text-primary-600",
    border: "border-primary-500",
    bg: "bg-white",
    badge: "Most Popular",
    features: [
      "Up to 100 products",
      "Up to 30 services",
      "Advanced analytics",
      "Priority support",
      "Featured listing badge",
      "Custom store URL",
      "5 store photos",
      "Order management",
      "Discount & promo codes",
      "Customer reviews tools",
    ],
    missing: [
      "Dedicated account manager",
      "API access",
    ],
  },
  {
    key: "premium",
    name: "Premium",
    price: 79,
    period: "per month",
    icon: Crown,
    color: "text-amber-500",
    border: "border-amber-400",
    bg: "bg-white",
    badge: "Best Value",
    features: [
      "Unlimited products",
      "Unlimited services",
      "Full analytics & reports",
      "24/7 dedicated support",
      "Top placement in search",
      "Unlimited store photos",
      "Custom domain support",
      "API access",
      "Bulk product import",
      "Dedicated account manager",
      "White-label invoices",
      "Advanced discount tools",
    ],
    missing: [],
  },
];

const BILLING_HISTORY = [
  { date: "Mar 1, 2025",  plan: "Pro",   amount: "$29.00", status: "paid" },
  { date: "Feb 1, 2025",  plan: "Pro",   amount: "$29.00", status: "paid" },
  { date: "Jan 1, 2025",  plan: "Basic", amount: "$0.00",  status: "free" },
];

export default function VendorSubscription() {
  const [current, setCurrent] = useState("pro");
  const [billing, setBilling] = useState("monthly");

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title="Subscription" subtitle="Manage your plan and billing" />

      <div className="flex-1 p-6 space-y-6">

        {/* Current Plan Banner */}
        <div className="bg-primary-600 rounded-xl p-5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base">Pro Plan — Active</p>
              <p className="text-white/60 text-xs">Next billing on May 1, 2025 · $29.00</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white/15 border border-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/25 transition-colors cursor-pointer">
              Cancel Plan
            </button>
            <button className="px-4 py-2 bg-white text-primary-600 text-sm font-bold rounded-lg hover:bg-primary-50 transition-colors cursor-pointer border-none">
              Manage Billing
            </button>
          </div>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${billing === "monthly" ? "text-surface-900" : "text-surface-400"}`}>Monthly</span>
          <button
            onClick={() => setBilling(b => b === "monthly" ? "yearly" : "monthly")}
            className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer border-none ${billing === "yearly" ? "bg-primary-600" : "bg-surface-300"}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${billing === "yearly" ? "left-7" : "left-1"}`} />
          </button>
          <span className={`text-sm font-medium ${billing === "yearly" ? "text-surface-900" : "text-surface-400"}`}>
            Yearly <span className="text-success-600 text-xs font-bold">-20%</span>
          </span>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = current === plan.key;
            const price = billing === "yearly" && plan.price > 0
              ? Math.round(plan.price * 0.8)
              : plan.price;

            return (
              <div
                key={plan.key}
                className={`relative rounded-xl border-2 ${isCurrentPlan ? "border-primary-500" : plan.border} bg-white p-6 flex flex-col transition-all hover:shadow-elevated`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold ${
                    plan.key === "pro" ? "bg-primary-600 text-white" : "bg-amber-400 text-white"
                  }`}>
                    {plan.badge}
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className={`w-9 h-9 rounded-lg ${plan.key === "basic" ? "bg-surface-100" : plan.key === "pro" ? "bg-primary-50" : "bg-amber-50"} flex items-center justify-center mb-3`}>
                      <Icon size={18} className={plan.color} />
                    </div>
                    <p className="font-bold text-surface-900 text-lg">{plan.name}</p>
                  </div>
                  {isCurrentPlan && (
                    <span className="badge badge-purple text-[10px]">Current</span>
                  )}
                </div>

                <div className="mb-5">
                  <span className="text-3xl font-bold text-surface-900">${price}</span>
                  {plan.price > 0 && <span className="text-surface-400 text-sm ml-1">{plan.period}</span>}
                  {plan.price === 0 && <span className="text-surface-400 text-sm ml-1">forever</span>}
                  {billing === "yearly" && plan.price > 0 && (
                    <p className="text-xs text-success-600 font-semibold mt-0.5">Billed ${price * 12}/year</p>
                  )}
                </div>

                <div className="flex-1 space-y-2 mb-6">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <Check size={14} className="text-success-500 flex-shrink-0" />
                      <span className="text-sm text-surface-600">{f}</span>
                    </div>
                  ))}
                  {plan.missing.map((f, i) => (
                    <div key={i} className="flex items-center gap-2.5 opacity-35">
                      <div className="w-3.5 h-0.5 bg-surface-300 flex-shrink-0 ml-px" />
                      <span className="text-sm text-surface-400 line-through">{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setCurrent(plan.key)}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer border-none transition-all ${
                    isCurrentPlan
                      ? "bg-surface-100 text-surface-400 cursor-default"
                      : plan.key === "pro"
                      ? "bg-primary-600 text-white hover:bg-primary-700"
                      : plan.key === "premium"
                      ? "bg-amber-400 text-white hover:bg-amber-500"
                      : "bg-white text-surface-700 border border-surface-200 hover:bg-surface-50"
                  }`}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? "Current Plan" : plan.price === 0 ? "Downgrade" : "Upgrade"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900 text-sm">Payment Method</h3>
            <button className="text-xs text-primary-600 font-semibold hover:text-primary-700 cursor-pointer bg-transparent border-none">
              + Add Card
            </button>
          </div>
          <div className="flex items-center gap-4 p-4 border border-surface-200 rounded-xl bg-surface-50">
            <div className="w-10 h-7 bg-surface-800 rounded flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">VISA</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-surface-800">•••• •••• •••• 4242</p>
              <p className="text-xs text-surface-400">Expires 08/26</p>
            </div>
            <span className="badge badge-success text-[10px]">Default</span>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-100">
            <h3 className="font-semibold text-surface-900 text-sm">Billing History</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-100">
                {["Date", "Plan", "Amount", "Status", "Invoice"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BILLING_HISTORY.map((row, i) => (
                <tr key={i} className="border-b border-surface-50 last:border-0 table-row">
                  <td className="px-5 py-3.5 text-sm text-surface-700">{row.date}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-surface-800">{row.plan}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-surface-900">{row.amount}</td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${row.status === "paid" ? "badge-success" : "badge-gray"}`}>{row.status}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="text-xs text-primary-600 font-medium hover:text-primary-700 cursor-pointer bg-transparent border-none">
                      Download PDF
                    </button>
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
