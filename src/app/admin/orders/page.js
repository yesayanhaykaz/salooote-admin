"use client";
import { useState } from "react";
import { Eye } from "lucide-react";
import TopBar from "@/components/TopBar";
import DataTable from "@/components/DataTable";
import { SAMPLE_ORDERS } from "@/lib/data";

const STATUS_PILLS = [
  { key: "all",        label: "All" },
  { key: "pending",    label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "delivered",  label: "Delivered" },
  { key: "cancelled",  label: "Cancelled" },
];

function StatusBadge({ status }) {
  const map = {
    delivered:  "badge badge-success",
    pending:    "badge badge-warning",
    processing: "badge badge-info",
    cancelled:  "badge badge-danger",
  };
  return (
    <span className={map[status] || "badge badge-gray"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function OrdersPage() {
  const [activeStatus, setActiveStatus] = useState("all");
  const [dateFrom, setDateFrom]         = useState("");
  const [dateTo, setDateTo]             = useState("");

  const filteredOrders = SAMPLE_ORDERS.filter((o) => {
    if (activeStatus !== "all" && o.status !== activeStatus) return false;
    return true;
  });

  const getCounts = (key) => {
    if (key === "all") return SAMPLE_ORDERS.length;
    return SAMPLE_ORDERS.filter(o => o.status === key).length;
  };

  const columns = [
    {
      key: "id",
      label: "Order ID",
      sortable: true,
      render: (val) => <span className="text-sm font-bold text-primary-600">{val}</span>,
    },
    {
      key: "customer",
      label: "Customer",
      sortable: true,
      render: (val) => <span className="font-medium text-surface-800">{val}</span>,
    },
    {
      key: "vendor",
      label: "Vendor",
      render: (val) => <span className="text-surface-600">{val}</span>,
    },
    {
      key: "product",
      label: "Product",
      render: (val) => <span className="text-surface-600">{val}</span>,
    },
    {
      key: "amount",
      label: "Amount",
      render: (val) => <span className="font-bold text-surface-900">{val}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: "date",
      label: "Date",
      render: (val) => <span className="text-xs text-surface-400">{val}</span>,
    },
    {
      key: "id",
      label: "Actions",
      render: () => (
        <button className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer bg-white" title="View Details">
          <Eye size={13} />
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Orders" />

      <div className="flex-1 p-6 space-y-5">
        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Pills */}
          <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-xl p-1.5">
            {STATUS_PILLS.map((pill) => (
              <button
                key={pill.key}
                onClick={() => setActiveStatus(pill.key)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer border-0 ${
                  activeStatus === pill.key
                    ? "bg-primary-600 text-white"
                    : "text-surface-500 hover:text-surface-800 hover:bg-surface-50 bg-transparent"
                }`}
              >
                {pill.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeStatus === pill.key ? "bg-white/20 text-white" : "bg-surface-100 text-surface-500"
                }`}>
                  {getCounts(pill.key)}
                </span>
              </button>
            ))}
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-xs font-semibold text-surface-400 whitespace-nowrap">Date range:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 rounded-lg border border-surface-200 text-sm text-surface-700 bg-white focus:ring-0 cursor-pointer"
            />
            <span className="text-surface-300 text-sm">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 rounded-lg border border-surface-200 text-sm text-surface-700 bg-white focus:ring-0 cursor-pointer"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredOrders}
          searchKeys={["id", "customer", "vendor", "product"]}
          pageSize={8}
        />
      </div>
    </div>
  );
}
