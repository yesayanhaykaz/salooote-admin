"use client";
import { useState, useEffect } from "react";
import { Star, Reply, Flag, MessageSquare, X, Check, TrendingUp } from "lucide-react";
import TopBar from "@/components/TopBar";
import { vendorAPI } from "@/lib/api";
import { useLocale } from "@/lib/i18n";

function StarRow({ rating, size = 14, color = "text-warning-500" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={size} className={s <= rating ? `${color} fill-current` : "text-surface-200 fill-current"} />
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

function fmtDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function VendorReviews() {
  const { t } = useLocale();
  const [reviews, setReviews]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showUnanswered, setShowUnanswered] = useState(false);
  const [replyOpen, setReplyOpen]       = useState({});
  const [replyText, setReplyText]       = useState({});
  const [replies, setReplies]           = useState({});
  const [reportOpen, setReportOpen]     = useState(null);
  const [reportReason, setReportReason] = useState("");

  useEffect(() => {
    vendorAPI.reviews({ limit: 50 })
      .then(res => setReviews(res?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Filter tabs: value → i18n key
  const FILTER_TABS = [
    { value: "all",  label: t("common.all") },
    { value: "5",    label: t("reviews.stars_5") },
    { value: "4",    label: t("reviews.stars_4") },
    { value: "3",    label: t("reviews.stars_3") },
    { value: "2",    label: t("reviews.stars_2") },
    { value: "1",    label: t("reviews.stars_1") },
  ];

  const REPORT_REASONS = [
    t("reviews.report_fake"),
    t("reviews.report_offensive"),
    t("reviews.report_irrelevant"),
    t("reviews.report_competitor"),
    t("reviews.report_other"),
  ];

  const filtered = reviews.filter(r => {
    if (activeFilter !== "all" && r.rating !== parseInt(activeFilter)) return false;
    if (showUnanswered && replies[r.id]) return false;
    return true;
  });

  const handleSendReply = (id) => {
    if (!replyText[id]?.trim()) return;
    setReplies(prev => ({ ...prev, [id]: replyText[id] }));
    setReplyOpen(prev => ({ ...prev, [id]: false }));
    setReplyText(prev => ({ ...prev, [id]: "" }));
  };

  const handleReport = () => { setReportOpen(null); setReportReason(""); };

  const totalReviews = reviews.length;
  const avgRating    = totalReviews > 0
    ? (reviews.reduce((a, r) => a + (r.rating || 0), 0) / totalReviews).toFixed(1)
    : "0.0";
  const responseRate = totalReviews > 0
    ? Math.round((Object.keys(replies).length / totalReviews) * 100)
    : 0;

  const STAR_DIST = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    const pct   = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, count, pct };
  });

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title={t("reviews.title")} subtitle={t("reviews.subtitle")} />

      <main className="flex-1 p-6 space-y-5">
        {/* Rating Overview */}
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="flex flex-wrap gap-6 items-start">
            <div className="flex flex-col items-center text-center px-4">
              <span className="text-5xl font-black text-surface-900 leading-none">{avgRating}</span>
              <StarRow rating={Math.round(parseFloat(avgRating))} size={18} />
              <p className="text-xs text-surface-400 mt-1">{totalReviews} {t("reviews.reviews_suffix")}</p>
              <span className="mt-2 flex items-center gap-1 text-xs font-semibold text-success-600 bg-success-50 px-2.5 py-1 rounded-full">
                <TrendingUp size={11} /> {t("reviews.this_month_change")}
              </span>
            </div>

            <div className="flex-1 min-w-[200px] space-y-2">
              {STAR_DIST.map(({ stars, count, pct }) => (
                <div key={stars} className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5 w-14 flex-shrink-0">
                    <span className="text-xs text-surface-600 font-medium">{stars}</span>
                    <Star size={11} className="text-warning-500 fill-current" />
                  </div>
                  <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
                    <div className="h-full bg-warning-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[11px] text-surface-400 w-8 text-right flex-shrink-0">{pct}%</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center text-center px-4 border-l border-surface-100">
              <div className="w-16 h-16 rounded-full border-4 border-primary-200 flex items-center justify-center mb-1">
                <span className="text-lg font-black text-primary-700">{responseRate}%</span>
              </div>
              <p className="text-xs font-semibold text-surface-700">{t("reviews.response_rate")}</p>
              <p className="text-[11px] text-surface-400 mt-0.5">{Object.keys(replies).length} {t("reviews.replied_suffix")}</p>
              <span className="mt-1.5 text-[10px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{t("reviews.good")}</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {FILTER_TABS.map(f => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                activeFilter === f.value
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-white text-surface-600 border-surface-200 hover:border-primary-300"
              }`}
            >
              {f.label}
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
              <MessageSquare size={11} /> {t("reviews.unanswered")}
            </button>
          </div>
          <span className="ml-auto text-xs text-surface-400">{filtered.length} {t("reviews.reviews_suffix")}</span>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-surface-400">{t("reviews.loading")}</div>
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="bg-white rounded-xl border border-surface-200 p-10 text-center">
                <Star size={32} className="text-surface-200 mx-auto mb-2" />
                <p className="text-sm font-semibold text-surface-500">{t("reviews.empty_text")}</p>
              </div>
            )}
            {filtered.map((review, idx) => {
              const hasReply    = !!replies[review.id];
              const isReplyOpen = replyOpen[review.id];
              const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const initial     = (review.user_name || "?")[0].toUpperCase();

              return (
                <div key={review.id} className="bg-white rounded-xl border border-surface-200 p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar initial={initial} color={avatarColor} />
                      <div>
                        <p className="text-sm font-semibold text-surface-900">{review.user_name || t("reviews.anonymous")}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StarRow rating={review.rating} size={12} />
                          <span className="text-[11px] text-surface-400">{fmtDate(review.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {review.status === "flagged" && (
                        <span className="badge badge-danger">{t("reviews.flagged")}</span>
                      )}
                      <span className="text-[11px] text-surface-400 bg-surface-50 px-2 py-0.5 rounded-md border border-surface-100">
                        {review.target_type || "Service"}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-surface-700 leading-relaxed mb-3">{review.body}</p>

                  {hasReply && (
                    <div className="bg-primary-50 border border-primary-100 rounded-xl p-3.5 mb-3">
                      <p className="text-[10px] font-bold text-primary-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Reply size={11} /> {t("reviews.vendor_response")}
                      </p>
                      <p className="text-xs text-surface-700 leading-relaxed">{replies[review.id]}</p>
                    </div>
                  )}

                  {isReplyOpen && !hasReply && (
                    <div className="mb-3 border border-surface-200 rounded-xl p-3 bg-surface-50">
                      <textarea
                        value={replyText[review.id] || ""}
                        onChange={e => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                        placeholder={t("reviews.reply_placeholder")}
                        rows={3}
                        className="w-full text-xs text-surface-700 bg-white border border-surface-200 rounded-lg p-2.5 resize-none placeholder:text-surface-400 focus:outline-none focus:border-primary-400 transition"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setReplyOpen(prev => ({ ...prev, [review.id]: false }))}
                          className="px-3 py-1.5 text-xs font-medium text-surface-500 hover:text-surface-700 cursor-pointer border-none bg-transparent"
                        >
                          {t("common.clear")}
                        </button>
                        <button
                          onClick={() => handleSendReply(review.id)}
                          disabled={!replyText[review.id]?.trim()}
                          className="px-4 py-1.5 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer border-none"
                        >
                          {t("reviews.submit_reply")}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-surface-50">
                    {!hasReply && (
                      <button
                        onClick={() => setReplyOpen(prev => ({ ...prev, [review.id]: !prev[review.id] }))}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer border-none"
                      >
                        <Reply size={12} /> {t("reviews.reply")}
                      </button>
                    )}
                    {hasReply && (
                      <span className="flex items-center gap-1 text-xs font-medium text-success-600">
                        <Check size={12} /> {t("reviews.replied_label")}
                      </span>
                    )}
                    <button
                      onClick={() => setReportOpen(review.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-surface-400 hover:text-danger-500 transition-colors cursor-pointer border-none bg-transparent ml-auto"
                    >
                      <Flag size={12} /> {t("reviews.report")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Report Modal */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-surface-200 shadow-elevated w-[360px]">
            <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-surface-900">{t("reviews.report_title")}</h3>
              <button onClick={() => setReportOpen(null)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-100 transition-colors cursor-pointer border-none bg-transparent">
                <X size={14} className="text-surface-500" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-xs text-surface-500 mb-4">{t("reviews.report_subtitle")}</p>
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
                  {t("common.clear")}
                </button>
                <button
                  onClick={handleReport}
                  disabled={!reportReason}
                  className="px-4 py-2 bg-danger-500 text-white text-xs font-semibold rounded-lg hover:bg-danger-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer border-none"
                >
                  {t("reviews.submit_report")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
