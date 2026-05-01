"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, X, ImageIcon, Package, Globe, Eye, EyeOff } from "lucide-react";
import TopBar from "@/components/TopBar";
import DataTable from "@/components/DataTable";
import { adminCategoriesAPI, uploadAPI } from "@/lib/api";

const COLOR_OPTIONS = [
  "#f43f7a","#f97316","#eab308","#22c55e","#3b82f6",
  "#7c3aed","#ec4899","#14b8a6","#ef4444","#8b5cf6",
];

const LOCALES = [
  { key: "en", label: "EN", full: "English" },
  { key: "hy", label: "HY", full: "Armenian" },
  { key: "ru", label: "RU", full: "Russian" },
];

function slugify(str) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// ─── Standalone Field (must be outside modal to avoid remount on every render) ─
function CatField({ label, value, onChange, placeholder, mono }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-surface-700 mb-1.5">{label}</label>
      <input
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-sm placeholder:text-surface-400 focus:border-primary-500 outline-none transition-colors ${mono ? "font-mono text-surface-500 bg-surface-50" : "text-surface-800"}`}
      />
    </div>
  );
}

function CatTextarea({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-surface-700 mb-1.5">{label}</label>
      <textarea
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-800 placeholder:text-surface-400 focus:border-primary-500 outline-none transition-colors resize-none"
      />
    </div>
  );
}

function ImageUploadZone({ image, onImage }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    onImage(file);
  };

  const preview = image instanceof File ? URL.createObjectURL(image) : image;

  return (
    <div>
      <label className="block text-xs font-semibold text-surface-700 mb-1.5">Category Image</label>
      {preview ? (
        <div className="relative w-full h-28 rounded-xl overflow-hidden border border-surface-200">
          <img src={preview} alt="" className="w-full h-full object-cover" />
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

// ─── Category Modal ────────────────────────────────────────────────────────────
function CategoryModal({ onClose, onSave, parentOptions, initial }) {
  const isEdit = !!initial;

  // Main (EN) form
  const [form, setForm] = useState({
    name:        initial?.name        || "",
    slug:        initial?.slug        || "",
    description: initial?.description || "",
    emoji:       initial?.emoji       || "",
    color_hex:   initial?.color       || "#7c3aed",
    parent_id:   initial?.parent_id   || "",
    status:      initial?.is_active === false ? "inactive" : "active",
    image:       null,
    image_url:   initial?.image_url   || "",
  });

  // Translations (hy, ru)
  const [trans, setTrans] = useState({
    hy: { name: "", slug: "", description: "" },
    ru: { name: "", slug: "", description: "" },
  });

  const [activeLocale, setActiveLocale] = useState("en");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initial?.id) return;
    adminCategoriesAPI.getTranslations(initial.id)
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        const mapped = { hy: { name: "", slug: "", description: "" }, ru: { name: "", slug: "", description: "" } };
        list.forEach(t => {
          if (mapped[t.locale]) mapped[t.locale] = { name: t.name || "", slug: t.slug || "", description: t.description || "" };
        });
        setTrans(mapped);
      })
      .catch(() => {});
  }, [initial?.id]);

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setT = (locale, k, v) => setTrans(p => ({ ...p, [locale]: { ...p[locale], [k]: v } }));

  const handleNameChange = (val) => {
    setF("name", val);
    if (!isEdit) setF("slug", slugify(val));
  };

  // Auto-fill translated slug from name
  const handleTransName = (locale, val) => {
    setT(locale, "name", val);
    if (!trans[locale].slug) setT(locale, "slug", slugify(val));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("English name is required."); return; }
    setSaving(true);
    setError("");
    try {
      // Upload image first if needed
      let imageUrl = form.image_url || undefined;
      if (form.image instanceof File) {
        const uploaded = await uploadAPI.image(form.image, "admin");
        imageUrl = uploaded.data?.url || undefined;
      }

      const payload = {
        name:        form.name,
        slug:        form.slug,
        description: form.description,
        emoji:       form.emoji,
        color:       form.color_hex,
        is_active:   form.status === "active",
        ...(form.parent_id ? { parent_id: form.parent_id } : {}),
        image_url: imageUrl || "",
      };

      const saved = await onSave(payload, initial?.id);
      const catId = saved?.id || initial?.id;

      // Upsert translations for hy and ru
      if (catId) {
        for (const locale of ["hy", "ru"]) {
          const t = trans[locale];
          if (t.name.trim() || t.description.trim()) {
            await adminCategoriesAPI.upsertTranslation(catId, {
              locale,
              name:        t.name,
              slug:        t.slug || form.slug,
              description: t.description,
            });
          }
        }
      }

      onClose();
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-surface-900">{isEdit ? "Edit Category" : "Add Category"}</h2>
            <p className="text-xs text-surface-400 mt-0.5">Fields marked with language flags support translations</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:bg-surface-100 cursor-pointer border-0 bg-transparent">
            <X size={16} />
          </button>
        </div>

        {/* Language tabs */}
        <div className="flex items-center gap-1 px-6 pt-4 flex-shrink-0">
          {LOCALES.map(l => (
            <button key={l.key} onClick={() => setActiveLocale(l.key)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold cursor-pointer border-none transition-colors ${
                activeLocale === l.key ? "bg-primary-600 text-white" : "bg-surface-100 text-surface-600 hover:bg-surface-200"
              }`}
            >
              <Globe size={12} />
              {l.full}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ── English (main) ── */}
          {activeLocale === "en" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <CatField label="Category Name (EN) *" value={form.name} onChange={handleNameChange} placeholder="e.g. Wedding Cakes" />
                <CatField label="Slug" value={form.slug} onChange={v => setF("slug", v)} placeholder="wedding-cakes" mono />
              </div>

              <CatTextarea label="Description (EN)" value={form.description} onChange={v => setF("description", v)} placeholder="Brief description of this category…" />

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-2">Brand Color</label>
                <div className="flex items-center gap-3 flex-wrap">
                  {COLOR_OPTIONS.map(c => (
                    <button key={c} onClick={() => setF("color_hex", c)} style={{ backgroundColor: c }}
                      className={`w-8 h-8 rounded-full border-4 transition-all cursor-pointer ${form.color_hex === c ? "border-surface-800 scale-110" : "border-transparent"}`} />
                  ))}
                  <div className="flex items-center gap-2 ml-1">
                    <span className="text-xs text-surface-400">or</span>
                    <input type="color" value={form.color_hex} onChange={e => setF("color_hex", e.target.value)}
                      className="w-8 h-8 rounded-full cursor-pointer border border-surface-200 p-0.5 bg-white" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1.5">Parent Category</label>
                  <select value={form.parent_id} onChange={e => setF("parent_id", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-800 bg-white focus:border-primary-500 outline-none cursor-pointer">
                    <option value="">None (top-level)</option>
                    {parentOptions.map(p => (
                      <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setF("status", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-800 bg-white focus:border-primary-500 outline-none cursor-pointer">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <ImageUploadZone image={form.image || form.image_url} onImage={img => { setF("image", img); if (!img) setF("image_url", ""); }} />
            </>
          )}

          {/* ── Armenian / Russian ── */}
          {(activeLocale === "hy" || activeLocale === "ru") && (
            <>
              <div className="bg-surface-50 border border-surface-200 rounded-xl px-4 py-3">
                <p className="text-xs text-surface-500 flex items-center gap-1.5">
                  <Globe size={11} /> Translations are optional. If left empty, the English version will be used.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CatField
                  label={`Category Name (${activeLocale.toUpperCase()})`}
                  value={trans[activeLocale].name}
                  onChange={v => handleTransName(activeLocale, v)}
                  placeholder={activeLocale === "hy" ? "Հայերեն անուն" : "Название на русском"}
                />
                <CatField
                  label="Slug"
                  value={trans[activeLocale].slug}
                  onChange={v => setT(activeLocale, "slug", v)}
                  placeholder="url-slug"
                  mono
                />
              </div>
              <CatTextarea
                label={`Description (${activeLocale.toUpperCase()})`}
                value={trans[activeLocale].description}
                onChange={v => setT(activeLocale, "description", v)}
                placeholder={activeLocale === "hy" ? "Համառոտ նկարագրություն…" : "Краткое описание…"}
              />
            </>
          )}

          {error && (
            <p className="text-xs text-danger-600 bg-danger-50 border border-danger-200 rounded-xl px-4 py-2">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-surface-100 bg-surface-50/50 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-surface-600 border border-surface-200 bg-white hover:bg-surface-50 transition-colors cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!form.name.trim() || saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700 transition-colors cursor-pointer border-0 disabled:opacity-50">
            <Plus size={14} />
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Category"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { active: "badge badge-success", inactive: "badge badge-gray", draft: "badge badge-warning" };
  const label = status === true || status === "active" ? "Active" : "Inactive";
  const cls = status === true || status === "active" ? map.active : map.inactive;
  return <span className={cls}>{label}</span>;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [showOnlyTopLevel, setShowOnlyTopLevel] = useState(false);

  const fetchCategories = () => {
    adminCategoriesAPI.list()
      .then(res => { setCategories(res.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async (payload) => {
    const res = await adminCategoriesAPI.create(payload);
    setCategories(prev => [...prev, res.data]);
    return res.data;
  };

  const handleEdit = async (payload, id) => {
    const res = await adminCategoriesAPI.update(id, payload);
    setCategories(prev => prev.map(c => c.id === id ? res.data : c));
    return res.data;
  };

  const handleDelete = async (id) => {
    try {
      await adminCategoriesAPI.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (e) { console.error(e); }
  };

  const displayedCategories = showOnlyTopLevel
    ? categories.filter(c => !c.parent_id)
    : categories;

  const handleToggleVisible = async (cat) => {
    const newVal = !cat.is_visible;
    try {
      await adminCategoriesAPI.setVisible(cat.id, newVal);
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, is_visible: newVal } : c));
    } catch (e) { console.error(e); }
  };

  const tableColumns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          {/* Image or emoji icon */}
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-surface-200">
            {row.image_url ? (
              <img src={row.image_url} alt={val} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-surface-50 flex items-center justify-center text-lg">
                {row.emoji || <Package size={18} className="text-surface-400" />}
              </div>
            )}
          </div>
          <div>
            <span className="font-semibold text-surface-800 block">{val}</span>
            <span className="text-[10px] text-surface-400">{row.slug}</span>
          </div>
        </div>
      ),
    },
    {
      key: "product_count",
      label: "Products",
      render: (val) => <span className="text-sm font-semibold text-surface-700">{val || 0}</span>,
    },
    {
      key: "vendor_count",
      label: "Vendors",
      render: (val) => <span className="text-sm font-semibold text-surface-700">{val || 0}</span>,
    },
    {
      key: "color",
      label: "Color",
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border border-surface-200" style={{ backgroundColor: val || "#ccc" }} />
          <span className="text-xs text-surface-400 font-mono">{val || "—"}</span>
        </div>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: "is_visible",
      label: "Visible",
      render: (val, row) => (
        <button
          onClick={() => handleToggleVisible(row)}
          title={val === false ? "Show on website" : "Hide from website"}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
            val === false
              ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
              : "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
          }`}
        >
          {val === false ? <><EyeOff size={11} /> Hidden</> : <><Eye size={11} /> Visible</>}
        </button>
      ),
    },
    {
      key: "id",
      label: "Actions",
      render: (id, row) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => setEditCat(row)}
            className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 transition-colors cursor-pointer bg-white" title="Edit">
            <Pencil size={13} />
          </button>
          <button onClick={() => handleDelete(id)}
            className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer bg-white" title="Delete">
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOnlyTopLevel(v => !v)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${
                  showOnlyTopLevel
                    ? "bg-primary-50 text-primary-700 border-primary-300 hover:bg-primary-100"
                    : "bg-white text-surface-600 border-surface-200 hover:bg-surface-50"
                }`}
              >
                {showOnlyTopLevel ? "Top-level only" : "All categories"}
              </button>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700 transition-colors cursor-pointer border-0">
                <Plus size={14} /> Add Category
              </button>
            </div>
          }
        />

        <div className="flex-1 p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-sm text-surface-400">Loading categories…</div>
          ) : (
            <>
              {/* Grid cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
                {displayedCategories.map(cat => (
                  <div key={cat.id} className="bg-white rounded-xl border-2 border-surface-100 overflow-hidden hover:shadow-card transition-shadow group relative">
                    {/* Image or emoji header */}
                    {cat.image_url ? (
                      <div className="relative w-full h-24 overflow-hidden">
                        <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        {cat.emoji && (
                          <span className="absolute bottom-2 left-2 text-xl">{cat.emoji}</span>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-20 flex items-center justify-center" style={{ backgroundColor: cat.color ? cat.color + "20" : "#f5f5f5" }}>
                        <span className="text-4xl">{cat.emoji || ""}</span>
                        {!cat.emoji && <Package size={32} className="text-surface-300" />}
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-sm font-bold text-surface-800 truncate">{cat.name}</p>
                      <p className="text-xs text-surface-400 mt-0.5">{cat.product_count || 0} products</p>
                    </div>
                    {/* Visibility indicator */}
                    {cat.is_visible === false && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1"><EyeOff size={9} /> Hidden</span>
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-1.5 pb-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleToggleVisible(cat)}
                        title={cat.is_visible === false ? "Show on website" : "Hide from website"}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer bg-white ${cat.is_visible === false ? "border-amber-300 text-amber-500 hover:bg-amber-50" : "border-surface-200 text-surface-400 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200"}`}>
                        {cat.is_visible === false ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                      <button onClick={() => setEditCat(cat)}
                        className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-400 hover:text-violet-600 hover:bg-violet-50 hover:border-violet-200 transition-colors cursor-pointer bg-white">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => handleDelete(cat.id)}
                        className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer bg-white">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}

                <button onClick={() => setShowModal(true)}
                  className="bg-white rounded-xl border-2 border-dashed border-surface-200 p-5 flex flex-col items-center justify-center gap-2 hover:border-primary-400 hover:bg-primary-50/30 transition-all cursor-pointer text-surface-400 hover:text-primary-600 min-h-[140px]">
                  <div className="w-9 h-9 rounded-full border-2 border-dashed border-current flex items-center justify-center">
                    <Plus size={16} />
                  </div>
                  <span className="text-xs font-medium">New Category</span>
                </button>
              </div>

              {/* Table */}
              <div>
                <h2 className="text-sm font-bold text-surface-700 mb-3">All Categories</h2>
                <DataTable columns={tableColumns} data={displayedCategories} searchKeys={["name", "slug"]} pageSize={10} />
              </div>
            </>
          )}
        </div>
      </div>

      {(showModal || editCat) && (
        <CategoryModal
          onClose={() => { setShowModal(false); setEditCat(null); }}
          onSave={editCat ? handleEdit : handleAdd}
          parentOptions={categories.filter(c => !c.parent_id)}
          initial={editCat}
        />
      )}
    </>
  );
}
