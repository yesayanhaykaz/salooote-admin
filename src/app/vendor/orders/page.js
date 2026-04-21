"use client";
import { useState, useEffect } from "react";
import { Eye, RefreshCw, CheckCircle2, XCircle, Clock, Package, Truck, ChevronDown, ChevronUp } from "lucide-react";
import TopBar from "@/components/TopBar";
import DataTable from "@/components/DataTable";
import { vendorAPI } from "@/lib/api";
import { useLocale } from "@/lib/i18n";

const STATUS_BADGE = {
  delivered:  "badge badge-success",
  confirmed:  "badge badge-success",
  pending:    "badge badge-warning",
  processing: "badge badge-info",
  cancelled:  "badge badge-danger",
  shipped:    "badge badge-info",
  refunded:   "badge badge-gray",
};

const STATUS_KEYS = {
  all:        "common.all",
  pending:    "orders.pending",
  confirmed:  "orders.confirmed",
  processing: "orders.processing",
  delivered:  "orders.delivered",
  cancelled:  "orders.cancelled",
  shipped:    "orders.shipped",
  refunded:   "orders.refunded",
};

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtAmount(total, currency) {
  if (total == null) return "—";
  return `${currency || "AMD"} ${Number(total).toLocaleString()}`;
}

function OrderCard({ order, updatingId, onUpdateStatus }) {
  const { t } = useLocale();
  const [expanded, setExpanded] = useState(false);
  const isPending = order.status?.toLowerCase() === "pending";

  const DROPDOWN_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

  return (
    <div className={`bg-white rounded-xl border transition-all ${isPending ? "border-amber-200 shadow-sm" : "border-surface-200"}`}>
      {/* Pending badge banner */}
      {isPending && (
        <div className="bg-amber-50 px-4 py-2 rounded-t-xl border-b border-amber-100 flex items-center gap-2">
          <Clock size={13} className="text-amber-500" />
          <span className="text-xs font-semibold text-amber-700">New order — waiting for your response</span>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-surface-900">#{order.id?.slice(-8).toUpperCase()}</span>
              <span className={STATUS_BADGE[order.status?.toLowerCase()] || "badge badge-gray"}>
                {order.status || "pending"}
              </span>
            </div>
            <p className="text-sm text-surface-600">
              <span className="font-medium">{order.user_name || order.shipping_name || order.customer_name || "Customer"}</span>
              {order.customer_phone && <span className="text-surface-400 ml-2">· {order.customer_phone}</span>}
            </p>
            {order.shipping_address && (
              <p className="text-xs text-surface-400 mt-0.5">📍 {order.shipping_address}</p>
            )}
            <p className="text-xs text-surface-400 mt-0.5">{fmtDate(order.created_at)}</p>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className="text-base font-bold text-surface-900">{fmtAmount(order.total, order.currency)}</span>
            <span className="text-xs text-surface-400">{order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Items preview */}
        {order.items?.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-surface-500 hover:text-surface-800 cursor-pointer bg-transparent border-none transition-colors"
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? "Hide items" : `Show ${order.items.length} item${order.items.length !== 1 ? "s" : ""}`}
            </button>
            {expanded && (
              <div className="mt-2 space-y-1.5 border-t border-surface-100 pt-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-surface-700">{item.product_name || "Item"} × {item.quantity}</span>
                    <span className="text-surface-500">{Number(item.unit_price * item.quantity).toLocaleString()} ֏</span>
                  </div>
                ))}
                {order.notes && (
                  <p className="text-xs text-surface-400 italic mt-1">Note: {order.notes}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          {isPending ? (
            <>
              <button
                disabled={updatingId === order.id}
                onClick={() => onUpdateStatus(order.id, "confirmed")}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 cursor-pointer border-none transition-colors disabled:opacity-60"
              >
                <CheckCircle2 size={13} /> Accept Order
              </button>
              <button
                disabled={updatingId === order.id}
                onClick={() => onUpdateStatus(order.id, "cancelled")}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 cursor-pointer border border-red-200 transition-colors disabled:opacity-60"
              >
                <XCircle size={13} /> Decline
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-surface-500 font-medium">Update status:</span>
              <select
                value={order.status}
                disabled={updatingId === order.id}
                onChange={e => onUpdateStatus(order.id, e.target.value)}
                className="text-xs border border-surface-200 rounded-lg px-2 py-1.5 bg-white text-surface-700 cursor-pointer outline-none focus:border-primary-400"
              >
                {DROPDOWN_STATUSES.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              {updatingId === order.id && (
                <RefreshCw size={12} className="text-surface-400 animate-spin" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VendorOrders() {
  const { t } = useLocale();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  const STATUS_FILTERS = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

  useEffect(() => {
    vendorAPI.orders({ limit: 50 })
      .then(res => setOrders(res?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await vendorAPI.updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch {}
    setUpdatingId(null);
  };

  const filtered = activeFilter === "all"
    ? orders
    : orders.filter(o => o.status?.toLowerCase() === activeFilter);

  const pendingCount = orders.filter(o => o.status?.toLowerCase() === "pending").length;

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title={t("sidebar.orders")} />

      <main className="flex-1 p-6 space-y-5">
        {/* Stats row */}
        {!loading && pendingCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 flex items-center gap-3">
            <Clock size={18} className="text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-800">
                {pendingCount} pending order{pendingCount !== 1 ? "s" : ""} waiting for your response
              </p>
              <p className="text-xs text-amber-600">Accept or decline new orders below.</p>
            </div>
            <button
              onClick={() => setActiveFilter("pending")}
              className="ml-auto px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 cursor-pointer border-none transition-colors"
            >
              View Pending
            </button>
          </div>
        )}

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
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "pending" && pendingCount > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-surface-400">
            {t("common.loading")}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-surface-200 flex flex-col items-center justify-center py-16 text-center">
            <Package size={32} className="text-surface-300 mb-3" />
            <p className="font-semibold text-surface-700">No orders found</p>
            <p className="text-sm text-surface-400 mt-1">
              {activeFilter === "all" ? "Orders will appear here once customers place them." : `No ${activeFilter} orders.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                updatingId={updatingId}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
