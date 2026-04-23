"use client";
import { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";
import TopBar from "@/components/TopBar";
import DataTable from "@/components/DataTable";
import { adminProductsAPI } from "@/lib/api";

function StatusBadge({ status }) {
  const map = {
    active:    { cls: "badge badge-success", label: "Active" },
    out_stock: { cls: "badge badge-danger",  label: "Out of Stock" },
    draft:     { cls: "badge badge-gray",    label: "Draft" },
  };
  const item = map[status] || { cls: "badge badge-gray", label: status };
  return <span className={item.cls}>{item.label}</span>;
}

function categoryIcon() { return ""; }

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminProductsAPI.list({ limit: 500 })
      .then(res => {
        setProducts(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await adminProductsAPI.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Product",
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0">
            {row.images?.[0] ? (
              <img src={row.images[0]} alt="" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <span className="text-base">{categoryIcon(row.category_name)}</span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-surface-800">{val}</p>
            <p className="text-xs text-surface-400">#{row.id?.slice(0, 8)}</p>
          </div>
        </div>
      ),
    },
    {
      key: "vendor_name",
      label: "Vendor",
      sortable: true,
      render: (val) => <span className="text-surface-600 text-sm">{val || "—"}</span>,
    },
    {
      key: "category_name",
      label: "Category",
      render: (val) => <span className="badge badge-info">{val || "—"}</span>,
    },
    {
      key: "price",
      label: "Price",
      render: (val) => <span className="font-bold text-surface-900">${val}</span>,
    },
    {
      key: "stock_qty",
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
      key: "id",
      label: "Actions",
      render: (id) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleDelete(id)}
            className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer bg-white"
            title="Delete"
          >
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
        subtitle={loading ? "Loading…" : `${products.length} products`}
        actions={
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700 transition-colors cursor-pointer border-0">
            <Plus size={14} /> Add Product
          </button>
        }
      />

      <div className="flex-1 p-6">
        {loading ? (
          <div className="py-16 text-center text-sm text-surface-400">Loading products…</div>
        ) : (
          <DataTable
            columns={columns}
            data={products}
            searchKeys={["name", "vendor_name", "category_name"]}
            pageSize={8}
          />
        )}
      </div>
    </div>
  );
}
