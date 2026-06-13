"use client";
import { useState, useEffect } from "react";
import { Film, Trash2, Heart, PlayCircle, Eye, EyeOff, Loader2, Search } from "lucide-react";
import TopBar from "@/components/TopBar";
import { adminReelsAPI } from "@/lib/api";

const STATUS_BADGE = {
  draft:     "badge badge-gray",
  published: "badge badge-success",
};

function ReelCard({ reel, onSetStatus, onDelete }) {
  const [busy, setBusy] = useState(false);

  async function toggleStatus() {
    setBusy(true);
    try {
      const next = reel.status === "published" ? "draft" : "published";
      await onSetStatus(reel.id, next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden flex flex-col">
      <div className="relative bg-surface-100 aspect-[9/16] max-h-56 flex items-center justify-center overflow-hidden">
        {reel.thumbnail_url ? (
          <img src={reel.thumbnail_url} alt={reel.title} className="w-full h-full object-cover" />
        ) : reel.video_url ? (
          <video src={reel.video_url} className="w-full h-full object-cover" muted preload="metadata" />
        ) : (
          <Film size={36} className="text-surface-300" />
        )}
        <span className={`absolute top-2 left-2 ${STATUS_BADGE[reel.status] || "badge badge-gray"} text-[10px]`}>
          {reel.status}
        </span>
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <p className="font-semibold text-xs text-surface-900 line-clamp-1">{reel.title}</p>
          {reel.vendor_name && (
            <p className="text-[11px] text-surface-500 mt-0.5">by {reel.vendor_name}</p>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-surface-400">
          <span className="flex items-center gap-1"><Heart size={11} /> {reel.like_count ?? 0}</span>
          <span className="flex items-center gap-1"><PlayCircle size={11} /> {reel.view_count ?? 0}</span>
        </div>

        <div className="flex gap-1.5 mt-auto">
          <button
            onClick={toggleStatus}
            disabled={busy}
            className={`flex-1 btn text-[11px] py-1 flex items-center justify-center gap-1 ${reel.status === "published" ? "btn-secondary" : "btn-primary"}`}
          >
            {busy ? <Loader2 size={11} className="animate-spin" /> :
              reel.status === "published"
                ? <><EyeOff size={11} /> Unpublish</>
                : <><Eye size={11} /> Publish</>
            }
          </button>
          <button
            onClick={() => onDelete(reel.id)}
            className="btn btn-ghost p-1 text-surface-400 hover:text-danger-600"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminReelsPage() {
  const [reels, setReels] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (statusFilter) params.status = statusFilter;
      const res = await adminReelsAPI.list(params);
      const list = res.data || res.reels || [];
      setReels(list);
      setTotal(res.pagination?.total ?? list.length);
    } catch {
      setReels([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [statusFilter]);

  async function handleSetStatus(id, status) {
    await adminReelsAPI.setStatus(id, status);
    load();
  }

  async function handleDelete(id) {
    setDeleting(true);
    try {
      await adminReelsAPI.delete(id);
      load();
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  const filtered = search
    ? reels.filter(r =>
        r.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.vendor_name?.toLowerCase().includes(search.toLowerCase())
      )
    : reels;

  return (
    <div className="flex flex-col min-h-screen bg-surface-50">
      <TopBar
        title="Reels"
        subtitle={`${total} total reels from vendors`}
      />

      <div className="flex-1 px-6 py-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48 max-w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search reels or vendor…"
              className="w-full pl-9 pr-3.5 py-2 text-sm border border-surface-200 rounded-xl focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-surface-200 rounded-xl px-3 py-2 text-sm bg-white text-surface-700 focus:border-primary-400 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center">
              <Film size={26} className="text-surface-300" />
            </div>
            <p className="font-semibold text-surface-700">No reels found</p>
            <p className="text-sm text-surface-500">Vendors haven't uploaded any reels yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map(r => (
              <ReelCard
                key={r.id}
                reel={r}
                onSetStatus={handleSetStatus}
                onDelete={(id) => setDeleteId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-bold text-surface-900">Delete Reel?</h3>
            <p className="text-sm text-surface-600">This will permanently remove the reel. This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="btn btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="btn btn-danger flex-1 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
