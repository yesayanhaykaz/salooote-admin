"use client";
import { Plus, Pencil, Trash2 } from "lucide-react";
import TopBar from "@/components/TopBar";
import DataTable from "@/components/DataTable";

const CATEGORIES = [
  { id: 1, name: "Cakes",       icon: "🎂", products: 28, vendors: 4,  status: "active",   color: "bg-pink-50 border-pink-200" },
  { id: 2, name: "Catering",    icon: "🍽️", products: 15, vendors: 3,  status: "active",   color: "bg-orange-50 border-orange-200" },
  { id: 3, name: "Flowers",     icon: "💐", products: 42, vendors: 6,  status: "active",   color: "bg-rose-50 border-rose-200" },
  { id: 4, name: "Balloons",    icon: "🎈", products: 19, vendors: 2,  status: "active",   color: "bg-blue-50 border-blue-200" },
  { id: 5, name: "Party Props", icon: "🎉", products: 34, vendors: 5,  status: "active",   color: "bg-violet-50 border-violet-200" },
  { id: 6, name: "DJ & Music",  icon: "🎵", products: 8,  vendors: 2,  status: "active",   color: "bg-green-50 border-green-200" },
];

function StatusBadge({ status }) {
  const map = {
    active:   "badge badge-success",
    inactive: "badge badge-gray",
    draft:    "badge badge-warning",
  };
  return <span className={map[status] || "badge badge-gray"}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

export default function CategoriesPage() {
  const tableColumns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-center text-lg">
            {row.icon}
          </div>
          <span className="font-semibold text-surface-800">{val}</span>
        </div>
      ),
    },
    {
      key: "icon",
      label: "Icon",
      render: (val) => <span className="text-2xl">{val}</span>,
    },
    {
      key: "products",
      label: "Products",
      render: (val) => <span className="text-sm font-semibold text-surface-700">{val}</span>,
    },
    {
      key: "vendors",
      label: "Vendors",
      render: (val) => <span className="text-sm font-semibold text-surface-700">{val}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (val) => <StatusBadge status={val} />,
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
        title="Categories"
        actions={
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700 transition-colors cursor-pointer border-0">
            <Plus size={14} />
            Add Category
          </button>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className={`bg-white rounded-xl border-2 ${cat.color} p-5 flex flex-col items-center gap-3 hover:shadow-card transition-shadow group`}
            >
              <div className="text-4xl">{cat.icon}</div>
              <div className="text-center">
                <p className="text-sm font-bold text-surface-800">{cat.name}</p>
                <p className="text-xs text-surface-400 mt-0.5">{cat.products} products</p>
                <p className="text-xs text-surface-300">{cat.vendors} vendors</p>
              </div>
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-400 hover:text-violet-600 hover:bg-violet-50 hover:border-violet-200 transition-colors cursor-pointer bg-white">
                  <Pencil size={12} />
                </button>
                <button className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer bg-white">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div>
          <h2 className="text-sm font-bold text-surface-700 mb-3">All Categories</h2>
          <DataTable
            columns={tableColumns}
            data={CATEGORIES}
            searchKeys={["name", "status"]}
            pageSize={10}
          />
        </div>
      </div>
    </div>
  );
}
