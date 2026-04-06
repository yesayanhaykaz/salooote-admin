"use client";
import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, X, Upload, ImageIcon } from "lucide-react";
import TopBar from "@/components/TopBar";
import DataTable from "@/components/DataTable";

const INITIAL_CATEGORIES = [
  { id: 1, name: "Cakes",       slug: "cakes",       icon: "🎂", products: 28, vendors: 4,  status: "active",   color: "bg-pink-50 border-pink-200",   colorHex: "#f43f7a", parent: null },
  { id: 2, name: "Catering",    slug: "catering",    icon: "🍽️", products: 15, vendors: 3,  status: "active",   color: "bg-orange-50 border-orange-200", colorHex: "#f97316", parent: null },
  { id: 3, name: "Flowers",     slug: "flowers",     icon: "💐", products: 42, vendors: 6,  status: "active",   color: "bg-rose-50 border-rose-200",    colorHex: "#f43f7a", parent: null },
  { id: 4, name: "Balloons",    slug: "balloons",    icon: "🎈", products: 19, vendors: 2,  status: "active",   color: "bg-blue-50 border-blue-200",    colorHex: "#3b82f6", parent: null },
  { id: 5, name: "Party Props", slug: "party-props", icon: "🎉", products: 34, vendors: 5,  status: "active",   color: "bg-violet-50 border-violet-200",colorHex: "#7c3aed", parent: null },
  { id: 6, name: "DJ & Music",  slug: "dj-music",   icon: "🎵", products: 8,  vendors: 2,  status: "active",   color: "bg-green-50 border-green-200",  colorHex: "#22c55e", parent: null },
];

const ICON_OPTIONS = ["🎂","🍽️","💐","🎈","🎉","🎵","🎁","🎀","🍰","🥂","📸","🎭","🌸","🍷","🎪","🎠","🪄","💍","🎓","🏆"];
const COLOR_OPTIONS = ["#f43f7a","#f97316","#eab308","#22c55e","#3b82f6","#7c3aed","#ec4899","#14b8a6","#ef4444","#8b5cf6"];

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function ImageUploadZone({ image, onImage }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    onImage(URL.createObjectURL(file));
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-surface-700 mb-1.5">Category Image</label>
      {image ? (
        <div className="relative w-full h-28 rounded-xl overflow-hidden border border-surface-200">
          <img src={image} alt="" className="w-full h-full object-cover" />
          <button
            onClick={() => onImage(null)}
            className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 cursor-pointer border-0"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          className={`w-full h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
            dragging ? "border-primary-400 bg-primary-50" : "border-surface-200 bg-surface-50 hover:border-primary-300 hover:bg-primary-50/40"
          }`}
        >
          <ImageIcon size={22} className="text-surface-300" />
          <p className="text-xs text-surface-400">Click or drag image here</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
    </div>
  );
}

function AddCategoryModal({ onClose, onAdd, parentOptions }) {
  const [form, setForm] = useState({
    name: "", slug: "", description: "", icon: "🎁", colorHex: "#7c3aed",
    parent: "", status: "active", image: null,
  });

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleNameChange = (val) => {
    set("name", val);
    set("slug", slugify(val));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onAdd(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <div>
            <h2 className="text-base font-bold text-surface-900">Add Category</h2>
            <p className="text-xs text-surface-400 mt-0.5">Create a new product/service category</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:bg-surface-100 hover:text-surface-700 cursor-pointer border-0 bg-transparent">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Name & Slug */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">Category Name *</label>
              <input
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Wedding Cakes"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-800 placeholder:text-surface-400 focus:border-primary-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="wedding-cakes"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-500 placeholder:text-surface-400 focus:border-primary-500 outline-none transition-colors bg-surface-50"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Brief description of this category…"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-800 placeholder:text-surface-400 focus:border-primary-500 outline-none transition-colors resize-none"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((ico) => (
                <button
                  key={ico}
                  onClick={() => set("icon", ico)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all cursor-pointer ${
                    form.icon === ico ? "border-primary-500 bg-primary-50" : "border-surface-200 bg-white hover:border-primary-300"
                  }`}
                >
                  {ico}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-2">Brand Color</label>
            <div className="flex items-center gap-3 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => set("colorHex", c)}
                  style={{ backgroundColor: c }}
                  className={`w-8 h-8 rounded-full border-4 transition-all cursor-pointer ${form.colorHex === c ? "border-surface-800 scale-110" : "border-transparent"}`}
                />
              ))}
              <div className="flex items-center gap-2 ml-1">
                <span className="text-xs text-surface-400">or</span>
                <input
                  type="color"
                  value={form.colorHex}
                  onChange={(e) => set("colorHex", e.target.value)}
                  className="w-8 h-8 rounded-full cursor-pointer border border-surface-200 p-0.5 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Parent Category & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">Parent Category</label>
              <select
                value={form.parent}
                onChange={(e) => set("parent", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-800 bg-white focus:border-primary-500 outline-none transition-colors cursor-pointer"
              >
                <option value="">None (top-level)</option>
                {parentOptions.map((p) => (
                  <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-800 bg-white focus:border-primary-500 outline-none transition-colors cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <ImageUploadZone image={form.image} onImage={(img) => set("image", img)} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-surface-100 bg-surface-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-surface-600 border border-surface-200 bg-white hover:bg-surface-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.name.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700 transition-colors cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
            Add Category
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    active:   "badge badge-success",
    inactive: "badge badge-gray",
    draft:    "badge badge-warning",
  };
  return <span className={map[status] || "badge badge-gray"}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [showModal, setShowModal] = useState(false);

  const handleAdd = (form) => {
    const newCat = {
      id: Date.now(),
      name: form.name,
      slug: form.slug,
      icon: form.icon,
      products: 0,
      vendors: 0,
      status: form.status,
      color: "bg-violet-50 border-violet-200",
      colorHex: form.colorHex,
      parent: form.parent || null,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const handleDelete = (id) => setCategories((prev) => prev.filter((c) => c.id !== id));

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
          <div>
            <span className="font-semibold text-surface-800 block">{val}</span>
            <span className="text-[10px] text-surface-400">{row.slug}</span>
          </div>
        </div>
      ),
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
      key: "colorHex",
      label: "Color",
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border border-surface-200" style={{ backgroundColor: val }} />
          <span className="text-xs text-surface-400 font-mono">{val}</span>
        </div>
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
          <button className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 transition-colors cursor-pointer bg-white" title="Edit">
            <Pencil size={13} />
          </button>
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
    <>
      <div className="flex flex-col flex-1">
        <TopBar
          title="Categories"
          actions={
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700 transition-colors cursor-pointer border-0"
            >
              <Plus size={14} />
              Add Category
            </button>
          }
        />

        <div className="flex-1 p-6 space-y-6">
          {/* Category Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
            {categories.map((cat) => (
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
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer bg-white"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}

            {/* Add placeholder */}
            <button
              onClick={() => setShowModal(true)}
              className="bg-white rounded-xl border-2 border-dashed border-surface-200 p-5 flex flex-col items-center justify-center gap-2 hover:border-primary-400 hover:bg-primary-50/30 transition-all cursor-pointer text-surface-400 hover:text-primary-600 min-h-[140px]"
            >
              <div className="w-9 h-9 rounded-full border-2 border-dashed border-current flex items-center justify-center">
                <Plus size={16} />
              </div>
              <span className="text-xs font-medium">New Category</span>
            </button>
          </div>

          {/* Table */}
          <div>
            <h2 className="text-sm font-bold text-surface-700 mb-3">All Categories</h2>
            <DataTable
              columns={tableColumns}
              data={categories}
              searchKeys={["name", "slug", "status"]}
              pageSize={10}
            />
          </div>
        </div>
      </div>

      {showModal && (
        <AddCategoryModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
          parentOptions={categories}
        />
      )}
    </>
  );
}
