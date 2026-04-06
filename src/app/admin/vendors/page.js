"use client";
import { Store, Clock, AlertTriangle, DollarSign, Eye, CheckCircle, XCircle, Download, UserPlus, Star } from "lucide-react";
import TopBar from "@/components/TopBar";
import StatsCard from "@/components/StatsCard";
import DataTable from "@/components/DataTable";
import { SAMPLE_VENDORS } from "@/lib/data";

const VENDOR_COLORS = [
  "bg-pink-500", "bg-violet-500", "bg-blue-500", "bg-green-500",
  "bg-orange-500", "bg-teal-500",
];

function StatusBadge({ status }) {
  const map = {
    active:    "badge badge-success",
    pending:   "badge badge-warning",
    suspended: "badge badge-danger",
  };
  return (
    <span className={map[status] || "badge badge-gray"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function StarRating({ rating }) {
  if (!rating) return <span className="text-xs text-surface-300">No rating</span>;
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={12}
            className={star <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-surface-200 fill-surface-200"}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-surface-600">{rating}</span>
    </div>
  );
}

export default function VendorsPage() {
  const totalVendors   = SAMPLE_VENDORS.length;
  const pendingCount   = SAMPLE_VENDORS.filter(v => v.status === "pending").length;
  const suspendedCount = SAMPLE_VENDORS.filter(v => v.status === "suspended").length;

  const columns = [
    {
      key: "name",
      label: "Vendor",
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${VENDOR_COLORS[row.id % VENDOR_COLORS.length]} flex items-center justify-center flex-shrink-0`}>
            <span className="text-sm font-bold text-white">{val.charAt(0)}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-surface-800">{val}</p>
            <p className="text-xs text-surface-400">ID #{row.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (val) => <span className="text-sm text-surface-600">{val}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: "rating",
      label: "Rating",
      render: (val) => <StarRating rating={val} />,
    },
    {
      key: "products",
      label: "Products",
      render: (val) => <span className="text-sm font-semibold text-surface-700">{val}</span>,
    },
    {
      key: "revenue",
      label: "Revenue",
      render: (val) => <span className="text-sm font-bold text-surface-900">{val}</span>,
    },
    {
      key: "joined",
      label: "Joined",
      render: (val) => <span className="text-xs text-surface-400">{val}</span>,
    },
    {
      key: "id",
      label: "Actions",
      render: (val, row) => (
        <div className="flex items-center gap-1.5">
          <button className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer bg-white" title="View">
            <Eye size={13} />
          </button>
          {row.status === "pending" && (
            <button className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors cursor-pointer bg-white" title="Approve">
              <CheckCircle size={13} />
            </button>
          )}
          {row.status === "active" && (
            <button className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer bg-white" title="Suspend">
              <XCircle size={13} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        title="Vendors"
        actions={
          <>
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-surface-200 text-sm font-semibold text-surface-600 hover:bg-surface-50 transition-colors cursor-pointer bg-white">
              <Download size={14} />
              Export
            </button>
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700 transition-colors cursor-pointer border-0">
              <UserPlus size={14} />
              Add Vendor
            </button>
          </>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard
            label="Total Vendors"
            value={String(totalVendors)}
            icon={Store}
            iconBg="bg-violet-50"
            iconColor="text-violet-500"
          />
          <StatsCard
            label="Pending Approval"
            value={String(pendingCount)}
            icon={Clock}
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
          />
          <StatsCard
            label="Suspended"
            value={String(suspendedCount)}
            icon={AlertTriangle}
            iconBg="bg-red-50"
            iconColor="text-red-500"
          />
          <StatsCard
            label="This Month Revenue"
            value="$14,200"
            change={6.8}
            changeLabel="vs last month"
            icon={DollarSign}
            iconBg="bg-green-50"
            iconColor="text-green-500"
          />
        </div>

        <DataTable
          columns={columns}
          data={SAMPLE_VENDORS}
          searchKeys={["name", "category", "status"]}
          pageSize={8}
        />
      </div>
    </div>
  );
}
