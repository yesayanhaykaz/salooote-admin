"use client";
import { useState, useEffect } from "react";
import { Eye, RefreshCw } from "lucide-react";
import TopBar from "@/components/TopBar";
import DataTable from "@/components/DataTable";
import { vendorAPI } from "@/lib/api";

const STATUS_FILTERS = ["All", "Pending", "Confirmed", "Processing", "Delivered", "Cancelled"];

const STATUS_BADGE = {
  delivered:  "badge badge-success",
  confirmed:  "badge badge-success",
  pending:    "badge badge-warning",
  processing: "badge badge-info",
  cancelled:  "badge badge-danger",
  shipped:    "badge badge-info",
  refunded:   "badge badge-gray",
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
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);

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

  const filtered = activeFilter === "All"
    ? orders
    : orders.filter(o => o.status?.toLowerCase() === activeFilter.toLowerCase());

  const tableData = filtered.map(o => ({
    id: o.id?.slice(0, 8) || "—",
    _id: o.id,
    customer: o.user_name || o.shipping_name || "Unknown",
    product: o.items?.[0]?.product_name || (o.items?.length ? `${o.items.length} items` : "—"),
    amount: fmtAmount(o.total, o.currency),
    status: o.status || "pending",
    date: fmtDate(o.created_at),
  }));

  const columns = [
    { key: "id",       label: "Order ID",  sortable: true },
    { key: "customer", label: "Customer",  sortable: true },
    { key: "product",  label: "Product",   sortable: true },
    { key: "amount",   label: "Amount",    sortable: true },
    {
      key: "status", label: "Status",
      render: val => <span className={STATUS_BADGE[val] || "badge badge-gray"}>{val}</span>,
    },
    { key: "date", label: "Date", sortable: true },
    {
      key: "_id", label: "Actions",
      render: (id, row) => (
        <div className="flex items-center gap-1.5">
          <select
            defaultValue={row.status}
            disabled={updatingId === id}
            onChange={e => handleUpdateStatus(id, e.target.value)}
            className="text-xs border border-surface-200 rounded-lg px-2 py-1 bg-white text-surface-700 cursor-pointer outline-none"
          >
            {["pending","confirmed","processing","shipped","delivered","cancelled"].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title="Orders" />

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
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-surface-400">Loading orders…</div>
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
