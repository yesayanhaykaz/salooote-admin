"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye, RefreshCw, CheckCircle2, XCircle, Clock, Package, ChevronDown, ChevronUp,
  X, User, Phone, Mail, MapPin, Calendar, MessageSquare, Image as ImageIcon, FileText,
  CreditCard, Truck, ExternalLink,
} from "lucide-react";
import TopBar from "@/components/TopBar";
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

function fmtDate(iso, withTime = false) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (withTime) {
    return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtAmount(total, currency) {
  if (total == null) return "—";
  return `${currency || "AMD"} ${Number(total).toLocaleString()}`;
}

/* ── Order detail drawer/modal ─────────────────────────────────────── */
function OrderDetailModal({ orderId, onClose, onUpdateStatus, updatingId }) {
  const { t } = useLocale();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const goToProduct = (productId) => {
    if (!productId) return;
    onClose?.();
    router.push(`/vendor/products?edit=${productId}`);
  };

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    vendorAPI.getOrder(orderId)
      .then(res => setOrder(res?.data || null))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  // Update local order state when status changes externally
  useEffect(() => {
    if (order && updatingId === order.id) return;
  }, [updatingId, order]);

  const handleStatus = async (status) => {
    if (!order) return;
    await onUpdateStatus(order.id, status);
    setOrder(prev => prev ? { ...prev, status } : prev);
  };

  const items = order?.items || [];
  const itemSubtotal = items.reduce((sum, it) => sum + Number(it.unit_price || 0) * Number(it.quantity || 0), 0);
  const isPending = order?.status?.toLowerCase() === "pending";

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative ml-auto w-full max-w-[640px] bg-surface-50 shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-surface-400">Order Details</p>
            <p className="text-sm font-bold text-surface-900 mt-0.5">
              #{order?.id?.slice(-8).toUpperCase() || "…"}
              {order?.status && (
                <span className={`ml-2 ${STATUS_BADGE[order.status?.toLowerCase()] || "badge badge-gray"}`}>
                  {t(`orders.${order.status.toLowerCase()}`) || order.status}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-100 cursor-pointer border-none bg-transparent transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {loading ? (
            <div className="py-20 text-center text-sm text-surface-400 flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              Loading order…
            </div>
          ) : !order ? (
            <div className="py-16 text-center text-sm text-surface-400">Order not found.</div>
          ) : (
            <>
              {/* Customer card */}
              <div className="bg-white rounded-2xl border border-surface-200 p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-3 flex items-center gap-1.5">
                  <User size={12} /> Customer
                </p>
                <p className="text-base font-bold text-surface-900">
                  {order.user_name || order.shipping_name || order.customer_name || "Customer"}
                </p>
                <div className="mt-3 space-y-1.5 text-sm text-surface-600">
                  {(order.user_email || order.customer_email) && (
                    <a href={`mailto:${order.user_email || order.customer_email}`} className="flex items-center gap-2 hover:text-primary-600 transition-colors">
                      <Mail size={13} className="text-surface-400" />
                      {order.user_email || order.customer_email}
                    </a>
                  )}
                  {(order.customer_phone || order.shipping_phone) && (
                    <a href={`tel:${(order.customer_phone || order.shipping_phone).replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-primary-600 transition-colors">
                      <Phone size={13} className="text-surface-400" />
                      {order.customer_phone || order.shipping_phone}
                    </a>
                  )}
                  {order.shipping_address && (
                    <div className="flex items-start gap-2">
                      <MapPin size={13} className="text-surface-400 mt-0.5 flex-shrink-0" />
                      <span>{order.shipping_address}{order.shipping_city ? `, ${order.shipping_city}` : ""}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Event/delivery date */}
              {(order.event_date || order.delivery_date || order.created_at) && (
                <div className="grid grid-cols-2 gap-3">
                  {order.event_date && (
                    <div className="bg-white rounded-2xl border border-surface-200 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-2 flex items-center gap-1.5">
                        <Calendar size={12} /> Event Date
                      </p>
                      <p className="text-sm font-bold text-surface-900">{fmtDate(order.event_date)}</p>
                      {order.event_time && <p className="text-xs text-surface-500 mt-0.5">{order.event_time}</p>}
                    </div>
                  )}
                  {order.delivery_date && (
                    <div className="bg-white rounded-2xl border border-surface-200 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-2 flex items-center gap-1.5">
                        <Truck size={12} /> Delivery
                      </p>
                      <p className="text-sm font-bold text-surface-900">{fmtDate(order.delivery_date)}</p>
                      {order.delivery_time && <p className="text-xs text-surface-500 mt-0.5">{order.delivery_time}</p>}
                    </div>
                  )}
                  <div className="bg-white rounded-2xl border border-surface-200 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-2 flex items-center gap-1.5">
                      <Clock size={12} /> Placed
                    </p>
                    <p className="text-sm font-bold text-surface-900">{fmtDate(order.created_at, true)}</p>
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-surface-100 flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-surface-500 flex items-center gap-1.5">
                    <Package size={12} /> Items ({items.length})
                  </p>
                </div>
                <div className="divide-y divide-surface-100">
                  {items.length === 0 && (
                    <div className="px-5 py-6 text-center text-sm text-surface-400">No items.</div>
                  )}
                  {items.map((it, i) => {
                    const opts = it.options || it.parameters || it.params || it.attributes || null;
                    const optEntries = opts && typeof opts === "object" ? Object.entries(opts) : [];
                    const lineTotal = Number(it.unit_price || 0) * Number(it.quantity || 0);
                    const productId = it.product_id || it.productId;
                    const imgSrc = it.image_url || it.thumbnail_url || it.product_image || it.images?.[0]?.url || it.images?.[0];
                    const isClickable = !!productId;
                    return (
                      <div key={i} className="px-5 py-4 flex gap-4">
                        <button
                          type="button"
                          onClick={() => goToProduct(productId)}
                          disabled={!isClickable}
                          className={`w-16 h-16 rounded-xl bg-surface-100 overflow-hidden flex-shrink-0 flex items-center justify-center border-none p-0 ${
                            isClickable ? "cursor-pointer hover:ring-2 hover:ring-primary-300 transition-all" : "cursor-default"
                          }`}
                          aria-label={isClickable ? "Open product" : undefined}
                        >
                          {imgSrc ? (
                            <img src={imgSrc} alt={it.product_name || "Item"} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={20} className="text-surface-300" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => goToProduct(productId)}
                                disabled={!isClickable}
                                className={`text-sm font-semibold text-surface-900 leading-snug border-none bg-transparent p-0 text-left ${
                                  isClickable ? "cursor-pointer hover:text-primary-600 transition-colors" : "cursor-default"
                                }`}
                              >
                                {it.product_name || "Item"}
                                {isClickable && <ExternalLink size={11} className="inline-block ml-1 -mt-0.5 opacity-60" />}
                              </button>
                              {it.sku && <p className="text-[11px] text-surface-400 font-mono">SKU: {it.sku}</p>}
                            </div>
                            <p className="text-sm font-bold text-surface-900 flex-shrink-0">
                              {fmtAmount(lineTotal, order.currency)}
                            </p>
                          </div>
                          <div className="mt-1 text-xs text-surface-500 flex items-center gap-2 flex-wrap">
                            <span>{Number(it.quantity || 0)} × {fmtAmount(it.unit_price, order.currency)}</span>
                          </div>
                          {optEntries.length > 0 && (
                            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                              {optEntries.map(([k, v]) => (
                                <span key={k} className="text-[11px] bg-primary-50 text-primary-700 font-semibold px-2 py-0.5 rounded-full border border-primary-100">
                                  {k}: <span className="font-bold">{String(v)}</span>
                                </span>
                              ))}
                            </div>
                          )}
                          {it.notes && (
                            <p className="mt-2 text-xs text-surface-500 italic bg-surface-50 rounded-lg px-2.5 py-1.5 border border-surface-100">
                              {it.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="px-5 py-4 bg-surface-50/60 border-t border-surface-100 space-y-1.5">
                  <div className="flex justify-between text-sm text-surface-600">
                    <span>Subtotal</span>
                    <span>{fmtAmount(itemSubtotal, order.currency)}</span>
                  </div>
                  {order.shipping_fee != null && Number(order.shipping_fee) > 0 && (
                    <div className="flex justify-between text-sm text-surface-600">
                      <span>Shipping</span>
                      <span>{fmtAmount(order.shipping_fee, order.currency)}</span>
                    </div>
                  )}
                  {order.discount != null && Number(order.discount) > 0 && (
                    <div className="flex justify-between text-sm text-success-600">
                      <span>Discount</span>
                      <span>−{fmtAmount(order.discount, order.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-surface-900 pt-2 border-t border-surface-200">
                    <span>Total</span>
                    <span>{fmtAmount(order.total, order.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Customer notes */}
              {order.notes && (
                <div className="bg-white rounded-2xl border border-surface-200 p-5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-2 flex items-center gap-1.5">
                    <MessageSquare size={12} /> Customer note
                  </p>
                  <p className="text-sm text-surface-700 italic leading-relaxed">{order.notes}</p>
                </div>
              )}

              {/* Attachments */}
              {(order.attachments?.length > 0 || order.images?.length > 0) && (
                <div className="bg-white rounded-2xl border border-surface-200 p-5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-3 flex items-center gap-1.5">
                    <FileText size={12} /> Attachments
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {(order.attachments || order.images || []).map((att, i) => {
                      const url = att.url || att;
                      const isImage = /\.(png|jpe?g|gif|webp|avif)$/i.test(url);
                      return (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="aspect-square rounded-xl bg-surface-100 overflow-hidden border border-surface-200 hover:border-primary-300 transition-all flex items-center justify-center group relative"
                        >
                          {isImage ? (
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <FileText size={20} className="text-surface-400" />
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <ExternalLink size={14} className="text-white" />
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Payment */}
              {(order.payment_status || order.payment_method) && (
                <div className="bg-white rounded-2xl border border-surface-200 p-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center">
                    <CreditCard size={16} className="text-surface-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-surface-400 font-semibold uppercase tracking-wider">Payment</p>
                    <p className="text-sm font-semibold text-surface-800">
                      {order.payment_method || "—"}
                      {order.payment_status && (
                        <span className={`ml-2 text-[10px] ${STATUS_BADGE[order.payment_status?.toLowerCase()] || "badge badge-gray"}`}>{order.payment_status}</span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer actions */}
        {!loading && order && (
          <div className="bg-white border-t border-surface-200 px-6 py-4 flex items-center gap-2 flex-wrap flex-shrink-0">
            {isPending ? (
              <>
                <button
                  onClick={() => handleStatus("confirmed")}
                  disabled={updatingId === order.id}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 cursor-pointer border-none disabled:opacity-60 transition-colors"
                >
                  <CheckCircle2 size={14} /> Accept Order
                </button>
                <button
                  onClick={() => handleStatus("cancelled")}
                  disabled={updatingId === order.id}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 cursor-pointer border border-red-200 transition-colors disabled:opacity-60"
                >
                  <XCircle size={14} /> Decline
                </button>
              </>
            ) : (
              <>
                <span className="text-xs text-surface-500 font-medium">Update status:</span>
                <select
                  value={order.status}
                  disabled={updatingId === order.id}
                  onChange={e => handleStatus(e.target.value)}
                  className="flex-1 text-sm border border-surface-200 rounded-xl px-3 py-2 bg-white text-surface-700 cursor-pointer outline-none focus:border-primary-400"
                >
                  {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map(s => (
                    <option key={s} value={s}>{t(`orders.${s}`) || s}</option>
                  ))}
                </select>
                {updatingId === order.id && <RefreshCw size={14} className="text-surface-400 animate-spin" />}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Order list card ───────────────────────────────────────────────── */
function OrderCard({ order, updatingId, onUpdateStatus, onView }) {
  const { t } = useLocale();
  const [expanded, setExpanded] = useState(false);
  const isPending = order.status?.toLowerCase() === "pending";

  const DROPDOWN_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

  return (
    <div className={`bg-white rounded-xl border transition-all ${isPending ? "border-amber-200 shadow-sm" : "border-surface-200"}`}>
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
                {order.status ? (t(`orders.${order.status.toLowerCase()}`) || order.status) : t("orders.pending")}
              </span>
            </div>
            <p className="text-sm text-surface-600">
              <span className="font-medium">{order.user_name || order.shipping_name || order.customer_name || "Customer"}</span>
              {order.customer_phone && <span className="text-surface-400 ml-2">· {order.customer_phone}</span>}
            </p>
            {order.shipping_address && (
              <p className="text-xs text-surface-400 mt-0.5 flex items-center gap-1">
                <MapPin size={11} /> {order.shipping_address}
              </p>
            )}
            <p className="text-xs text-surface-400 mt-0.5 flex items-center gap-1">
              <Clock size={11} /> {fmtDate(order.created_at)}
              {order.event_date && (
                <>
                  <span className="mx-1">·</span>
                  <Calendar size={11} /> Event {fmtDate(order.event_date)}
                </>
              )}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className="text-base font-bold text-surface-900">{fmtAmount(order.total, order.currency)}</span>
            <span className="text-xs text-surface-400">{order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

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

        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onView(order.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary-50 text-primary-700 text-xs font-semibold rounded-lg hover:bg-primary-100 cursor-pointer border border-primary-100 transition-colors"
          >
            <Eye size={13} /> View Details
          </button>

          {isPending ? (
            <>
              <button
                disabled={updatingId === order.id}
                onClick={() => onUpdateStatus(order.id, "confirmed")}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 cursor-pointer border-none transition-colors disabled:opacity-60"
              >
                <CheckCircle2 size={13} /> Accept
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
            <div className="flex items-center gap-2 ml-auto">
              <select
                value={order.status}
                disabled={updatingId === order.id}
                onChange={e => onUpdateStatus(order.id, e.target.value)}
                className="text-xs border border-surface-200 rounded-lg px-2 py-1.5 bg-white text-surface-700 cursor-pointer outline-none focus:border-primary-400"
              >
                {DROPDOWN_STATUSES.map(s => (
                  <option key={s} value={s}>{t(`orders.${s}`) || s}</option>
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

/* ── Page ──────────────────────────────────────────────────────────── */
export default function VendorOrders() {
  const { t } = useLocale();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  const [viewingOrderId, setViewingOrderId] = useState(null);

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
              {f === "all" ? t("common.all") : t(`orders.${f}`)}
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
                onView={setViewingOrderId}
              />
            ))}
          </div>
        )}
      </main>

      {viewingOrderId && (
        <OrderDetailModal
          orderId={viewingOrderId}
          onClose={() => setViewingOrderId(null)}
          onUpdateStatus={handleUpdateStatus}
          updatingId={updatingId}
        />
      )}
    </div>
  );
}
