"use client";
import { useState } from "react";
import { Plus, LayoutGrid, List, Pencil, Trash2 } from "lucide-react";
import TopBar from "@/components/TopBar";
import DataTable from "@/components/DataTable";
import { SAMPLE_PRODUCTS } from "@/lib/data";

const GRADIENT_COLORS = [
  "from-pink-400 to-rose-500",
  "from-violet-400 to-purple-500",
  "from-blue-400 to-indigo-500",
  "from-emerald-400 to-green-500",
  "from-orange-400 to-amber-500",
  "from-teal-400 to-cyan-500",
  "from-fuchsia-400 to-pink-500",
  "from-sky-400 to-blue-500",
];

const STATUS_BADGE = {
  active:    "badge badge-success",
  out_stock: "badge badge-danger",
  draft:     "badge badge-gray",
};

const listColumns = [
  {
    key: "name", label: "Product", sortable: true,
    render: (val, row) => (
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${GRADIENT_COLORS[row.id % GRADIENT_COLORS.length]} flex-shrink-0`} />
        <span className="font-medium text-surface-800">{val}</span>
      </div>
    ),
  },
  { key: "category", label: "Category", sortable: true },
  { key: "price",    label: "Price",    sortable: true },
  { key: "stock",    label: "Stock",    sortable: true },
  { key: "sales",    label: "Sales",    sortable: true },
  {
    key: "status", label: "Status",
    render: val => <span className={STATUS_BADGE[val] || "badge badge-gray"}>{val.replace("_", " ")}</span>,
  },
  {
    key: "id", label: "Actions",
    render: () => (
      <div className="flex items-center gap-1.5">
        <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer border-none">
          <Pencil size={12} /> Edit
        </button>
        <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-danger-600 bg-danger-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer border-none">
          <Trash2 size={12} /> Delete
        </button>
      </div>
    ),
  },
];

export default function VendorProducts() {
  const [view, setView] = useState("grid");

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar
        title="My Products"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-surface-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setView("grid")}
                className={`w-8 h-8 flex items-center justify-center transition-colors cursor-pointer border-none ${view === "grid" ? "bg-primary-600 text-white" : "text-surface-500 hover:bg-surface-50"}`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setView("list")}
                className={`w-8 h-8 flex items-center justify-center transition-colors cursor-pointer border-none ${view === "list" ? "bg-primary-600 text-white" : "text-surface-500 hover:bg-surface-50"}`}
              >
                <List size={15} />
              </button>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none">
              <Plus size={15} /> Add Product
            </button>
          </div>
        }
      />

      <main className="flex-1 p-6">
        {view === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {SAMPLE_PRODUCTS.map((product, i) => (
              <div key={product.id} className="bg-white rounded-xl border border-surface-200 overflow-hidden hover:shadow-elevated transition-shadow fade-in">
                {/* Image Placeholder */}
                <div className={`h-36 bg-gradient-to-br ${GRADIENT_COLORS[i % GRADIENT_COLORS.length]} flex items-center justify-center`}>
                  <span className="text-white text-3xl font-bold opacity-40">{product.name.charAt(0)}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-semibold text-surface-900 leading-tight">{product.name}</p>
                    <span className={`${STATUS_BADGE[product.status] || "badge badge-gray"} flex-shrink-0`}>{product.status.replace("_", " ")}</span>
                  </div>
                  <p className="text-base font-bold text-primary-600 mb-1">{product.price}</p>
                  <p className="text-xs text-surface-400 mb-4">Stock: {product.stock} &bull; {product.sales} sales</p>
                  <div className="flex items-center gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer border-none">
                      <Pencil size={12} /> Edit
                    </button>
                    <button className="flex items-center justify-center w-8 h-7 text-danger-500 bg-danger-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer border-none">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DataTable
            columns={listColumns}
            data={SAMPLE_PRODUCTS}
            searchable
            searchKeys={["name", "category", "status"]}
            pageSize={8}
          />
        )}
      </main>
    </div>
  );
}
