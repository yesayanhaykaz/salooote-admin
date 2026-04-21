"use client";
import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { useLocale } from "@/lib/i18n";

export default function DataTable({ columns, data, pageSize = 8, searchable = true, searchKeys = [] }) {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const filtered = data.filter(row =>
    !query || searchKeys.some(k => String(row[k] || "").toLowerCase().includes(query.toLowerCase()))
  );

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = String(a[sortKey] || ""), bv = String(b[sortKey] || "");
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      })
    : filtered;

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  return (
    <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
      {searchable && (
        <div className="px-5 py-4 border-b border-surface-100 flex items-center gap-3">
          <div className="flex items-center bg-surface-50 rounded-lg px-3 py-2 border border-surface-200 w-[260px] gap-2 focus-within:border-primary-400 transition-colors">
            <Search size={14} className="text-surface-400" />
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setPage(1); }}
              placeholder={t("table.search_placeholder")}
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-surface-400"
            />
          </div>
          <span className="text-xs text-surface-400 ml-auto">{filtered.length} {t("table.results")}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-100 bg-surface-50">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide whitespace-nowrap ${col.sortable ? "cursor-pointer hover:text-surface-800 select-none" : ""}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-5 py-12 text-center text-sm text-surface-400">{t("table.no_results")}</td></tr>
            ) : paginated.map((row, i) => (
              <tr key={i} className="table-row border-b border-surface-50 last:border-0 transition-colors">
                {columns.map(col => (
                  <td key={col.key} className="px-5 py-3.5 text-sm text-surface-700 whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-5 py-3.5 border-t border-surface-100 flex items-center justify-between">
          <span className="text-xs text-surface-400">
            {t("table.page")} {page} {t("table.of")} {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-7 h-7 rounded-lg flex items-center justify-center border border-surface-200 text-surface-500 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white cursor-pointer"
            >
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    page === p
                      ? "bg-primary-600 text-white border-primary-600"
                      : "border-surface-200 text-surface-600 hover:bg-surface-50 bg-white"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-7 h-7 rounded-lg flex items-center justify-center border border-surface-200 text-surface-500 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-white cursor-pointer"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
