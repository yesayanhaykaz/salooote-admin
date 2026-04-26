"use client";
import { useState, useEffect, useMemo } from "react";
import { Trash2, Plus, Search, Filter, X } from "lucide-react";
import TopBar from "@/components/TopBar";
import DataTable from "@/components/DataTable";
import { adminProductsAPI, adminCategoriesAPI, vendorsAPI } from "@/lib/api";

const STATUS_OPTIONS = [
  { v: "all",       label: "All Status" },
  { v: "active",    label: "Active" },
  { v: "draft",     label: "Draft" },
  { v: "out_stock", label: "Out of Stock" },
];

function StatusBadge({ status }) {
  const map = {
    active:    { cls: "badge badge-success", label: "Active" },
    out_stock: { cls: "badge badge-danger",  label: "Out of Stock" },
    draft:     { cls: "badge badge-gray",    label: "Draft" },
  };
  const item = map[status] || { cls: "badge badge-gray", label: status };
  return <span className={item.cls}>{item.label}</span>;
}

/* Search across all translation fields + main fields */
function productMatches(p, q) {
  if (!q) return true;
  const lower = q.toLowerCase();
  const haystack = [
    p.name,
    p.vendor_name,
    p.category_name,
    p.status,
    p.sku,
    ...(p.translations || []).flatMap(tr => [tr.name, tr.short_description, tr.description]),
    ...(p.tags || []),
  ].filter(Boolean).join(" | ").toLowerCase();
  return haystack.includes(lower);
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [query, setQuery] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterVendor, setFilterVendor] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    Promise.all([
      adminProductsAPI.list({ limit: 500 }).catch(() => null),
      adminCategoriesAPI.list().catch(() => null),
      vendorsAPI.list({ limit: 500 }).catch(() => null),
    ]).then(([prodRes, catRes, vendRes]) => {
      setProducts(prodRes?.data || []);
      setCategories(catRes?.data || []);
      setVendors(vendRes?.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      await adminProductsAPI.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error(e);
      alert("Delete failed: " + (e?.message || "Unknown error"));
    }
  };

  /* ── Filtered products ── */
  const filtered = useMemo(() => {
    return products.filter(p => {
      // Status
      if (filterStatus !== "all" && p.status !== filterStatus) return false;
      // Category
      if (filterCat !== "all") {
        const inCats = (p.category_ids || []).map(String).includes(String(filterCat))
                    || String(p.category_id) === String(filterCat);
        if (!inCats) return false;
      }
      // Vendor
      if (filterVendor !== "all") {
        if (String(p.vendor_id) !== String(filterVendor)) return false;
      }
      // Query (multilingual)
      if (!productMatches(p, query.trim())) return false;
      return true;
    });
  }, [products, query, filterCat, filterVendor, filterStatus]);

  const hasFilters = query || filterCat !== "all" || filterVendor !== "all" || filterStatus !== "all";

  const clearFilters = () => {
    setQuery("");
    setFilterCat("all");
    setFilterVendor("all");
    setFilterStatus("all");
  };

  const columns = [
    {
      key: "name",
      label: "Product",
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {row.thumbnail_url || row.images?.[0]?.url || row.images?.[0] ? (
              <img
                src={row.thumbnail_url || row.images?.[0]?.url || row.images?.[0]}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-surface-800 truncate">{val}</p>
            <p className="text-xs text-surface-400 font-mono">#{row.id?.slice(0, 8)}</p>
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
      render: (val) => val ? <span className="badge badge-info">{val}</span> : <span className="text-surface-400 text-xs">—</span>,
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (val, row) => (
        <span className="font-bold text-surface-900">
          {row.currency || "AMD"} {Number(val || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "stock_qty",
      label: "Stock",
      render: (val) => (
        <span className={`text-sm font-semibold ${val === 0 ? "text-danger-600" : "text-surface-700"}`}>
          {val === 0 ? "Out" : (val ?? "—")}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
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
        subtitle={loading ? "Loading…" : `${filtered.length} of ${products.length} products`}
        actions={
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700 transition-colors cursor-pointer border-0">
            <Plus size={14} /> Add Product
          </button>
        }
      />

      {/* Filter bar */}
      <div className="px-6 pt-4 pb-2 flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-surface-200 w-full sm:w-[300px] gap-2 focus-within:border-primary-400 transition-colors">
          <Search size={14} className="text-surface-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search name, vendor, category, SKU, status…"
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-surface-400"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-surface-400 hover:text-surface-700 transition-colors cursor-pointer border-none bg-transparent"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <Filter size={14} className="text-surface-400 ml-auto sm:ml-0" />

        {/* Category */}
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-1.5 border border-surface-200 rounded-lg text-sm bg-white outline-none cursor-pointer text-surface-700 focus:border-primary-400"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.emoji ? `${c.emoji} ` : ""}{c.name}
            </option>
          ))}
        </select>

        {/* Vendor */}
        <select
          value={filterVendor}
          onChange={e => setFilterVendor(e.target.value)}
          className="px-3 py-1.5 border border-surface-200 rounded-lg text-sm bg-white outline-none cursor-pointer text-surface-700 focus:border-primary-400 max-w-[200px]"
        >
          <option value="all">All Vendors</option>
          {vendors.map(v => (
            <option key={v.id} value={v.id}>{v.business_name || v.name}</option>
          ))}
        </select>

        {/* Status */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 border border-surface-200 rounded-lg text-sm bg-white outline-none cursor-pointer text-surface-700 focus:border-primary-400"
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s.v} value={s.v}>{s.label}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-primary-600 hover:underline font-semibold cursor-pointer border-none bg-transparent"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="flex-1 p-6">
        {loading ? (
          <div className="py-16 text-center text-sm text-surface-400">Loading products…</div>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            // Disable internal search since we filter externally with multilingual
            searchable={false}
            pageSize={10}
          />
        )}
      </div>
    </div>
  );
}
