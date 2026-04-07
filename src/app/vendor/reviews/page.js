"use client";
import { useState } from "react";
import { Star, Reply, Flag, ChevronDown, TrendingUp, MessageSquare, X, Check } from "lucide-react";
import TopBar from "@/components/TopBar";
import { SAMPLE_REVIEWS } from "@/lib/data";

// Extend sample reviews with more entries for variety
const ALL_REVIEWS = [
  ...SAMPLE_REVIEWS,
  { id: 7, author: "Arpi Mkrtchyan",   avatar: "A", vendor: "Sweet Dreams Bakery", service: "Birthday Cake",      rating: 5, comment: "Incredible cake design! Guests couldn't stop complimenting it. Will order again.", date: "Mar 15, 2025", status: "approved" },
  { id: 8, author: "Vardan Harutyunyan",avatar: "V", vendor: "Sweet Dreams Bakery", service: "Cupcake Tower",       rating: 4, comment: "Tasty cupcakes, slightly overpriced but quality was good. Nice packaging.",            date: "Mar 10, 2025", status: "approved" },
  { id: 9, author: "Marine Gevorgyan", avatar: "M", vendor: "Sweet Dreams Bakery", service: "Wedding Cake",        rating: 5, comment: "Perfect execution of our dream cake. The team was professional from start to finish.", date: "Mar 5, 2025",  status: "approved" },
  { id:10, author: "Hayk Simonyan",    avatar: "H", vendor: "Sweet Dreams Bakery", service: "Custom Cake",         rating: 3, comment: "Decent cake but the fondant didn't quite match the reference I sent. Still edible!", date: "Feb 28, 2025", status: "approved" },
  { id:11, author: "Kristine Baghdasaryan", avatar: "K", vendor: "Sweet Dreams Bakery", service: "Macaron Tower",  rating: 5, comment: "Best macarons I've ever tasted! Beautiful tower presentation for our event.",          date: "Feb 20, 2025", status: "approved" },
  { id:12, author: "Ashot Danielyan",  avatar: "A", vendor: "Sweet Dreams Bakery", service: "Cookie Gift Box",     rating: 2, comment: "Cookies were okay but arrived a day late. Customer service was slow to respond.",        date: "Feb 10, 2025", status: "approved" },
];

const STAR_DIST = [
  { stars: 5, count: 68, pct: 68 },
  { stars: 4, count: 22, pct: 22 },
  { stars: 3, count: 6,  pct: 6  },
  { stars: 2, count: 3,  pct: 3  },
  { stars: 1, count: 1,  pct: 1  },
];

const REPORT_REASONS = [
  "Fake or spam review",
  "Offensive or abusive language",
  "Irrelevant to my service",
  "Competitor review",
  "Other",
];

function StarRow({ rating, size = 14, color = "text-warning-500" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={size}
          className={s <= rating ? `${color} fill-current` : "text-surface-200 fill-current"}
        />
      ))}
    </div>
  );
}

function Avatar({ initial, color = "bg-primary-600", size = "md" }) {
  const sz = size === "lg" ? "w-10 h-10 text-sm" : "w-8 h-8 text-xs";
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center flex-shrink-0`}>
      <span className="text-white font-bold">{initial}</span>
    </div>
  );
}

const AVATAR_COLORS = ["bg-primary-600","bg-pink-500","bg-blue-500","bg-green-500","bg-orange-500","bg-teal-500","bg-indigo-500","bg-rose-500"];

export default function VendorReviews() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [showUnanswered, setShowUnanswered] = useState(false);
  const [replyOpen, setReplyOpen]   = useState({});
  const [replyText, setReplyText]   = useState({});
  const [replies, setReplies]       = useState({});
  const [reportOpen, setReportOpen] = useState(null);
  const [reportReason, setReportReason] = useState("");

  const FILTER_TABS = ["All", "5★", "4★", "3★", "2★", "1★"];

  const filtered = ALL_REVIEWS.filter(r => {
    if (activeFilter !== "All") {
      const stars = parseInt(activeFilter);
      if (r.rating !== stars) return false;
    }
    if (showUnanswered && replies[r.id]) return false;
    return true;
  });

  const handleSendReply = (id) => {
    if (!replyText[id]?.trim()) return;
    setReplies(prev => ({ ...prev, [id]: replyText[id] }));
    setReplyOpen(prev => ({ ...prev, [id]: false }));
    setReplyText(prev => ({ ...prev, [id]: "" }));
  };

  const handleReport = () => {
    setReportOpen(null);
    setReportReason("");
  };

  const totalReviews = ALL_REVIEWS.length;
  const avgRating    = (ALL_REVIEWS.reduce((a, r) => a + r.rating, 0) / totalReviews).toFixed(1);
  const responseRate = Math.round((Object.keys(replies).length / totalReviews) * 100) || 76;

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title="Reviews" subtitle="Monitor and respond to client feedback" />

      <main className="flex-1 p-6 space-y-5">
        {/* Rating Overview */}
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="flex flex-wrap gap-6 items-start">
            {/* Big Rating */}
            <div className="flex flex-col items-center text-center px-4">
              <span className="text-5xl font-black text-surface-900 leading-none">{avgRating}</span>
              <StarRow rating={Math.round(parseFloat(avgRating))} size={18} />
              <p className="text-xs text-surface-400 mt-1">{totalReviews} reviews</p>
              <span className="mt-2 flex items-center gap-1 text-xs font-semibold text-success-600 bg-success-50 px-2.5 py-1 rounded-full">
                <TrendingUp size={11} /> +0.2 this month
              </span>
            </div>

            {/* Star Distribution */}
            <div className="flex-1 min-w-[200px] space-y-2">
              {STAR_DIST.map(({ stars, count, pct }) => (
                <div key={stars} className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5 w-14 flex-shrink-0">
                    <span className="text-xs text-surface-600 font-medium">{stars}</span>
                    <Star size={11} className="text-warning-500 fill-current" />
                  </div>
                  <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-warning-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-surface-400 w-8 text-right flex-shrink-0">{pct}%</span>
                </div>
              ))}
            </div>

            {/* Response Rate */}
            <div className="flex flex-col items-center text-center px-4 border-l border-surface-100">
              <div className="w-16 h-16 rounded-full border-4 border-primary-200 flex items-center justify-center mb-1 relative">
                <span className="text-lg font-black text-primary-700">{responseRate}%</span>
              </div>
              <p className="text-xs font-semibold text-surface-700">Response Rate</p>
              <p className="text-[11px] text-surface-400 mt-0.5">{Object.keys(replies).length} replied</p>
              <span className="mt-1.5 text-[10px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">Good</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {FILTER_TABS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                activeFilter === f
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-white text-surface-600 border-surface-200 hover:border-primary-300"
              }`}
            >
              {f}
            </button>
          ))}
          <div className="ml-2 border-l border-surface-200 pl-2">
            <button
              onClick={() => setShowUnanswered(!showUnanswered)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                showUnanswered
                  ? "bg-warning-500 text-white border-warning-500"
                  : "bg-white text-surface-600 border-surface-200 hover:border-warning-300"
              }`}
            >
              <MessageSquare size={11} /> Unanswered
            </button>
          </div>
          <span className="ml-auto text-xs text-surface-400">{filtered.length} reviews</span>
        </div>

        {/* Reviews List */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="bg-white rounded-xl border border-surface-200 p-10 text-center">
              <Star size={32} className="text-surface-200 mx-auto mb-2" />
              <p className="text-sm font-semibold text-surface-500">No reviews match this filter</p>
            </div>
          )}
          {filtered.map((review, idx) => {
            const hasReply = !!replies[review.id];
            const isReplyOpen = replyOpen[review.id];
            const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];

            return (
              <div key={review.id} className="bg-white rounded-xl border border-surface-200 p-5">
                {/* Review header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar initial={review.avatar} color={avatarColor} />
                    <div>
                      <p className="text-sm font-semibold text-surface-900">{review.author}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRow rating={review.rating} size={12} />
                        <span className="text-[11px] text-surface-400">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {review.status === "flagged" && (
                      <span className="badge badge-danger">Flagged</span>
                    )}
                    <span className="text-[11px] text-surface-400 bg-surface-50 px-2 py-0.5 rounded-md border border-surface-100">
                      {review.service}
                    </span>
                  </div>
                </div>

                {/* Review text */}
                <p className="text-sm text-surface-700 leading-relaxed mb-3">{review.comment}</p>

                {/* Vendor reply (if exists) */}
                {hasReply && (
                  <div className="bg-primary-50 border border-primary-100 rounded-xl p-3.5 mb-3">
                    <p className="text-[10px] font-bold text-primary-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Reply size={11} /> Vendor Response
                    </p>
                    <p className="text-xs text-surface-700 leading-relaxed">{replies[review.id]}</p>
                  </div>
                )}

                {/* Reply composer */}
                {isReplyOpen && !hasReply && (
                  <div className="mb-3 border border-surface-200 rounded-xl p-3 bg-surface-50">
                    <textarea
                      value={replyText[review.id] || ""}
                      onChange={e => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                      placeholder="Write a professional response..."
                      rows={3}
                      className="w-full text-xs text-surface-700 bg-white border border-surface-200 rounded-lg p-2.5 resize-none placeholder:text-surface-400 focus:outline-none focus:border-primary-400 transition"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => setReplyOpen(prev => ({ ...prev, [review.id]: false }))}
                        className="px-3 py-1.5 text-xs font-medium text-surface-500 hover:text-surface-700 cursor-pointer border-none bg-transparent"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSendReply(review.id)}
                        disabled={!replyText[review.id]?.trim()}
                        className="px-4 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer border-none"
                      >
                        Submit Reply
                      </button>
                    </div>
                  </div>
                )}

                {/* Action row */}
                <div className="flex items-center gap-2 pt-2 border-t border-surface-50">
                  {!hasReply && (
                    <button
                      onClick={() => setReplyOpen(prev => ({ ...prev, [review.id]: !prev[review.id] }))}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer border-none"
                    >
                      <Reply size={12} /> Reply
                    </button>
                  )}
                  {hasReply && (
                    <span className="flex items-center gap-1 text-xs font-medium text-success-600">
                      <Check size={12} /> Replied
                    </span>
                  )}
                  <button
                    onClick={() => setReportOpen(review.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-surface-400 hover:text-danger-500 transition-colors cursor-pointer border-none bg-transparent ml-auto"
                  >
                    <Flag size={12} /> Report
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Report Modal */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-surface-200 shadow-elevated w-[360px]">
            <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-surface-900">Report Review</h3>
              <button onClick={() => setReportOpen(null)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-100 transition-colors cursor-pointer border-none bg-transparent">
                <X size={14} className="text-surface-500" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-xs text-surface-500 mb-4">Select a reason for reporting this review:</p>
              <div className="space-y-2">
                {REPORT_REASONS.map(reason => (
                  <label key={reason} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="report"
                      value={reason}
                      checked={reportReason === reason}
                      onChange={() => setReportReason(reason)}
                      className="w-4 h-4 accent-primary-600"
                    />
                    <span className="text-xs text-surface-700 group-hover:text-surface-900">{reason}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={() => setReportOpen(null)}
                  className="px-4 py-2 text-xs font-medium text-surface-500 hover:text-surface-700 cursor-pointer border-none bg-transparent"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReport}
                  disabled={!reportReason}
                  className="px-4 py-2 bg-danger-500 text-white text-xs font-semibold rounded-lg hover:bg-danger-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer border-none"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
