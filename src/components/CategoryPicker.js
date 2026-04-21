"use client";
import { useState, useEffect } from "react";
import { Check, Search, Tag, X } from "lucide-react";
import { adminCategoriesAPI } from "@/lib/api";

/**
 * CategoryPicker
 *
 * Props:
 *   selected   — string[]  array of selected category IDs
 *   onChange   — (ids: string[]) => void
 *   disabled   — boolean (optional)
 */
export default function CategoryPicker({ selected = [], onChange, disabled = false }) {
  const [allCats, setAllCats]   = useState([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    adminCategoriesAPI.list()
      .then(res => {
        const flat = flattenCategories(res?.data || []);
        setAllCats(flat);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function flattenCategories(cats, depth = 0) {
    const result = [];
    for (const c of cats) {
      result.push({ ...c, depth });
      if (c.children?.length) {
        result.push(...flattenCategories(c.children, depth + 1));
      }
    }
    return result;
  }

  function toggle(id) {
    if (disabled) return;
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  function removeTag(id) {
    if (disabled) return;
    onChange(selected.filter(s => s !== id));
  }

  const filtered = allCats.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCats = allCats.filter(c => selected.includes(c.id));

  return (
    <div className="space-y-3">
      {/* Selected tags */}
      {selectedCats.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCats.map(cat => (
            <span key={cat.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 border border-primary-200 text-xs font-semibold text-primary-700"
            >
              {cat.emoji ? <span>{cat.emoji}</span> : <Tag size={10} />}
              {cat.name}
              {!disabled && (
                <button
                  onClick={() => removeTag(cat.id)}
                  className="ml-0.5 text-primary-400 hover:text-primary-700 cursor-pointer border-none bg-transparent p-0 leading-none"
                >
                  <X size={10} />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="flex items-center bg-surface-50 rounded-lg px-3 py-2 border border-surface-200 gap-2 focus-within:border-primary-400 transition-colors">
        <Search size={13} className="text-surface-400 flex-shrink-0" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search categories…"
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-surface-400 disabled:opacity-50"
        />
      </div>

      {/* Category grid */}
      {loading ? (
        <p className="text-xs text-surface-400 py-4 text-center">Loading categories…</p>
      ) : filtered.length === 0 ? (
        <p className="text-xs text-surface-400 py-4 text-center">No categories found</p>
      ) : (
        <div className="max-h-56 overflow-y-auto rounded-xl border border-surface-200 divide-y divide-surface-100">
          {filtered.map(cat => {
            const isSelected = selected.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggle(cat.id)}
                disabled={disabled}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer border-none
                  ${isSelected
                    ? "bg-primary-50 text-primary-700"
                    : "bg-white text-surface-700 hover:bg-surface-50"}
                  ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                `}
                style={{ paddingLeft: `${(cat.depth || 0) * 16 + 16}px` }}
              >
                {cat.emoji ? (
                  <span className="text-base leading-none w-5 text-center flex-shrink-0">{cat.emoji}</span>
                ) : (
                  <Tag size={13} className={isSelected ? "text-primary-500" : "text-surface-400"} />
                )}
                <span className="flex-1 text-sm font-medium">{cat.name}</span>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                    <Check size={9} className="text-white" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-surface-400">
        {selected.length === 0
          ? "No categories selected — select as many as apply to your business."
          : `${selected.length} categor${selected.length === 1 ? "y" : "ies"} selected`}
      </p>
    </div>
  );
}
