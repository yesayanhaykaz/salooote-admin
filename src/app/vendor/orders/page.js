"use client";
import { useState } from "react";
import { Eye, RefreshCw } from "lucide-react";
import TopBar from "@/components/TopBar";
import DataTable from "@/components/DataTable";
import { SAMPLE_ORDERS } from "@/lib/data";

const STATUS_FILTERS = ["All", "Pending", "Processing", "Delivered", "Cancelled"];

const STATUS_BADGE = {
  delivered:  "badge badge-success",
  pending:    "badge badge-warning",
  processing: "badge badge-info",
  cancelled:  "badge badge-danger",
};

const columns = [
  { key: "id",       label: "Order ID",  sortable: true },
  { key: "customer", label: "Customer",  sortable: true },
  { key: "product",  label: "Product",   sortable: true },
  { key: "amount",   label: "Amount",    sortable: true },
  {
    key: "status", label: "Status",
    render: val => <span className={STATUS_BADGE[val]}>{val}</span>,
  },
  { key: "date", label: "Date", sortable: true },
  {
    key: "id", label: "Actions",
    render: (_, row) => (
      <div className="flex items-center gap-1.5">
        <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer border-none">
          <Eye size={12} /> View
        </button>
        <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-surface-600 bg-surface-100 rounded-lg hover:bg-surface-200 transition-colors cursor-pointer border-none">
          <RefreshCw size={12} /> Update
        </button>
      </div>
    ),
  },
];

export default function VendorOrders() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = activeFilter === "All"
    ? SAMPLE_ORDERS
    : SAMPLE_ORDERS.filter(o => o.status.toLowerCase() === activeFilter.toLowerCase());

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

        <DataTable
          columns={columns}
          data={filtered}
          searchable
          searchKeys={["id", "customer", "product", "status"]}
          pageSize={8}
        />
      </main>
    </div>
  );
}
