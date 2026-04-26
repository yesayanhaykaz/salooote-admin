"use client";
import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Lock, X, Clock, User, Package, ShoppingBag, MapPin, Phone } from "lucide-react";
import TopBar from "@/components/TopBar";
import { vendorAPI } from "@/lib/api";
import { useLocale } from "@/lib/i18n";

const MONTH_KEYS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
const DAY_KEYS   = ["mon","tue","wed","thu","fri","sat","sun"];

const STATUS_CHIP = {
  confirmed:   "bg-success-500 text-white",
  pending:     "bg-warning-500 text-white",
  processing:  "bg-info-500 text-white",
  in_progress: "bg-info-500 text-white",
  shipped:     "bg-info-500 text-white",
  delivered:   "bg-success-500 text-white",
  completed:   "bg-surface-400 text-white",
  cancelled:   "bg-danger-200 text-danger-600",
};

const STATUS_BADGE = {
  confirmed:   "bg-success-50 text-success-700 border-success-200",
  pending:     "bg-warning-50 text-warning-700 border-warning-200",
  processing:  "bg-info-50 text-info-700 border-info-200",
  shipped:     "bg-info-50 text-info-700 border-info-200",
  delivered:   "bg-success-50 text-success-700 border-success-200",
  cancelled:   "bg-danger-50 text-danger-700 border-danger-200",
};

function fmtAmount(total, currency) {
  if (total == null) return "";
  return `${currency || "AMD"} ${Number(total).toLocaleString()}`;
}

function fmtTime(iso, time) {
  if (time) return time;
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  } catch { return null; }
}

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
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blockedDays, setBlockedDays] = useState(new Set());
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [workingDays, setWorkingDays] = useState(WORKING_DAYS_DEFAULT);
  const [selectedDay, setSelectedDay] = useState(null); // {year, month, day} for detail modal

  useEffect(() => {
    Promise.all([
      vendorAPI.bookings({ limit: 200 }).catch(() => null),
      vendorAPI.orders({ limit: 200 }).catch(() => null),
    ]).then(([bRes, oRes]) => {
      setBookings(bRes?.data || []);
      setOrders(oRes?.data || []);
    }).finally(() => setLoading(false));
  }, []);

  // Merge bookings + orders into a unified "events" stream by date
  const events = useMemo(() => {
    const out = [];
    bookings.forEach(b => {
      if (!b.event_date) return;
      out.push({
        kind: "booking",
        id: b.id,
        date: b.event_date,
        time: b.event_time || fmtTime(b.event_date),
        title: b.event_type || "Booking",
        customer: b.user_name || b.customer_name,
        phone: b.customer_phone,
        location: b.location,
        status: (b.status || "pending").toLowerCase(),
        guest_count: b.guest_count,
        budget: b.budget,
        notes: b.notes,
      });
    });
    orders.forEach(o => {
      const refDate = o.event_date || o.delivery_date;
      if (!refDate) return;
      out.push({
        kind: "order",
        id: o.id,
        date: refDate,
        time: o.event_time || o.delivery_time || null,
        title: (o.items?.[0]?.product_name || "Order") + (o.items?.length > 1 ? ` +${o.items.length - 1}` : ""),
        customer: o.user_name || o.shipping_name || o.customer_name,
        phone: o.customer_phone || o.shipping_phone,
        address: o.shipping_address,
        status: (o.status || "pending").toLowerCase(),
        total: o.total,
        currency: o.currency,
        items: o.items,
        notes: o.notes,
      });
    });
    return out;
  }, [bookings, orders]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach(ev => {
      const d = new Date(ev.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(ev);
      }
    });
    // Sort each day by time
    Object.values(map).forEach(arr => arr.sort((a, b) => (a.time || "").localeCompare(b.time || "")));
    return map;
  }, [events, year, month]);

  const selectedDayEvents = selectedDay
    ? (eventsByDay[selectedDay.day] || [])
    : [];

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

  const upcoming = events
    .filter(ev => ev.date && new Date(ev.date) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
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
                    return <div key={`empty-${idx}`} className="min-h-[100px] border-b border-r border-surface-50 bg-surface-50/50 last:border-r-0" />;
                  }
                  const isBlocked = blockedDays.has(day);
                  const isToday   = isCurrentMonth && day === today;
                  const dayEvents = eventsByDay[day] || [];
                  const hasEvents = dayEvents.length > 0;
                  const col = idx % 7;
                  const isWeekend = col === 5 || col === 6;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        if (hasEvents) {
                          setSelectedDay({ year, month, day });
                        } else {
                          toggleBlock(day);
                        }
                      }}
                      className={`min-h-[100px] p-2 border-b border-r border-surface-100 last:border-r-0 relative transition-colors text-left cursor-pointer w-full ${
                        isBlocked ? "bg-danger-50" : isWeekend ? "bg-surface-50/60" : "bg-white"
                      } ${hasEvents ? "hover:bg-primary-50/40 ring-inset hover:ring-1 hover:ring-primary-200" : "hover:bg-primary-50/30"} border-l-0 border-t-0 font-[inherit]`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-semibold ${
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
                        {hasEvents && (
                          <span className="text-[9px] font-bold text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded-full">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>

                      {isBlocked && !hasEvents && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <Lock size={10} className="text-danger-400" />
                          <span className="text-[9px] text-danger-400 font-medium">{t("calendar.blocked")}</span>
                        </div>
                      )}

                      <div className="space-y-0.5 mt-0.5">
                        {dayEvents.slice(0, 3).map(ev => (
                          <div
                            key={`${ev.kind}-${ev.id}`}
                            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md truncate flex items-center gap-1 ${STATUS_CHIP[ev.status] || "bg-surface-200 text-surface-700"}`}
                            title={`${ev.title} — ${ev.customer || ""}`}
                          >
                            {ev.kind === "order" ? <ShoppingBag size={8} className="flex-shrink-0" /> : <CalendarDays size={8} className="flex-shrink-0" />}
                            <span className="truncate">{ev.title}</span>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-[9px] font-semibold text-primary-600 pl-1">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </button>
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
                {upcoming.map(ev => {
                  const d = new Date(ev.date);
                  const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  return (
                    <button
                      key={`${ev.kind}-${ev.id}`}
                      type="button"
                      onClick={() => setSelectedDay({ year: d.getFullYear(), month: d.getMonth(), day: d.getDate() })}
                      className="w-full text-left px-4 py-3 hover:bg-surface-50 transition-colors cursor-pointer border-none bg-transparent"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-surface-800 truncate flex items-center gap-1">
                            {ev.kind === "order" ? <ShoppingBag size={10} className="flex-shrink-0 text-primary-500" /> : <CalendarDays size={10} className="flex-shrink-0 text-primary-500" />}
                            {ev.customer || t("calendar.client_fallback")}
                          </p>
                          <p className="text-[11px] text-surface-500 truncate">{ev.title}</p>
                        </div>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 border ${STATUS_BADGE[ev.status] || "bg-surface-50 text-surface-600 border-surface-200"}`}>
                          {ev.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-surface-400 flex items-center gap-1"><CalendarDays size={10} />{label}</span>
                        {ev.time && <span className="text-[10px] text-surface-400 flex items-center gap-1"><Clock size={10} />{ev.time}</span>}
                      </div>
                    </button>
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

      {selectedDay && (
        <DayDetailModal
          day={selectedDay}
          events={selectedDayEvents}
          t={t}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}

/* ── Day detail modal — shows all events for a single day ──────── */
function DayDetailModal({ day, events, onClose, t }) {
  const dateObj = new Date(day.year, day.month, day.day);
  const dateLabel = dateObj.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const counts = {
    order: events.filter(e => e.kind === "order").length,
    booking: events.filter(e => e.kind === "booking").length,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-surface-50 w-full max-w-2xl shadow-2xl rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[90vh] sm:max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-surface-400">Day Schedule</p>
            <p className="text-base font-bold text-surface-900 mt-0.5">{dateLabel}</p>
            <div className="mt-2 flex items-center gap-3 text-xs text-surface-500">
              {counts.order > 0 && (
                <span className="inline-flex items-center gap-1">
                  <ShoppingBag size={12} className="text-primary-500" /> {counts.order} order{counts.order !== 1 ? "s" : ""}
                </span>
              )}
              {counts.booking > 0 && (
                <span className="inline-flex items-center gap-1">
                  <CalendarDays size={12} className="text-primary-500" /> {counts.booking} booking{counts.booking !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-100 cursor-pointer border-none bg-transparent transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {events.length === 0 ? (
            <div className="py-16 text-center text-sm text-surface-400">No events on this day.</div>
          ) : (
            events.map(ev => (
              <div key={`${ev.kind}-${ev.id}`} className="bg-white rounded-2xl border border-surface-200 p-4 hover:border-primary-200 hover:shadow-sm transition-all">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    ev.kind === "order" ? "bg-primary-50 text-primary-600" : "bg-violet-50 text-violet-600"
                  }`}>
                    {ev.kind === "order" ? <ShoppingBag size={16} /> : <CalendarDays size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-surface-900 leading-snug truncate">{ev.title}</p>
                        <p className="text-xs text-surface-500 mt-0.5 flex items-center gap-2 flex-wrap">
                          {ev.time && (
                            <span className="inline-flex items-center gap-1">
                              <Clock size={11} className="text-surface-400" /> {ev.time}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <User size={11} className="text-surface-400" /> {ev.customer || "—"}
                          </span>
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border flex-shrink-0 ${STATUS_BADGE[ev.status] || "bg-surface-50 text-surface-600 border-surface-200"}`}>
                        {ev.status}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {ev.phone && (
                        <a href={`tel:${ev.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 text-surface-600 hover:text-primary-600 transition-colors">
                          <Phone size={11} className="text-surface-400" />{ev.phone}
                        </a>
                      )}
                      {ev.location && (
                        <p className="flex items-center gap-1.5 text-surface-600">
                          <MapPin size={11} className="text-surface-400" />{ev.location}
                        </p>
                      )}
                      {ev.address && (
                        <p className="flex items-center gap-1.5 text-surface-600 sm:col-span-2 truncate">
                          <MapPin size={11} className="text-surface-400" />{ev.address}
                        </p>
                      )}
                      {ev.guest_count && (
                        <p className="flex items-center gap-1.5 text-surface-600">
                          <User size={11} className="text-surface-400" />{ev.guest_count} guests
                        </p>
                      )}
                      {ev.total != null && (
                        <p className="flex items-center gap-1.5 font-bold text-surface-900">
                          <Package size={11} className="text-surface-400" />{fmtAmount(ev.total, ev.currency)}
                        </p>
                      )}
                    </div>

                    {/* Items list (orders) */}
                    {ev.kind === "order" && ev.items?.length > 0 && (
                      <div className="mt-3 space-y-1 border-t border-surface-100 pt-2.5">
                        {ev.items.slice(0, 3).map((it, i) => (
                          <div key={i} className="text-xs text-surface-600 flex items-center justify-between">
                            <span className="truncate">{it.product_name || "Item"} × {it.quantity}</span>
                            <span className="text-surface-400 ml-2 flex-shrink-0">{fmtAmount(Number(it.unit_price || 0) * Number(it.quantity || 0), ev.currency)}</span>
                          </div>
                        ))}
                        {ev.items.length > 3 && (
                          <p className="text-[11px] text-surface-400 italic">+{ev.items.length - 3} more item{ev.items.length - 3 !== 1 ? "s" : ""}</p>
                        )}
                      </div>
                    )}

                    {ev.notes && (
                      <p className="mt-2 text-xs text-surface-500 italic bg-surface-50 rounded-lg px-2.5 py-1.5 border border-surface-100">
                        {ev.notes}
                      </p>
                    )}

                    {/* Quick action */}
                    <div className="mt-3">
                      <a
                        href={ev.kind === "order" ? `/vendor/orders` : `/vendor/inquiries`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors no-underline"
                      >
                        Open in {ev.kind === "order" ? "Orders" : "Inquiries"} →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
