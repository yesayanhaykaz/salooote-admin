"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Trash2, Star, Upload, ImageIcon, CheckCircle2, X } from "lucide-react";
import { uploadAPI } from "@/lib/api";

/**
 * ImageManager — improved image CRUD for product or service.
 * Props:
 *   entityId   — UUID (null = not yet saved → use staging mode if onStage provided)
 *   type       — "product" | "service"
 *   images     — initial array {id, url, is_primary}
 *   onChange   — called with updated images array (uploaded)
 *   onStage    — optional. If set, when entityId is null images are kept in
 *                local staging state instead of showing the "save first" notice.
 *                Receives the current array of staged File objects.
 *   stagedFiles — optional. Controlled staged files array (for parent control).
 */
export default function ImageManager({ entityId, type = "product", images: initial = [], onChange, onStage, stagedFiles: stagedFromProp }) {
  const [images, setImages]       = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState([]); // pending file previews (during upload)
  const [deleting, setDeleting]   = useState(null);
  const [setting, setSetting]     = useState(null);
  const [drag, setDrag]           = useState(false);
  // Staged files (when entity not yet created)
  const [staged, setStaged]       = useState([]); // [{ file, localUrl, primary }]
  const fileRef = useRef();
  const stagingMode = !entityId && typeof onStage === "function";

  useEffect(() => { setImages(initial); }, [JSON.stringify(initial)]);

  const notify = (updated) => { setImages(updated); onChange?.(updated); };

  // ── Upload (multiple files at once) ───────────────────────────────────────
  const handleFiles = useCallback(async (files) => {
    if (!files?.length) return;
    const arr = Array.from(files);

    // Staging mode (no entityId yet) — keep local previews, hand off to parent
    if (stagingMode) {
      const newStaged = arr.map(file => ({ file, localUrl: URL.createObjectURL(file) }));
      setStaged(prev => {
        const merged = [...prev, ...newStaged];
        // If this is the first batch, mark first as primary
        if (!merged.some(s => s.primary)) {
          merged[0].primary = true;
        }
        onStage?.(merged.map(s => s.file));
        return merged;
      });
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    if (!entityId) return;

    // Show local previews immediately
    const previews = arr.map(f => ({ _localUrl: URL.createObjectURL(f), _uploading: true }));
    setProgress(previews);
    setUploading(true);

    const upFn = type === "service" ? uploadAPI.serviceImage : uploadAPI.productImage;
    const results = [];

    for (const file of arr) {
      try {
        const res = await upFn(entityId, file);
        if (res?.data) results.push(res.data);
      } catch (e) {
        console.error("Upload failed:", e);
      }
    }

    setProgress([]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";

    if (results.length) {
      setImages(prev => {
        const updated = [...prev, ...results];
        onChange?.(updated);
        return updated;
      });
    }
  }, [entityId, type, onChange, stagingMode, onStage]);

  // Remove a staged file (pre-create)
  const handleRemoveStaged = (index) => {
    setStaged(prev => {
      const next = prev.filter((_, i) => i !== index);
      // Preserve primary if removed
      if (!next.some(s => s.primary) && next.length > 0) next[0].primary = true;
      onStage?.(next.map(s => s.file));
      return next;
    });
  };

  const handleSetStagedPrimary = (index) => {
    setStaged(prev => {
      const next = prev.map((s, i) => ({ ...s, primary: i === index }));
      onStage?.(next.map(s => s.file));
      return next;
    });
  };

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDrag(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const onDragOver = useCallback((e) => { e.preventDefault(); setDrag(true); }, []);
  const onDragLeave = useCallback(() => setDrag(false), []);

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (img) => {
    if (!entityId) return;
    setDeleting(img.id);
    try {
      const delFn = type === "service" ? uploadAPI.deleteServiceImage : uploadAPI.deleteProductImage;
      await delFn(entityId, img.id);
      const updated = images.filter(i => i.id !== img.id);
      if (img.is_primary && updated.length > 0) updated[0] = { ...updated[0], is_primary: true };
      notify(updated);
    } catch (e) { console.error(e); }
    finally { setDeleting(null); }
  };

  // ── Set primary (click) ───────────────────────────────────────────────────
  const handleSetPrimary = async (img) => {
    if (!entityId || img.is_primary || setting) return;
    setSetting(img.id);
    try {
      const fn = type === "service" ? uploadAPI.setServiceImagePrimary : uploadAPI.setProductImagePrimary;
      await fn(entityId, img.id);
      notify(images.map(i => ({ ...i, is_primary: i.id === img.id })));
    } catch (e) { console.error(e); }
    finally { setSetting(null); }
  };

  // ── Not saved yet ─────────────────────────────────────────────────────────
  if (!entityId) {
    if (stagingMode) {
      // Staging mode — let user pick images now, parent uploads after create
      return (
        <div className="space-y-4">
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
              drag
                ? "border-primary-500 bg-primary-50/60 scale-[1.01]"
                : "border-surface-200 bg-surface-50 hover:border-primary-300 hover:bg-primary-50/20"
            }`}
            style={{ minHeight: 80 }}
          >
            <div className="flex items-center justify-center gap-3 py-5 px-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${drag ? "bg-primary-100" : "bg-surface-100"}`}>
                <Upload size={16} className={drag ? "text-primary-600" : "text-surface-400"} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${drag ? "text-primary-700" : "text-surface-600"}`}>
                  {drag ? "Drop images here" : "Click or drag images here"}
                </p>
                <p className="text-xs text-surface-400 mt-0.5">PNG, JPG — they upload after you save the product</p>
              </div>
            </div>
          </div>

          {staged.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2.5">
                {staged.length} image{staged.length !== 1 ? "s" : ""} pending · Click to set as main
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {staged.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => handleSetStagedPrimary(i)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                      s.primary
                        ? "border-primary-500 ring-2 ring-primary-200 shadow-md"
                        : "border-amber-300 hover:border-primary-300"
                    }`}
                  >
                    <img src={s.localUrl} alt="" className="w-full h-full object-cover" />
                    {s.primary && (
                      <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 bg-primary-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
                        <Star size={8} className="fill-white" /> Main
                      </div>
                    )}
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 text-[9px] font-bold text-amber-700 bg-amber-50/95 backdrop-blur-sm rounded px-1.5 py-0.5 text-center">
                      Pending upload
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveStaged(i); }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer border-none shadow"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                <ImageIcon size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  These will upload automatically when you save the product. The first / starred image becomes the main thumbnail.
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
        </div>
      );
    }

    // Legacy — no staging callback supplied: show the original notice
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-amber-200 bg-amber-50 rounded-2xl gap-3 text-center">
        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
          <ImageIcon size={22} className="text-amber-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-800">Save the item first</p>
          <p className="text-xs text-amber-600 mt-1">Click &quot;Save as Draft&quot; to get an ID, then come back to upload images</p>
        </div>
      </div>
    );
  }

  const primary = images.find(i => i.is_primary) || images[0];
  const allImages = images;

  return (
    <div className="space-y-4">

      {/* ── Drop zone (always visible) ── */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !uploading && fileRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
          drag
            ? "border-primary-500 bg-primary-50/60 scale-[1.01]"
            : "border-surface-200 bg-surface-50 hover:border-primary-300 hover:bg-primary-50/20"
        }`}
        style={{ minHeight: 80 }}
      >
        <div className="flex items-center justify-center gap-3 py-5 px-4">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${drag ? "bg-primary-100" : "bg-surface-100"}`}>
            <Upload size={16} className={drag ? "text-primary-600" : "text-surface-400"} />
          </div>
          <div>
            <p className={`text-sm font-semibold ${drag ? "text-primary-700" : "text-surface-600"}`}>
              {uploading ? "Uploading…" : drag ? "Drop images here" : "Click or drag images here"}
            </p>
            <p className="text-xs text-surface-400 mt-0.5">PNG, JPG — select multiple files at once</p>
          </div>
        </div>
        {uploading && (
          <div className="absolute inset-0 rounded-2xl bg-white/70 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-primary-600">Uploading {progress.length} image{progress.length !== 1 ? "s" : ""}…</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Image grid ── */}
      {(allImages.length > 0 || progress.length > 0) && (
        <div>
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2.5">
            {allImages.length} image{allImages.length !== 1 ? "s" : ""} · Click to set as main
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {/* Uploading previews */}
            {progress.map((p, i) => (
              <div key={`pending-${i}`} className="relative aspect-square rounded-xl overflow-hidden border-2 border-surface-200 bg-surface-100">
                <img src={p._localUrl} alt="" className="w-full h-full object-cover opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
            ))}

            {/* Uploaded images */}
            {allImages.map((img) => {
              const isSettingThis = setting === img.id;
              const isDeletingThis = deleting === img.id;
              return (
                <div
                  key={img.id}
                  onClick={() => handleSetPrimary(img)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                    img.is_primary
                      ? "border-primary-500 ring-2 ring-primary-200 shadow-md"
                      : "border-surface-200 hover:border-primary-300"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />

                  {/* Primary badge */}
                  {img.is_primary && (
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 bg-primary-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
                      <Star size={8} className="fill-white" /> Main
                    </div>
                  )}

                  {/* Setting spinner */}
                  {isSettingThis && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {/* Hover overlay */}
                  {!img.is_primary && !isSettingThis && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg shadow text-[11px] font-bold text-primary-600">
                        <CheckCircle2 size={11} /> Set Main
                      </div>
                    </div>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(img); }}
                    disabled={isDeletingThis || !!deleting}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer border-none shadow disabled:opacity-40"
                  >
                    {isDeletingThis
                      ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <X size={10} />
                    }
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Main image preview ── */}
      {primary && (
        <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl border border-primary-100">
          <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-primary-200 flex-shrink-0">
            <img src={primary.url} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-xs font-bold text-primary-700 flex items-center gap-1">
              <Star size={10} className="fill-primary-500 text-primary-500" /> Main image
            </p>
            <p className="text-[11px] text-primary-500 mt-0.5">Shown as thumbnail in listings &amp; search</p>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  );
}
