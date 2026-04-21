"use client";
import { useState, useEffect } from "react";
import { Star, Plus, X, Send, CheckCircle } from "lucide-react";
import TopBar from "@/components/TopBar";
import { userAPI } from "@/lib/api";

const STATUS_BADGE = {
  pending:  "badge badge-warning",
  approved: "badge badge-success",
  rejected: "badge badge-danger",
  public:   "badge badge-success",
};

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StarRating({ value, onChange, readonly }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange && onChange(n)}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-transform ${!readonly ? "hover:scale-110 cursor-pointer" : "cursor-default"} bg-transparent border-none p-0`}
        >
          <Star
            size={readonly ? 14 : 22}
            className={`${(hovered || value) >= n ? "fill-yellow-400 text-yellow-400" : "text-surface-200"} transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}

function WriteReviewModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    target_type: "vendor",
    target_id: "",
    rating: 0,
    title: "",
    body: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.target_id.trim()) { setError("Target ID is required."); return; }
    if (!form.rating)           { setError("Please select a rating."); return; }
    if (!form.body.trim())      { setError("Review body is required."); return; }

    setSaving(true);
    try {
      const res = await userAPI.createReview({
        target_type: form.target_type,
        target_id: form.target_id.trim(),
        rating: form.rating,
        title: form.title.trim(),
        body: form.body.trim(),
      });
      onCreated(res?.data || res);
    } catch (err) {
      setError(err.message || "Failed to submit review.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-surface-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-sm font-bold text-surface-900">Write a Review</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-surface-100 flex items-center justify-center transition-colors cursor-pointer border-none bg-transparent">
            <X size={15} className="text-surface-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">Type *</label>
              <select
                name="target_type"
                value={form.target_type}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 bg-white"
              >
                <option value="vendor">Vendor</option>
                <option value="product">Product</option>
                <option value="service">Service</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">Target ID *</label>
              <input
                name="target_id"
                value={form.target_id}
                onChange={handleChange}
                placeholder="UUID"
                className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 transition-colors font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-2">Rating *</label>
            <StarRating value={form.rating} onChange={v => setForm(prev => ({ ...prev, rating: v }))} />
            {!form.rating && <p className="text-[11px] text-surface-400 mt-1">Click to set a rating</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Summary of your experience"
              className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">Review *</label>
            <textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              rows={4}
              placeholder="Share your experience…"
              className="w-full resize-none px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-danger-600 bg-danger-50 border border-danger-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-surface-600 border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors cursor-pointer bg-white">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none disabled:opacity-60">
              <Send size={14} /> {saving ? "Submitting…" : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    userAPI.reviews({ limit: 50 })
      .then(res => setReviews(res?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleCreated(newReview) {
    if (newReview?.id) setReviews(prev => [newReview, ...prev]);
    setShowModal(false);
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar
        title="Reviews"
        subtitle="Your submitted reviews"
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none"
          >
            <Plus size={13} /> Write Review
          </button>
        }
      />

      <main className="flex-1 p-6 space-y-5">
        {loading && (
          <div className="flex items-center justify-center py-20 text-sm text-surface-400">Loading…</div>
        )}

        {!loading && reviews.length === 0 && (
          <div className="bg-white rounded-xl border border-surface-200 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center mb-3">
              <Star size={24} className="text-yellow-300" />
            </div>
            <p className="text-sm font-semibold text-surface-600">No reviews yet</p>
            <p className="text-xs text-surface-400 mt-1 mb-4">Share your experience with vendors you have worked with.</p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 text-xs font-semibold bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none"
            >
              <Plus size={13} /> Write Your First Review
            </button>
          </div>
        )}

        {!loading && reviews.length > 0 && (
          <div className="space-y-4">
            {reviews.map(review => {
              const badgeCls = STATUS_BADGE[review.status?.toLowerCase()] || "badge badge-gray";
              return (
                <div key={review.id} className="bg-white rounded-xl border border-surface-200 p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 flex-shrink-0">
                        {review.target_type?.slice(0, 2).toUpperCase() || "??"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-surface-900 capitalize">{review.target_type}</p>
                          <span className="font-mono text-xs text-surface-400">{review.target_id?.slice(-8)}</span>
                          <span className={badgeCls}>{review.status || "pending"}</span>
                        </div>
                        {review.title && (
                          <p className="text-xs font-medium text-surface-700 mt-0.5">{review.title}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-surface-400 flex-shrink-0">{formatDate(review.created_at)}</span>
                  </div>

                  <StarRating value={review.rating} readonly />

                  {review.body && (
                    <p className="text-sm text-surface-600 mt-2 leading-relaxed">{review.body}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showModal && <WriteReviewModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}
    </div>
  );
}
