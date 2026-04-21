"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Star, CheckCircle, EyeOff, Trash2, Flag, RotateCcw,
  MessageSquare, AlertTriangle, Clock, ThumbsUp, Search,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import StatsCard from "@/components/StatsCard";
import { adminReviewsAPI } from "@/lib/api";

const AVATAR_COLORS = [
  "bg-pink-500", "bg-violet-500", "bg-blue-500", "bg-green-500",
  "bg-orange-500", "bg-teal-500", "bg-rose-500", "bg-indigo-500",
];

const STATUS_TABS = [
  { key: "all",      label: "All" },
  { key: "pending",  label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "flagged",  label: "Flagged" },
  { key: "hidden",   label: "Hidden" },
];

const STAR_TABS = [
  { key: "all", label: "All Stars" },
  { key: "5",   label: "5 stars" },
  { key: "4",   label: "4 stars" },
  { key: "3",   label: "3 stars" },
  { key: "2",   label: "2 stars" },
  { key: "1",   label: "1 star" },
];

const STATUS_BADGE = {
  approved: "badge badge-success",
  pending:  "badge badge-warning",
  flagged:  "badge badge-danger",
  hidden:   "badge badge-gray",
};

function fmt(dateStr) {
  if (!dateStr) return "—";
  try { return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
  catch { return dateStr; }
}

function StarRow({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star
          key={s}
          size={size}
          className={s <= rating ? "text-amber-400 fill-amber-400" : "text-surface-200 fill-surface-200"}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review, onAction }) {
  const isFlagged = review.status === "flagged";
  const isPending = review.status === "pending";
  const [acting, setActing] = useState(false);

  const authorName = review.user_name || review.user?.first_name || "Anonymous";
  const avatarIdx  = authorName.charCodeAt(0) % AVATAR_COLORS.length;

  const borderClass = isFlagged
    ? "border-l-4 border-l-red-400"
    : isPending
    ? "border-l-4 border-l-amber-400"
    : "";

  async function handleClick(action) {
    setActing(true);
    try { await onAction(review.id, action); }
    finally { setActing(false); }
  }

  return (
    <div className={`bg-white rounded-xl border border-surface-200 p-5 ${borderClass} hover:shadow-sm transition-shadow`}>
      <div className="flex items-start justify-between gap-4">
        {/* Author + Meta */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-9 h-9 rounded-full ${AVATAR_COLORS[avatarIdx]} flex items-center justify-center flex-shrink-0 text-white font-bold text-sm`}>
            {authorName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-surface-800">{authorName}</span>
              <span className="text-xs text-surface-400">{fmt(review.created_at)}</span>
              <span className={STATUS_BADGE[review.status] || "badge badge-gray"}>
                {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
              </span>
            </div>
            {review.title && (
              <p className="text-xs font-semibold text-surface-700 mt-0.5">{review.title}</p>
            )}
            <div className="mt-1.5">
              <StarRow rating={review.rating} />
            </div>
            <p className="text-sm text-surface-600 mt-2 leading-relaxed">{review.body}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {review.status === "pending" && (
            <button
              onClick={() => handleClick("approve")}
              disabled={acting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-200 text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer disabled:opacity-60"
            >
              <CheckCircle size={12} />
              Approve
            </button>
          )}
          {review.status === "flagged" && (
            <button
              onClick={() => handleClick("unflag")}
              disabled={acting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-200 text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer disabled:opacity-60"
            >
              <RotateCcw size={12} />
              Unflag
            </button>
          )}
          {review.status === "approved" && (
            <button
              onClick={() => handleClick("flag")}
              disabled={acting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-200 text-xs font-semibold text-surface-600 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer disabled:opacity-60"
            >
              <Flag size={12} />
              Flag
            </button>
          )}
          {review.status !== "hidden" && (
            <button
              onClick={() => handleClick("hide")}
              disabled={acting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-200 text-xs font-semibold text-surface-500 bg-white hover:bg-surface-50 transition-colors cursor-pointer disabled:opacity-60"
            >
              <EyeOff size={12} />
              Hide
            </button>
          )}
          {review.status === "hidden" && (
            <button
              onClick={() => handleClick("approve")}
              disabled={acting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-200 text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer disabled:opacity-60"
            >
              <CheckCircle size={12} />
              Restore
            </button>
          )}
          <button
            onClick={() => handleClick("delete")}
            disabled={acting}
            className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors cursor-pointer bg-white disabled:opacity-60"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState("all");
  const [starFilter, setStarFilter] = useState("all");
  const [search, setSearch]         = useState("");

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 200, page: 1 };
      if (activeTab !== "all")    params.status = activeTab;
      if (starFilter !== "all")   params.rating = starFilter;
      const res = await adminReviewsAPI.list(params);
      setReviews(res?.data?.items || res?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeTab, starFilter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const counts = {
    all:      reviews.length,
    approved: reviews.filter(r => r.status === "approved").length,
    pending:  reviews.filter(r => r.status === "pending").length,
    flagged:  reviews.filter(r => r.status === "flagged").length,
    hidden:   reviews.filter(r => r.status === "hidden").length,
  };

  async function handleAction(id, action) {
    const STATUS_MAP = {
      approve: "approved",
      hide:    "hidden",
      unflag:  "approved",
      flag:    "flagged",
    };

    if (action === "delete") {
      await adminReviewsAPI.delete(id);
      setReviews(prev => prev.filter(r => r.id !== id));
    } else {
      const newStatus = STATUS_MAP[action];
      if (newStatus) {
        await adminReviewsAPI.updateStatus(id, newStatus);
        setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      }
    }
  }

  const filtered = reviews.filter(r => {
    if (search) {
      const name = r.user_name || r.user?.first_name || "";
      if (!`${name} ${r.body} ${r.title || ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Reviews & Moderation" />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatsCard label="Total Reviews" value={counts.all}      icon={MessageSquare} iconBg="bg-violet-50"  iconColor="text-violet-500" />
          <StatsCard label="Approved"      value={counts.approved} icon={ThumbsUp}      iconBg="bg-green-50"   iconColor="text-green-500"  />
          <StatsCard label="Pending"       value={counts.pending}  icon={Clock}         iconBg="bg-amber-50"   iconColor="text-amber-500"  />
          <StatsCard label="Flagged"       value={counts.flagged}  icon={AlertTriangle} iconBg="bg-red-50"     iconColor="text-red-500"    />
          <StatsCard label="Hidden"        value={counts.hidden}   icon={EyeOff}        iconBg="bg-surface-50" iconColor="text-surface-400"/>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-surface-200 p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-4">
            {/* Status tabs */}
            <div className="flex items-center gap-1 flex-wrap">
              {STATUS_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer border-0 ${
                    activeTab === tab.key
                      ? "bg-primary-600 text-white shadow-sm"
                      : "text-surface-500 hover:text-surface-800 hover:bg-surface-50 bg-transparent"
                  }`}
                >
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === tab.key ? "bg-white/20 text-white" : "bg-surface-100 text-surface-500"
                  }`}>
                    {counts[tab.key] ?? 0}
                  </span>
                </button>
              ))}
            </div>

            {/* Star filter */}
            <div className="flex items-center gap-1 ml-auto flex-wrap">
              {STAR_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setStarFilter(tab.key)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                    starFilter === tab.key
                      ? "bg-amber-400 text-white border-amber-400"
                      : "border-surface-200 text-surface-500 hover:bg-amber-50 hover:text-amber-600 bg-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center bg-surface-50 rounded-lg px-3 py-2 border border-surface-200 w-full max-w-sm gap-2 focus-within:border-primary-400 transition-colors">
            <Search size={14} className="text-surface-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search reviews..."
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-surface-400"
            />
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-xl border border-surface-200 py-16 text-center">
              <p className="text-sm text-surface-400">Loading reviews…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-surface-200 py-16 text-center">
              <Star size={32} className="text-surface-200 mx-auto mb-3" />
              <p className="text-sm text-surface-400">No reviews found</p>
            </div>
          ) : (
            filtered.map(review => (
              <ReviewCard key={review.id} review={review} onAction={handleAction} />
            ))
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <p className="text-xs text-surface-400 text-center">Showing {filtered.length} review{filtered.length !== 1 ? "s" : ""}</p>
        )}
      </div>
    </div>
  );
}
