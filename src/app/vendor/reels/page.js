"use client";
import { useState, useEffect, useRef } from "react";
import {
  Plus, Film, Trash2, Eye, EyeOff, Upload, Heart, PlayCircle,
  Pencil, X, Check, Loader2,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import { vendorAPI } from "@/lib/api";

const STATUS_BADGE = {
  draft:     "badge badge-gray",
  published: "badge badge-success",
};

function VideoCard({ reel, onPublish, onUnpublish, onDelete, onEdit }) {
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      if (reel.status === "published") await onUnpublish(reel.id);
      else await onPublish(reel.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden flex flex-col">
      {/* thumbnail / video preview */}
      <div className="relative bg-surface-100 aspect-[9/16] max-h-64 flex items-center justify-center overflow-hidden">
        {reel.thumbnail_url ? (
          <img src={reel.thumbnail_url} alt={reel.title} className="w-full h-full object-cover" />
        ) : reel.video_url ? (
          <video src={reel.video_url} className="w-full h-full object-cover" muted preload="metadata" />
        ) : (
          <Film size={40} className="text-surface-300" />
        )}
        <span className={`absolute top-2 left-2 ${STATUS_BADGE[reel.status] || "badge badge-gray"} text-[10px]`}>
          {reel.status}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="font-semibold text-sm text-surface-900 line-clamp-1">{reel.title}</p>
          {reel.description && (
            <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">{reel.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-surface-500">
          <span className="flex items-center gap-1"><Heart size={12} /> {reel.like_count ?? 0}</span>
          <span className="flex items-center gap-1"><PlayCircle size={12} /> {reel.view_count ?? 0}</span>
        </div>

        <div className="flex gap-2 mt-auto">
          <button
            onClick={toggle}
            disabled={busy}
            className={`flex-1 btn text-xs py-1.5 flex items-center justify-center gap-1 ${reel.status === "published" ? "btn-secondary" : "btn-primary"}`}
          >
            {busy ? <Loader2 size={12} className="animate-spin" /> :
              reel.status === "published" ? <><EyeOff size={12} /> Unpublish</> : <><Eye size={12} /> Publish</>}
          </button>
          <button onClick={() => onEdit(reel)} className="btn btn-ghost p-1.5 text-surface-500 hover:text-primary-600">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(reel.id)} className="btn btn-ghost p-1.5 text-surface-500 hover:text-danger-600">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ReelFormModal({ reel, onClose, onSaved }) {
  const [title, setTitle] = useState(reel?.title || "");
  const [description, setDescription] = useState(reel?.description || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(reel?.video_url || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  function pickFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function submit(e) {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required"); return; }
    if (!reel && !file) { setError("Video file is required"); return; }

    setSaving(true);
    setError("");
    try {
      if (reel) {
        // Edit: only title/description (video can't be swapped via PUT)
        await vendorAPI.updateReel(reel.id, { title, description });
      } else {
        const form = new FormData();
        form.append("file", file);
        form.append("title", title);
        if (description) form.append("description", description);
        await vendorAPI.createReel(form);
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <h2 className="font-bold text-surface-900">{reel ? "Edit Reel" : "Upload New Reel"}</h2>
          <button onClick={onClose} className="btn btn-ghost p-1"><X size={18} /></button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          {!reel && (
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">Video File *</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-surface-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-400 transition-colors"
              >
                {preview ? (
                  <video src={preview} className="max-h-40 rounded-lg" controls />
                ) : (
                  <>
                    <Upload size={28} className="text-surface-400" />
                    <span className="text-xs text-surface-500">Click to choose video (MP4, MOV, WebM)</span>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/x-matroska" className="hidden" onChange={pickFile} />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">Title *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-surface-200 rounded-xl px-3.5 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
              placeholder="e.g. Behind the scenes at our venue"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-surface-200 rounded-xl px-3.5 py-2.5 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none resize-none"
              placeholder="Optional caption for your reel"
            />
          </div>

          {error && <p className="text-xs text-danger-600 bg-danger-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {reel ? "Save Changes" : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VendorReelsPage() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | "create" | reel object (edit)
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await vendorAPI.reels({ limit: 50 });
      setReels(res.data || res.reels || []);
    } catch {
      setReels([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handlePublish(id) {
    await vendorAPI.publishReel(id);
    load();
  }
  async function handleUnpublish(id) {
    await vendorAPI.unpublishReel(id);
    load();
  }
  async function handleDelete(id) {
    setDeleting(true);
    try {
      await vendorAPI.deleteReel(id);
      load();
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface-50">
      <TopBar
        title="Reels"
        subtitle="Short videos showcasing your work"
        actions={
          <button onClick={() => setModal("create")} className="btn btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Upload Reel
          </button>
        }
      />

      <div className="flex-1 px-6 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center">
              <Film size={28} className="text-surface-400" />
            </div>
            <div>
              <p className="font-semibold text-surface-700">No reels yet</p>
              <p className="text-sm text-surface-500 mt-1">Upload your first short video to showcase your work</p>
            </div>
            <button onClick={() => setModal("create")} className="btn btn-primary flex items-center gap-2">
              <Plus size={15} /> Upload First Reel
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {reels.map(r => (
              <VideoCard
                key={r.id}
                reel={r}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
                onDelete={(id) => setDeleteId(id)}
                onEdit={(r) => setModal(r)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {modal && (
        <ReelFormModal
          reel={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-bold text-surface-900">Delete Reel?</h3>
            <p className="text-sm text-surface-600">This will permanently delete the reel. This action cannot be undone.</p>
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
