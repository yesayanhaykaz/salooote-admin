"use client";
import { useState, useEffect } from "react";
import { Package, ChevronDown, ChevronUp } from "lucide-react";
import TopBar from "@/components/TopBar";
import { userAPI } from "@/lib/api";

const STATUS_FILTERS = ["All", "Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

const STATUS_STYLES = {
  pending:    "badge badge-warning",
  confirmed:  "badge badge-info",
  processing: "badge badge-info",
  shipped:    "badge badge-purple",
  delivered:  "badge badge-success",
  cancelled:  "badge badge-danger",
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function shortId(id) {
  if (!id) return "—";
  return id.slice(-8).toUpperCase();
}

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    userAPI.orders({ limit: 50 })
      .then(res => setOrders(res?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeFilter === "All"
    ? orders
    : orders.filter(o => o.status?.toLowerCase() === activeFilter.toLowerCase());

  function toggleExpand(id) {
    setExpandedId(prev => prev === id ? null : id);
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title="My Orders" subtitle={`${orders.length} order${orders.length !== 1 ? "s" : ""}`} />

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
              {f === "All" && orders.length > 0 && (
                <span className="ml-1.5 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{orders.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 text-sm text-surface-400">Loading…</div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mb-4">
              <Package size={24} className="text-surface-400" />
            </div>
            <p className="text-sm font-medium text-surface-600">No orders found</p>
            <p className="text-xs text-surface-400 mt-1">
              {activeFilter === "All" ? "You have not placed any orders yet." : "Try a different filter."}
            </p>
          </div>
        )}

        {/* Order Cards */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map(order => {
              const statusKey = order.status?.toLowerCase() || "";
              const badgeCls = STATUS_STYLES[statusKey] || "badge badge-gray";
              const expanded = expandedId === order.id;
              const items = order.items || [];

              return (
                <div key={order.id} className="bg-white rounded-xl border border-surface-200 overflow-hidden hover:shadow-card transition-shadow">
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center flex-shrink-0">
                        <Package size={20} className="text-primary-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div>
                            <p className="text-sm font-semibold text-surface-900">
                              Order #{shortId(order.id)}
                            </p>
                            <p className="text-xs text-surface-400 mt-0.5">
                              {order.vendor_name || `Vendor ${order.vendor_id ? order.vendor_id.slice(-6) : "—"}`}
                            </p>
                          </div>
                          <span className={badgeCls}>{order.status || "—"}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="text-xs text-surface-400">{formatDate(order.created_at)}</span>
                          {order.total != null && (
                            <>
                              <span className="text-surface-200">|</span>
                              <span className="text-sm font-bold text-primary-600">
                                {order.currency?.toUpperCase() || ""} {order.total}
                              </span>
                            </>
                          )}
                          {items.length > 0 && (
                            <>
                              <span className="text-surface-200">|</span>
                              <span className="text-xs text-surface-400">{items.length} item{items.length !== 1 ? "s" : ""}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {items.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-surface-50 flex items-center justify-between">
                        <button
                          onClick={() => toggleExpand(order.id)}
                          className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 cursor-pointer border-none bg-transparent"
                        >
                          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          {expanded ? "Hide items" : "Show items"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expanded items */}
                  {expanded && items.length > 0 && (
                    <div className="border-t border-surface-100 bg-surface-50 px-5 py-3 space-y-2">
                      {items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1">
                          <span className="text-surface-700 font-medium">{item.product_name || `Item ${i + 1}`}</span>
                          <div className="flex items-center gap-3 text-surface-500">
                            <span>Qty: {item.quantity || 1}</span>
                            {item.unit_price != null && (
                              <span className="font-semibold text-surface-700">
                                {order.currency?.toUpperCase() || ""} {item.unit_price}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
