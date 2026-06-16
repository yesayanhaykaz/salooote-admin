"use client";
import { useState, useEffect, useCallback } from "react";
import { Eye, X } from "lucide-react";
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

function StatusBadge({ status }) {
  const map = {
    delivered:  "badge badge-success",
    confirmed:  "badge badge-success",
    pending:    "badge badge-warning",
    processing: "badge badge-info",
    shipped:    "badge badge-info",
    cancelled:  "badge badge-danger",
    refunded:   "badge badge-gray",
  };
  return (
    <span className={map[status] || "badge badge-gray"}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : "—"}
    </span>
  );
}

function fmt(amount, currency) {
  if (!amount && amount !== 0) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "AMD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function OrderDetailPanel({ order, onClose, onStatusChange }) {
  return (
    <div className="border-t border-surface-100 bg-surface-50 px-6 py-5">
      <div className="flex items-start gap-5 flex-wrap">
        <div className="flex-1 min-w-[200px] grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold text-surface-400 uppercase mb-1">Customer</p>
            <p className="text-surface-800 font-medium">{order.user_name || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-surface-400 uppercase mb-1">Vendor</p>
            <p className="text-surface-800 font-medium">{order.vendor_name || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-surface-400 uppercase mb-1">Total</p>
            <p className="text-surface-900 font-bold">{fmt(order.total, order.currency)}</p>
          </div>
          {order.shipping_address && (
            <div>
              <p className="text-xs font-semibold text-surface-400 uppercase mb-1">Shipping</p>
              <p className="text-surface-600">{[order.shipping_name, order.shipping_address, order.shipping_city].filter(Boolean).join(", ")}</p>
            </div>
          )}
          {order.notes && (
            <div>
              <p className="text-xs font-semibold text-surface-400 uppercase mb-1">Notes</p>
              <p className="text-surface-600">{order.notes}</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {["pending","confirmed","processing","shipped","delivered","cancelled"].map(s =>
            s !== order.status ? (
              <button
                key={s}
                onClick={() => onStatusChange(order.id, s)}
                className="px-2.5 py-1.5 rounded-lg bg-surface-100 hover:bg-primary-50 text-surface-600 hover:text-primary-600 text-xs font-semibold transition-colors whitespace-nowrap"
              >
                → {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ) : null
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-200 text-surface-400 transition-colors ml-2"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [activeStatus, setActiveStatus] = useState("all");
  const [orders,       setOrders]       = useState([]);
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [page,         setPage]         = useState(1);
  const [search,       setSearch]       = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
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

  const handleStatusChange = async (id, status) => {
    try {
      await adminOrdersAPI.updateStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      if (selectedOrder?.id === id) setSelectedOrder(prev => ({ ...prev, status }));
    } catch (e) {
      console.error(e);
    }
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
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-surface-400">Loading orders...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-surface-400">No orders found</td>
                  </tr>
                ) : filtered.map(row => (
                  <>
                    <tr
                      key={row.id}
                      onClick={() => setSelectedOrder(selectedOrder?.id === row.id ? null : row)}
                      className={`border-b border-surface-50 last:border-0 cursor-pointer transition-colors hover:bg-surface-50 ${
                        selectedOrder?.id === row.id ? "bg-primary-50" : ""
                      }`}
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
                      <td className="px-5 py-3.5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedOrder(selectedOrder?.id === row.id ? null : row)}
                          className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer bg-white"
                          title="View Details"
                        >
                          <Eye size={13} />
                        </button>
                      </td>
                    </tr>
                    {selectedOrder?.id === row.id && (
                      <tr key={`detail-${row.id}`}>
                        <td colSpan={7} className="p-0">
                          <OrderDetailPanel
                            order={selectedOrder}
                            onClose={() => setSelectedOrder(null)}
                            onStatusChange={handleStatusChange}
                          />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-surface-100">
              <span className="text-xs text-surface-400">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-surface-200 text-xs font-semibold text-surface-600 disabled:opacity-40 hover:bg-surface-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-surface-200 text-xs font-semibold text-surface-600 disabled:opacity-40 hover:bg-surface-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
