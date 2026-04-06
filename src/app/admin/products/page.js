"use client";
import { Pencil, Trash2, Plus } from "lucide-react";
import TopBar from "@/components/TopBar";
import DataTable from "@/components/DataTable";
import { SAMPLE_PRODUCTS } from "@/lib/data";

function StatusBadge({ status }) {
  const map = {
    active:    { cls: "badge badge-success", label: "Active" },
    out_stock: { cls: "badge badge-danger",  label: "Out of Stock" },
    draft:     { cls: "badge badge-gray",    label: "Draft" },
  };
  const item = map[status] || { cls: "badge badge-gray", label: status };
  return <span className={item.cls}>{item.label}</span>;
}

export default function ProductsPage() {
  const columns = [
    {
      key: "name",
      label: "Product",
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0">
            <span className="text-base">
              {row.category === "Cakes"    ? "🎂" :
               row.category === "Flowers"  ? "💐" :
               row.category === "Decor"    ? "🎈" :
               row.category === "Music"    ? "🎵" :
               row.category === "Catering" ? "🍽️" : "📦"}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-surface-800">{val}</p>
            <p className="text-xs text-surface-400">#{row.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "vendor",
      label: "Vendor",
      sortable: true,
      render: (val) => <span className="text-surface-600 text-sm">{val}</span>,
    },
    {
      key: "category",
      label: "Category",
      render: (val) => <span className="badge badge-info">{val}</span>,
    },
    {
      key: "price",
      label: "Price",
      render: (val) => <span className="font-bold text-surface-900">{val}</span>,
    },
    {
      key: "stock",
      label: "Stock",
      render: (val) => (
        <span className={`text-sm font-semibold ${val === 0 ? "text-danger-600" : "text-surface-700"}`}>
          {val === 0 ? "Out" : val}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: "sales",
      label: "Sales",
      render: (val) => (
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-surface-700">{val}</span>
          <div className="w-16 h-1.5 bg-surface-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-400 rounded-full"
              style={{ width: `${Math.min(100, (val / 140) * 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "id",
      label: "Actions",
      render: () => (
        <div className="flex items-center gap-1.5">
          <button className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 transition-colors cursor-pointer bg-white" title="Edit">
            <Pencil size={13} />
          </button>
          <button className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer bg-white" title="Delete">
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        title="Products"
        actions={
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700 transition-colors cursor-pointer border-0">
            <Plus size={14} />
            Add Product
          </button>
        }
      />

      <div className="flex-1 p-6">
        <DataTable
          columns={columns}
          data={SAMPLE_PRODUCTS}
          searchKeys={["name", "vendor", "category"]}
          pageSize={8}
        />
      </div>
    </div>
  );
}
