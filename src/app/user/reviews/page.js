"use client";
import { useState } from "react";
import {
  Star, Edit3, CheckCircle, Camera, Send, Package
} from "lucide-react";
import TopBar from "@/components/TopBar";

const MY_REVIEWS = [
  {
    id: 1,
    vendor: "Elite Photography Yerevan",
    service: "Full Day Wedding Photography",
    date: "March 18, 2025",
    rating: 5,
    text: "Absolutely stunning work! The team captured every precious moment of our engagement ceremony with such artistry. The editing was flawless and delivery was faster than expected. Highly recommend to anyone looking for a top-tier photographer in Yerevan.",
    initials: "EP",
    bg: "bg-blue-100 text-blue-600",
  },
  {
    id: 2,
    vendor: "Sweet Dreams Bakery",
    service: "Custom Engagement Cake",
    date: "February 10, 2025",
    rating: 5,
    text: "The cake was a work of art — not only beautiful but absolutely delicious! Every guest was asking about it. The team was professional, on time, and accommodated our custom design perfectly. Will definitely order again for the wedding!",
    initials: "SB",
    bg: "bg-pink-100 text-pink-600",
  },
  {
    id: 3,
    vendor: "Grand Decor Studio",
    service: "Engagement Party Decoration",
    date: "January 25, 2025",
    rating: 4,
    text: "Beautiful decoration overall. A few items weren't exactly as shown in the catalog, but the team was responsive and made adjustments quickly. The venue looked magical and we received many compliments from guests.",
    initials: "GD",
    bg: "bg-yellow-100 text-yellow-700",
  },
];

const PENDING_REVIEWS = [
  {
    id: 1,
    vendor: "Nairi Catering Co.",
    service: "Birthday Party Catering",
    completedDate: "March 28, 2025",
    initials: "NC",
    bg: "bg-orange-100 text-orange-600",
  },
  {
    id: 2,
    vendor: "Sound Wave DJ",
    service: "Birthday Party DJ – 4 Hours",
    completedDate: "March 28, 2025",
    initials: "SW",
    bg: "bg-violet-100 text-violet-600",
  },
];

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

function ReviewComposer({ vendor, onSubmit, onCancel }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!rating || !text.trim()) return;
    setSubmitted(true);
    setTimeout(() => onSubmit && onSubmit(), 2000);
  }

  if (submitted) {
    return (
      <div className="border border-green-200 rounded-xl bg-green-50 px-5 py-6 text-center">
        <CheckCircle size={28} className="text-green-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-green-700">Review submitted successfully!</p>
        <p className="text-xs text-green-600 mt-1">Thank you for sharing your feedback.</p>
      </div>
    );
  }

  return (
    <div className="border border-surface-200 rounded-xl bg-surface-50 p-4 mt-3 space-y-3">
      <div>
        <p className="text-xs text-surface-500 font-medium mb-1.5">Your Rating</p>
        <StarRating value={rating} onChange={setRating} />
        {rating === 0 && <p className="text-[11px] text-surface-400 mt-1">Click to set a rating</p>}
      </div>
      <div>
        <p className="text-xs text-surface-500 font-medium mb-1.5">Your Review</p>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={`Share your experience with ${vendor}…`}
          rows={4}
          className="w-full resize-none border border-surface-200 bg-white rounded-xl px-3 py-2.5 text-sm text-surface-700 placeholder:text-surface-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-50 transition-colors"
        />
      </div>
      <div>
        <button className="flex items-center gap-1.5 text-xs text-surface-500 border border-surface-200 bg-white px-3 py-2 rounded-lg hover:bg-surface-50 transition-colors">
          <Camera size={13} /> Add Photo (optional)
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleSubmit}
          disabled={!rating || !text.trim()}
          className="flex items-center gap-1.5 text-xs font-semibold bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={13} /> Submit Review
        </button>
        <button onClick={onCancel} className="text-xs text-surface-500 px-3 py-2 rounded-lg hover:bg-surface-100 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

function EditForm({ review, onSave, onCancel }) {
  const [rating, setRating] = useState(review.rating);
  const [text, setText] = useState(review.text);

  return (
    <div className="border border-primary-200 rounded-xl bg-primary-50 p-4 mt-3 space-y-3">
      <div>
        <p className="text-xs text-surface-500 font-medium mb-1.5">Rating</p>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <div>
        <p className="text-xs text-surface-500 font-medium mb-1.5">Review</p>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={4}
          className="w-full resize-none border border-surface-200 bg-white rounded-xl px-3 py-2.5 text-sm text-surface-700 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-50 transition-colors"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSave({ rating, text })}
          className="text-xs font-semibold bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Save Changes
        </button>
        <button onClick={onCancel} className="text-xs text-surface-500 px-3 py-2 rounded-lg hover:bg-surface-100 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState("My Reviews");
  const [editingId, setEditingId] = useState(null);
  const [composingId, setComposingId] = useState(null);
  const [reviews, setReviews] = useState(MY_REVIEWS);
  const [submitted, setSubmitted] = useState([]);

  function handleSaveEdit(id, updates) {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    setEditingId(null);
  }

  function handleSubmitReview(id) {
    setSubmitted(prev => [...prev, id]);
    setComposingId(null);
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title="Reviews" subtitle="Manage your vendor reviews" />

      <main className="flex-1 p-6 space-y-6">

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-xl px-2 py-1.5 w-fit">
          {["My Reviews", "Pending Reviews"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === tab ? "bg-primary-600 text-white" : "text-surface-500 hover:bg-surface-100"
              }`}
            >
              {tab}
              {tab === "Pending Reviews" && (
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab ? "bg-white/20 text-white" : "bg-danger-100 text-danger-600"}`}>
                  {PENDING_REVIEWS.filter(p => !submitted.includes(p.id)).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "My Reviews" && (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-white rounded-xl border border-surface-200 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${review.bg}`}>
                      {review.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-surface-900">{review.vendor}</p>
                      <p className="text-xs text-surface-400">{review.service}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-surface-400">{review.date}</span>
                    {editingId !== review.id && (
                      <button
                        onClick={() => setEditingId(review.id)}
                        className="flex items-center gap-1 text-xs text-primary-600 font-medium border border-primary-200 px-2.5 py-1 rounded-lg hover:bg-primary-50 transition-colors"
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                    )}
                  </div>
                </div>

                {editingId === review.id ? (
                  <EditForm
                    review={review}
                    onSave={(updates) => handleSaveEdit(review.id, updates)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="mt-3">
                    <StarRating value={review.rating} readonly />
                    <p className="text-sm text-surface-600 mt-2 leading-relaxed">{review.text}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "Pending Reviews" && (
          <div className="space-y-4">
            {PENDING_REVIEWS.filter(p => !submitted.includes(p.id)).length === 0 ? (
              <div className="bg-white rounded-xl border border-surface-200 flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-3">
                  <CheckCircle size={24} className="text-green-400" />
                </div>
                <p className="text-sm font-semibold text-surface-600">All reviews submitted!</p>
                <p className="text-xs text-surface-400 mt-1">You are all caught up. Thank you for your feedback.</p>
              </div>
            ) : (
              PENDING_REVIEWS.filter(p => !submitted.includes(p.id)).map(item => (
                <div key={item.id} className="bg-white rounded-xl border border-surface-200 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${item.bg}`}>
                        {item.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-surface-900">{item.vendor}</p>
                        <p className="text-xs text-surface-400">{item.service}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <CheckCircle size={11} className="text-green-500" />
                          <span className="text-[11px] text-green-600 font-medium">Completed {item.completedDate}</span>
                        </div>
                      </div>
                    </div>
                    {composingId !== item.id && (
                      <button
                        onClick={() => setComposingId(item.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors flex-shrink-0"
                      >
                        <Star size={13} /> Write Review
                      </button>
                    )}
                  </div>

                  {composingId === item.id && (
                    <ReviewComposer
                      vendor={item.vendor}
                      onSubmit={() => handleSubmitReview(item.id)}
                      onCancel={() => setComposingId(null)}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        )}

      </main>
    </div>
  );
}
