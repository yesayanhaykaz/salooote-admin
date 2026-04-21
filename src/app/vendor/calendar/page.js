"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Lock } from "lucide-react";
import TopBar from "@/components/TopBar";
import { vendorAPI } from "@/lib/api";
import { useLocale } from "@/lib/i18n";

const MONTH_KEYS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
const DAY_KEYS   = ["mon","tue","wed","thu","fri","sat","sun"];

const STATUS_CHIP = {
  confirmed:   "bg-success-500 text-white",
  pending:     "bg-warning-500 text-white",
  in_progress: "bg-info-500 text-white",
  completed:   "bg-surface-400 text-white",
  cancelled:   "bg-danger-200 text-danger-600",
};

const WORKING_DAYS_DEFAULT = { mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false };

function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;
  return Array.from({ length: totalCells }, (_, i) => {
    const day = i - offset + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });
}

export default function VendorCalendar() {
  const { t } = useLocale();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blockedDays, setBlockedDays] = useState(new Set());
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [workingDays, setWorkingDays] = useState(WORKING_DAYS_DEFAULT);

  useEffect(() => {
    vendorAPI.bookings({ limit: 100 })
      .then(res => setBookings(res?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const bookingsByDay = {};
  bookings.forEach(b => {
    if (!b.event_date) return;
    const d = new Date(b.event_date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!bookingsByDay[day]) bookingsByDay[day] = [];
      bookingsByDay[day].push(b);
    }
  });

  const cells = getMonthGrid(year, month);
  const today = now.getDate();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  const handleBlockDates = () => {
    if (!blockStart || !blockEnd) return;
    const startD = new Date(blockStart);
    const endD   = new Date(blockEnd);
    const newBlocked = new Set(blockedDays);
    for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
      if (d.getFullYear() === year && d.getMonth() === month) {
        newBlocked.add(d.getDate());
      }
    }
    setBlockedDays(newBlocked);
    setBlockStart(""); setBlockEnd(""); setBlockReason("");
  };

  const toggleBlock = (day) => {
    const newBlocked = new Set(blockedDays);
    if (newBlocked.has(day)) newBlocked.delete(day);
    else newBlocked.add(day);
    setBlockedDays(newBlocked);
  };

  const upcoming = bookings
    .filter(b => b.event_date && new Date(b.event_date) >= now)
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
    .slice(0, 5);

  const LEGEND = [
    { color: "bg-success-500",                        label: t("calendar.confirmed") },
    { color: "bg-warning-500",                        label: t("calendar.pending") },
    { color: "bg-danger-100 border border-danger-200", label: t("calendar.blocked") },
    { color: "bg-white border border-surface-200",    label: t("calendar.available") },
  ];

  const TIME_SLOTS = [
    { key: "morning",   time: "08:00 – 12:00" },
    { key: "afternoon", time: "12:00 – 17:00" },
    { key: "evening",   time: "17:00 – 22:00" },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title={t("calendar.title")} subtitle={t("calendar.subtitle")} />

      <main className="flex-1 p-6">
        <div className="flex gap-5 h-full">
          {/* Calendar (left) */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Month navigation */}
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
                <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-100 transition-colors cursor-pointer border-none bg-transparent">
                  <ChevronLeft size={16} className="text-surface-500" />
                </button>
                <h2 className="text-sm font-bold text-surface-900">
                  {t(`calendar.months.${MONTH_KEYS[month]}`)} {year}
                </h2>
                <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-100 transition-colors cursor-pointer border-none bg-transparent">
                  <ChevronRight size={16} className="text-surface-500" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-surface-100">
                {DAY_KEYS.map((key, i) => (
                  <div key={key} className={`py-2.5 text-center text-[11px] font-semibold ${i >= 5 ? "text-danger-400" : "text-surface-400"}`}>
                    {t(`calendar.days.${key}`)}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7">
                {cells.map((day, idx) => {
                  if (!day) {
                    return <div key={`empty-${idx}`} className="min-h-[90px] border-b border-r border-surface-50 bg-surface-50/50 last:border-r-0" />;
                  }
                  const isBlocked   = blockedDays.has(day);
                  const isToday     = isCurrentMonth && day === today;
                  const dayBookings = bookingsByDay[day] || [];
                  const col = idx % 7;
                  const isWeekend = col === 5 || col === 6;

                  return (
                    <div
                      key={day}
                      onClick={() => !dayBookings.length && toggleBlock(day)}
                      className={`min-h-[90px] p-2 border-b border-r border-surface-100 last:border-r-0 relative transition-colors ${
                        isBlocked ? "bg-danger-50" : isWeekend ? "bg-surface-50/60" : "bg-white"
                      } ${!dayBookings.length ? "cursor-pointer hover:bg-primary-50/30" : ""}`}
                    >
                      <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-semibold mb-1 ${
                        isToday
                          ? "bg-primary-600 text-white"
                          : isBlocked
                          ? "text-danger-500"
                          : isWeekend
                          ? "text-surface-400"
                          : "text-surface-700"
                      }`}>
                        {day}
                      </span>

                      {isBlocked && !dayBookings.length && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <Lock size={10} className="text-danger-400" />
                          <span className="text-[9px] text-danger-400 font-medium">{t("calendar.blocked")}</span>
                        </div>
                      )}

                      <div className="space-y-0.5 mt-0.5">
                        {dayBookings.map(b => (
                          <div
                            key={b.id}
                            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md truncate ${STATUS_CHIP[b.status] || "bg-surface-200 text-surface-700"}`}
                          >
                            {b.event_type || b.user_name || t("calendar.booking_fallback")}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-xl border border-surface-200 px-5 py-3 flex items-center gap-6 flex-wrap">
              <p className="text-xs font-semibold text-surface-500">{t("calendar.legend")}</p>
              {LEGEND.map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded ${color}`} />
                  <span className="text-xs text-surface-600">{label}</span>
                </div>
              ))}
              <p className="text-[11px] text-surface-400 ml-2">{t("calendar.click_empty_day")}</p>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-[280px] flex-shrink-0 space-y-4">
            {/* Upcoming Bookings */}
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-100">
                <h3 className="text-sm font-semibold text-surface-900">{t("calendar.upcoming_bookings")}</h3>
              </div>
              <div className="divide-y divide-surface-50">
                {loading && (
                  <div className="px-4 py-6 text-xs text-surface-400 text-center">{t("common.loading")}</div>
                )}
                {!loading && upcoming.length === 0 && (
                  <div className="px-4 py-6 text-xs text-surface-400 text-center">{t("calendar.no_upcoming_bookings")}</div>
                )}
                {upcoming.map(b => {
                  const d = new Date(b.event_date);
                  const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  return (
                    <div key={b.id} className="px-4 py-3 hover:bg-surface-50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-surface-800 truncate">{b.user_name || t("calendar.client_fallback")}</p>
                          <p className="text-[11px] text-surface-500 truncate">{b.event_type || t("calendar.booking_fallback")}</p>
                        </div>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                          b.status === "confirmed" ? "bg-success-50 text-success-600" : "bg-warning-50 text-warning-600"
                        }`}>
                          {t(`calendar.${b.status}`) || b.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <CalendarDays size={10} className="text-surface-400" />
                        <span className="text-[10px] text-surface-400">{label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Block Dates */}
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-100">
                <h3 className="text-sm font-semibold text-surface-900">{t("calendar.block_dates")}</h3>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-surface-500 block mb-1">{t("calendar.from")}</label>
                  <input type="date" value={blockStart} onChange={e => setBlockStart(e.target.value)}
                    className="w-full text-xs border border-surface-200 rounded-lg px-3 py-2 text-surface-700 focus:outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-surface-500 block mb-1">{t("calendar.to")}</label>
                  <input type="date" value={blockEnd} onChange={e => setBlockEnd(e.target.value)}
                    className="w-full text-xs border border-surface-200 rounded-lg px-3 py-2 text-surface-700 focus:outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-surface-500 block mb-1">{t("calendar.reason_optional")}</label>
                  <input type="text" value={blockReason} onChange={e => setBlockReason(e.target.value)}
                    placeholder={t("calendar.reason_placeholder")}
                    className="w-full text-xs border border-surface-200 rounded-lg px-3 py-2 text-surface-700 placeholder:text-surface-300 focus:outline-none" />
                </div>
                <button
                  onClick={handleBlockDates}
                  disabled={!blockStart || !blockEnd}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-danger-500 text-white text-xs font-semibold rounded-lg hover:bg-danger-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer border-none"
                >
                  <Lock size={12} /> {t("calendar.block_dates")}
                </button>
              </div>
            </div>

            {/* Availability Settings */}
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-100">
                <h3 className="text-sm font-semibold text-surface-900">{t("calendar.availability_settings")}</h3>
              </div>
              <div className="p-4">
                <p className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider mb-2">{t("calendar.working_days")}</p>
                <div className="grid grid-cols-4 gap-1.5 mb-4">
                  {DAY_KEYS.map(key => (
                    <button
                      key={key}
                      onClick={() => setWorkingDays(prev => ({ ...prev, [key]: !prev[key] }))}
                      className={`text-[10px] font-semibold py-1.5 rounded-lg transition-colors cursor-pointer border ${
                        workingDays[key]
                          ? "bg-primary-600 text-white border-primary-600"
                          : "bg-white text-surface-400 border-surface-200 hover:border-surface-300"
                      }`}
                    >
                      {t(`calendar.days.${key}`)}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider mb-2">{t("calendar.time_slots")}</p>
                <div className="space-y-1.5">
                  {TIME_SLOTS.map(slot => (
                    <label key={slot.key} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" defaultChecked className="w-3.5 h-3.5 accent-primary-600" />
                      <span className="text-xs text-surface-700 flex-1">{t(`calendar.${slot.key}`)}</span>
                      <span className="text-[10px] text-surface-400">{slot.time}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
