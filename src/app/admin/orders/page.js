"use client";
import { useState, useEffect, useCallback } from "react";
import { Eye, X, Package, Truck, User, Store } from "lucide-react";
import TopBar from "@/components/TopBar";
import { adminOrdersAPI } from "@/lib/api";

const STATUS_PILLS = [
  { key: "all",        label: "All" },
  { key: "pending",    label: "Pending" },
  { key: "confirmed",  label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped",    label: "Shipped" },
  { key: "delivered",  label: "Delivered" },
  { key: "cancelled",  label: "Cancelled" },
  { key: "refunded",   label: "Refunded" },
];

const STATUS_COLORS = {
  delivered:  "bg-green-100 text-green-700",
  confirmed:  "bg-green-100 text-green-700",
  pending:    "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped:    "bg-blue-100 text-blue-700",
  cancelled:  "bg-red-100 text-red-700",
  refunded:   "bg-gray-100 text-gray-600",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status] || "bg-gray-100 text-gray-600"}`}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : "—"}
    </span>
  );
}

function fmt(amount, currency) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "AMD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function OrderDetailModal({ orderId, onClose, onStatusChange }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    adminOrdersAPI.get(orderId)
      .then(res => setOrder(res.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleStatus = async (status) => {
    try {
      await adminOrdersAPI.updateStatus(orderId, status);
      setOrder(prev => ({ ...prev, status }));
      onStatusChange(orderId, status);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* panel */}
      <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 flex-shrink-0">
          <div>
            <p className="text-xs text-surface-400 font-medium uppercase tracking-wide">Order Details</p>
            <p className="text-sm font-bold text-surface-800 font-mono mt-0.5">{orderId}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface-100 flex items-center justify-center text-surface-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-surface-400 text-sm">Loading…</div>
        ) : !order ? (
          <div className="flex-1 flex items-center justify-center text-surface-400 text-sm">Order not found</div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

            {/* Status + actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={order.status} />
              <div className="flex items-center gap-1.5 flex-wrap ml-2">
                {["pending","confirmed","processing","shipped","delivered","cancelled"].map(s =>
                  s !== order.status ? (
                    <button
                      key={s}
                      onClick={() => handleStatus(s)}
                      className="px-2.5 py-1 rounded-lg bg-surface-100 hover:bg-primary-50 text-surface-600 hover:text-primary-600 text-xs font-semibold transition-colors whitespace-nowrap"
                    >
                      → {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ) : null
                )}
              </div>
            </div>

            {/* Customer + Vendor */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User size={14} className="text-surface-400" />
                  <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Customer</p>
                </div>
                <p className="text-sm font-semibold text-surface-800">{order.user_name || "—"}</p>
                {order.shipping_phone && <p className="text-xs text-surface-500 mt-1">{order.shipping_phone}</p>}
              </div>
              <div className="bg-surface-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Store size={14} className="text-surface-400" />
                  <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Vendor</p>
                </div>
                <p className="text-sm font-semibold text-surface-800">{order.vendor_name || "—"}</p>
              </div>
            </div>

            {/* Shipping */}
            {order.shipping_address && (
              <div className="bg-surface-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Truck size={14} className="text-surface-400" />
                  <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Shipping Address</p>
                </div>
                <p className="text-sm text-surface-700">
                  {[order.shipping_name, order.shipping_address, order.shipping_city, order.shipping_country].filter(Boolean).join(", ")}
                </p>
              </div>
            )}

            {/* Order Items */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Package size={14} className="text-surface-400" />
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Items</p>
              </div>
              {order.items?.length > 0 ? (
                <div className="border border-surface-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-surface-50 border-b border-surface-100">
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-surface-500 uppercase">Product</th>
                        <th className="px-4 py-2.5 text-center text-xs font-semibold text-surface-500 uppercase">Qty</th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-surface-500 uppercase">Unit Price</th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-surface-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, i) => (
                        <tr key={item.id || i} className="border-b border-surface-50 last:border-0">
                          <td className="px-4 py-3 text-sm text-surface-800 font-medium">{item.product_name || item.product?.name || "—"}</td>
                          <td className="px-4 py-3 text-sm text-surface-600 text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-surface-600 text-right">{fmt(item.unit_price, item.currency)}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-surface-900 text-right">{fmt(item.total, item.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-surface-400">No items</p>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-surface-100 pt-4 space-y-2">
              {order.subtotal != null && (
                <div className="flex justify-between text-sm text-surface-600">
                  <span>Subtotal</span><span>{fmt(order.subtotal, order.currency)}</span>
                </div>
              )}
              {order.delivery_fee > 0 && (
                <div className="flex justify-between text-sm text-surface-600">
                  <span>Delivery</span><span>{fmt(order.delivery_fee, order.currency)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span><span>−{fmt(order.discount, order.currency)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between text-sm text-surface-600">
                  <span>Tax</span><span>{fmt(order.tax, order.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-surface-900 border-t border-surface-100 pt-2 mt-2">
                <span>Total</span><span>{fmt(order.total, order.currency)}</span>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Notes</p>
                <p className="text-sm text-surface-700">{order.notes}</p>
              </div>
            )}

            {/* Meta */}
            <div className="text-xs text-surface-400 space-y-1 pt-2 border-t border-surface-100">
              <p>Created: {new Date(order.created_at).toLocaleString()}</p>
              {order.updated_at && <p>Updated: {new Date(order.updated_at).toLocaleString()}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [activeStatus,  setActiveStatus]  = useState("all");
  const [orders,        setOrders]        = useState([]);
  const [total,         setTotal]         = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [page,          setPage]          = useState(1);
  const [search,        setSearch]        = useState("");
  const [detailOrderId, setDetailOrderId] = useState(null);
  const LIMIT = 20;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: LIMIT, page };
      if (activeStatus !== "all") params.status = activeStatus;
      const res = await adminOrdersAPI.list(params);
      setOrders(res.data || []);
      setTotal(res.pagination?.total ?? (res.data?.length ?? 0));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeStatus, page]);

  useEffect(() => { fetchOrders(); }, [activeStatus, page]);
  useEffect(() => { setPage(1); }, [activeStatus]);

  const handleStatusChange = (id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const filtered = search
    ? orders.filter(o =>
        [o.id, o.user_name, o.vendor_name].some(v =>
          String(v || "").toLowerCase().includes(search.toLowerCase())
        )
      )
    : orders;

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Orders" subtitle={`${total} total orders`} />

      <div className="flex-1 p-6 space-y-5 overflow-auto">
        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-xl p-1.5 flex-wrap">
            {STATUS_PILLS.map((pill) => (
              <button
                key={pill.key}
                onClick={() => setActiveStatus(pill.key)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer border-0 ${
                  activeStatus === pill.key
                    ? "bg-primary-600 text-white"
                    : "text-surface-500 hover:text-surface-800 hover:bg-surface-50 bg-transparent"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-surface-50 rounded-lg px-3 py-2 border border-surface-200 w-[220px] gap-2 ml-auto focus-within:border-primary-400 transition-colors">
            <svg className="w-3.5 h-3.5 text-surface-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search orders..."
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-surface-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-100">
                  {["Order ID", "Customer", "Vendor", "Amount", "Status", "Date", "Actions"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-surface-400">Loading orders…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-surface-400">No orders found</td></tr>
                ) : filtered.map(row => (
                  <tr
                    key={row.id}
                    className="border-b border-surface-50 last:border-0 hover:bg-surface-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-sm font-bold text-primary-600 font-mono">{String(row.id).slice(0, 8)}…</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-medium text-surface-800">{row.user_name || "—"}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-surface-600">{row.vendor_name || "—"}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-bold text-surface-900">{fmt(row.total, row.currency)}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-xs text-surface-400">{new Date(row.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <button
                        onClick={() => setDetailOrderId(row.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-100 hover:bg-primary-50 text-surface-600 hover:text-primary-600 text-xs font-semibold transition-colors"
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-surface-100">
              <span className="text-xs text-surface-400">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-surface-200 text-xs font-semibold text-surface-600 disabled:opacity-40 hover:bg-surface-50 transition-colors">
                  Previous
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-surface-200 text-xs font-semibold text-surface-600 disabled:opacity-40 hover:bg-surface-50 transition-colors">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {detailOrderId && (
        <OrderDetailModal
          orderId={detailOrderId}
          onClose={() => setDetailOrderId(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
