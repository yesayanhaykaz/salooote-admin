"use client";
import { useState, useEffect } from "react";
import { Eye, RefreshCw } from "lucide-react";
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

export default function VendorOrders() {
  const { t } = useLocale();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  const STATUS_FILTERS = ["all", "pending", "confirmed", "processing", "delivered", "cancelled"];
  const DROPDOWN_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

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

  const tableData = filtered.map(o => ({
    id:       o.id?.slice(0, 8) || "—",
    _id:      o.id,
    customer: o.user_name || o.shipping_name || "Unknown",
    product:  o.items?.[0]?.product_name || (o.items?.length ? `${o.items.length} ${t("orders.items_suffix")}` : "—"),
    amount:   fmtAmount(o.total, o.currency),
    status:   o.status || "pending",
    date:     fmtDate(o.created_at),
  }));

  const columns = [
    { key: "id",       label: t("orders.order_id"),    sortable: true },
    { key: "customer", label: t("orders.col_customer"), sortable: true },
    { key: "product",  label: t("orders.col_product"),  sortable: true },
    { key: "amount",   label: t("orders.col_amount"),   sortable: true },
    {
      key: "status", label: t("common.status"),
      render: val => (
        <span className={STATUS_BADGE[val] || "badge badge-gray"}>
          {t(STATUS_KEYS[val] || "orders.pending")}
        </span>
      ),
    },
    { key: "date", label: t("orders.col_date"), sortable: true },
    {
      key: "_id", label: t("common.actions"),
      render: (id, row) => (
        <div className="flex items-center gap-1.5">
          <select
            defaultValue={row.status}
            disabled={updatingId === id}
            onChange={e => handleUpdateStatus(id, e.target.value)}
            className="text-xs border border-surface-200 rounded-lg px-2 py-1 bg-white text-surface-700 cursor-pointer outline-none"
          >
            {DROPDOWN_STATUSES.map(s => (
              <option key={s} value={s}>{t(STATUS_KEYS[s])}</option>
            ))}
          </select>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title={t("sidebar.orders")} />

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
              {t(STATUS_KEYS[f])}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-surface-400">
            {t("common.loading")}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={tableData}
            searchable
            searchKeys={["id", "customer", "product", "status"]}
            pageSize={8}
          />
        )}
      </main>
    </div>
  );
}
