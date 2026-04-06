"use client";
import { useState } from "react";
import { Package, Star } from "lucide-react";
import TopBar from "@/components/TopBar";
import { SAMPLE_ORDERS } from "@/lib/data";

const STATUS_FILTERS = ["All", "Pending", "Processing", "Delivered", "Cancelled"];

const STATUS_STYLES = {
  delivered:  { badge: "badge badge-success", dot: "bg-success-500" },
  pending:    { badge: "badge badge-warning",  dot: "bg-warning-500" },
  processing: { badge: "badge badge-info",     dot: "bg-info-500"    },
  cancelled:  { badge: "badge badge-danger",   dot: "bg-danger-500"  },
};

const CARD_GRADIENTS = [
  "from-pink-400 to-rose-500",
  "from-violet-400 to-purple-500",
  "from-blue-400 to-indigo-500",
  "from-emerald-400 to-green-500",
  "from-orange-400 to-amber-500",
  "from-teal-400 to-cyan-500",
  "from-fuchsia-400 to-pink-500",
  "from-sky-400 to-blue-500",
];

export default function UserOrders() {
  const [activeFilter, setActiveFilter] = useState("All");

  const orders = SAMPLE_ORDERS.slice(0, 6);
  const filtered = activeFilter === "All"
    ? orders
    : orders.filter(o => o.status.toLowerCase() === activeFilter.toLowerCase());

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title="My Orders" />

      <main className="flex-1 p-6 space-y-5">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                activeFilter === f
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-white text-surface-600 border-surface-200 hover:border-primary-300 hover:text-primary-600"
              }`}
            >
              {f}
              {f === "All" && (
                <span className="ml-1.5 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{orders.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Order Cards */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mb-4">
              <Package size={24} className="text-surface-400" />
            </div>
            <p className="text-sm font-medium text-surface-600">No orders found</p>
            <p className="text-xs text-surface-400 mt-1">Try a different filter</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order, i) => {
              const styleKey = order.status;
              const style = STATUS_STYLES[styleKey] || { badge: "badge badge-gray", dot: "bg-surface-300" };
              return (
                <div key={order.id} className="bg-white rounded-xl border border-surface-200 p-5 hover:shadow-card transition-shadow fade-in">
                  <div className="flex items-start gap-4">
                    {/* Product Image Placeholder */}
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-xl font-bold opacity-60">{order.product.charAt(0)}</span>
                    </div>

                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div>
                          <p className="text-sm font-semibold text-surface-900">{order.product}</p>
                          <p className="text-xs text-surface-400 mt-0.5">from {order.vendor}</p>
                        </div>
                        <span className={style.badge}>{order.status}</span>
                      </div>

                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-surface-400">Order</span>
                          <span className="text-xs font-mono font-semibold text-surface-700">{order.id}</span>
                        </div>
                        <span className="text-surface-200">|</span>
                        <span className="text-xs text-surface-400">{order.date}</span>
                        <span className="text-surface-200">|</span>
                        <span className="text-sm font-bold text-primary-600">{order.amount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-surface-50">
                    <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none">
                      <Package size={13} /> Track Order
                    </button>
                    {order.status === "delivered" && (
                      <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-surface-600 bg-surface-100 rounded-lg hover:bg-surface-200 transition-colors cursor-pointer border-none">
                        <Star size={13} /> Leave Review
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
