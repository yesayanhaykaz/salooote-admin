"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Lock, User, Clock } from "lucide-react";
import TopBar from "@/components/TopBar";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// April 2025 starts on Tuesday (offset = 1 for Mon-based grid)
const APRIL_OFFSET = 1; // 0=Mon, 1=Tue...
const APRIL_DAYS   = 30;

const BOOKINGS_APRIL = [
  { day: 5,  client: "Anna H.",    event: "Wedding",      status: "confirmed",  id: "BK-501" },
  { day: 9,  client: "Tigran A.",  event: "Birthday",     status: "pending",    id: "BK-502" },
  { day: 12, client: "Lilit S.",   event: "Birthday",     status: "confirmed",  id: "BK-503" },
  { day: 15, client: "Nare G.",    event: "Christening",  status: "confirmed",  id: "BK-504" },
  { day: 19, client: "Karen M.",   event: "Corporate",    status: "pending",    id: "BK-505" },
  { day: 22, client: "Sona K.",    event: "Engagement",   status: "confirmed",  id: "BK-506" },
  { day: 26, client: "Aram P.",    event: "Wedding",      status: "confirmed",  id: "BK-507" },
  { day: 30, client: "Davit H.",   event: "Birthday",     status: "pending",    id: "BK-508" },
];

const BLOCKED_DAYS = new Set([13, 14]); // initial blocked days

const STATUS_CHIP = {
  confirmed: "bg-success-500 text-white",
  pending:   "bg-warning-500 text-white",
};

const WORKING_DAYS_DEFAULT = { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: false };

export default function VendorCalendar() {
  const [blockedDays, setBlockedDays] = useState(BLOCKED_DAYS);
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd]   = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [workingDays, setWorkingDays] = useState(WORKING_DAYS_DEFAULT);
  const [selectedDay, setSelectedDay] = useState(null);

  // Build grid cells: total cells = APRIL_OFFSET + APRIL_DAYS, padded to multiple of 7
  const totalCells = Math.ceil((APRIL_OFFSET + APRIL_DAYS) / 7) * 7;
  const cells = Array.from({ length: totalCells }, (_, i) => {
    const day = i - APRIL_OFFSET + 1;
    return day >= 1 && day <= APRIL_DAYS ? day : null;
  });

  const bookingsByDay = {};
  BOOKINGS_APRIL.forEach(b => {
    if (!bookingsByDay[b.day]) bookingsByDay[b.day] = [];
    bookingsByDay[b.day].push(b);
  });

  const handleBlockDates = () => {
    if (!blockStart || !blockEnd) return;
    const start = parseInt(blockStart.split("-")[2]);
    const end   = parseInt(blockEnd.split("-")[2]);
    const newBlocked = new Set(blockedDays);
    for (let d = start; d <= end; d++) newBlocked.add(d);
    setBlockedDays(newBlocked);
    setBlockStart(""); setBlockEnd(""); setBlockReason("");
  };

  const toggleBlock = (day) => {
    const newBlocked = new Set(blockedDays);
    if (newBlocked.has(day)) newBlocked.delete(day);
    else newBlocked.add(day);
    setBlockedDays(newBlocked);
  };

  const upcomingBookings = BOOKINGS_APRIL
    .filter(b => b.day >= 7)
    .slice(0, 5);

  const today = 7; // simulating today = Apr 7

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title="Calendar" subtitle="Manage your bookings and availability" />

      <main className="flex-1 p-6">
        <div className="flex gap-5 h-full">
          {/* Calendar (left) */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Month navigation */}
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-100 transition-colors cursor-pointer border-none bg-transparent">
                  <ChevronLeft size={16} className="text-surface-500" />
                </button>
                <h2 className="text-sm font-bold text-surface-900">April 2025</h2>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-100 transition-colors cursor-pointer border-none bg-transparent">
                  <ChevronRight size={16} className="text-surface-500" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-surface-100">
                {DAYS_OF_WEEK.map(d => (
                  <div key={d} className={`py-2.5 text-center text-[11px] font-semibold ${d === "Sun" || d === "Sat" ? "text-danger-400" : "text-surface-400"}`}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7">
                {cells.map((day, idx) => {
                  if (!day) {
                    return <div key={`empty-${idx}`} className="min-h-[90px] border-b border-r border-surface-50 bg-surface-50/50 last:border-r-0" />;
                  }
                  const isBlocked  = blockedDays.has(day);
                  const isToday    = day === today;
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
                      {/* Day number */}
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

                      {/* Blocked label */}
                      {isBlocked && !dayBookings.length && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <Lock size={10} className="text-danger-400" />
                          <span className="text-[9px] text-danger-400 font-medium">Blocked</span>
                        </div>
                      )}

                      {/* Booking chips */}
                      <div className="space-y-0.5 mt-0.5">
                        {dayBookings.map(b => (
                          <div
                            key={b.id}
                            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md truncate ${STATUS_CHIP[b.status]}`}
                          >
                            {b.event}
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
              <p className="text-xs font-semibold text-surface-500">Legend:</p>
              {[
                { color: "bg-success-500", label: "Confirmed" },
                { color: "bg-warning-500", label: "Pending" },
                { color: "bg-danger-100 border border-danger-200", label: "Blocked" },
                { color: "bg-white border border-surface-200", label: "Available" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded ${color}`} />
                  <span className="text-xs text-surface-600">{label}</span>
                </div>
              ))}
              <p className="text-[11px] text-surface-400 ml-2">Click empty day to block/unblock</p>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-[280px] flex-shrink-0 space-y-4">
            {/* Upcoming Bookings */}
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-100">
                <h3 className="text-sm font-semibold text-surface-900">Upcoming Bookings</h3>
              </div>
              <div className="divide-y divide-surface-50">
                {upcomingBookings.map(b => (
                  <div key={b.id} className="px-4 py-3 hover:bg-surface-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-surface-800 truncate">{b.client}</p>
                        <p className="text-[11px] text-surface-500 truncate">{b.event}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                        b.status === "confirmed" ? "bg-success-50 text-success-600" : "bg-warning-50 text-warning-600"
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <CalendarDays size={10} className="text-surface-400" />
                      <span className="text-[10px] text-surface-400">Apr {b.day}, 2025</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Block Dates */}
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-100">
                <h3 className="text-sm font-semibold text-surface-900">Block Dates</h3>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-surface-500 block mb-1">From</label>
                  <input
                    type="date"
                    value={blockStart}
                    onChange={e => setBlockStart(e.target.value)}
                    className="w-full text-xs border border-surface-200 rounded-lg px-3 py-2 text-surface-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-surface-500 block mb-1">To</label>
                  <input
                    type="date"
                    value={blockEnd}
                    onChange={e => setBlockEnd(e.target.value)}
                    className="w-full text-xs border border-surface-200 rounded-lg px-3 py-2 text-surface-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-surface-500 block mb-1">Reason (optional)</label>
                  <input
                    type="text"
                    value={blockReason}
                    onChange={e => setBlockReason(e.target.value)}
                    placeholder="e.g. Vacation, Personal"
                    className="w-full text-xs border border-surface-200 rounded-lg px-3 py-2 text-surface-700 placeholder:text-surface-300 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleBlockDates}
                  disabled={!blockStart || !blockEnd}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-danger-500 text-white text-xs font-semibold rounded-lg hover:bg-danger-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer border-none"
                >
                  <Lock size={12} /> Block Dates
                </button>
              </div>
            </div>

            {/* Availability Settings */}
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-100">
                <h3 className="text-sm font-semibold text-surface-900">Availability Settings</h3>
              </div>
              <div className="p-4">
                <p className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider mb-2">Working Days</p>
                <div className="grid grid-cols-4 gap-1.5 mb-4">
                  {Object.keys(workingDays).map(d => (
                    <button
                      key={d}
                      onClick={() => setWorkingDays(prev => ({ ...prev, [d]: !prev[d] }))}
                      className={`text-[10px] font-semibold py-1.5 rounded-lg transition-colors cursor-pointer border ${
                        workingDays[d]
                          ? "bg-primary-600 text-white border-primary-600"
                          : "bg-white text-surface-400 border-surface-200 hover:border-surface-300"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                <p className="text-[11px] font-semibold text-surface-500 uppercase tracking-wider mb-2">Time Slots</p>
                <div className="space-y-1.5">
                  {[
                    { label: "Morning",   time: "08:00 – 12:00" },
                    { label: "Afternoon", time: "12:00 – 17:00" },
                    { label: "Evening",   time: "17:00 – 22:00" },
                  ].map(slot => (
                    <label key={slot.label} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" defaultChecked className="w-3.5 h-3.5 accent-primary-600" />
                      <span className="text-xs text-surface-700 flex-1">{slot.label}</span>
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
