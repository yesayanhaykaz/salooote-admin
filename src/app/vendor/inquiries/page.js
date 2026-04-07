"use client";
import { useState } from "react";
import {
  Inbox, Send, CalendarCheck, X, ChevronDown, Paperclip,
  User, MapPin, Users, DollarSign, Calendar, MessageSquare,
  Clock, Check, AlertCircle,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import StatsCard from "@/components/StatsCard";
import { SAMPLE_INQUIRIES } from "@/lib/data";

const STATUS_CONFIG = {
  new:       { label: "New",       cls: "badge badge-info",    dot: "bg-info-500" },
  replied:   { label: "Replied",   cls: "badge badge-gray",    dot: "bg-surface-400" },
  confirmed: { label: "Confirmed", cls: "badge badge-success", dot: "bg-success-500" },
  pending:   { label: "Pending",   cls: "badge badge-warning", dot: "bg-warning-500" },
  cancelled: { label: "Cancelled", cls: "badge badge-danger",  dot: "bg-danger-500" },
};

const EVENT_COLORS = {
  Wedding:     "bg-pink-50 text-pink-600",
  Birthday:    "bg-blue-50 text-blue-600",
  Christening: "bg-purple-50 text-purple-600",
  "Office Event": "bg-orange-50 text-orange-600",
};

function Avatar({ initial, size = "md", color = "bg-primary-600" }) {
  const sz = size === "lg" ? "w-12 h-12 text-base" : size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center flex-shrink-0`}>
      <span className="text-white font-bold">{initial}</span>
    </div>
  );
}

const AVATAR_COLORS = ["bg-primary-600", "bg-pink-500", "bg-blue-500", "bg-green-500", "bg-orange-500"];

export default function VendorInquiries() {
  const [selected, setSelected] = useState(SAMPLE_INQUIRIES[0]);
  const [replyText, setReplyText] = useState("");
  const [statusMap, setStatusMap] = useState({});
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState({});

  const getStatus = (inq) => statusMap[inq.id] || inq.status;

  const counts = {
    total:     SAMPLE_INQUIRIES.length,
    new:       SAMPLE_INQUIRIES.filter(i => getStatus(i) === "new").length,
    replied:   SAMPLE_INQUIRIES.filter(i => getStatus(i) === "replied").length,
    confirmed: SAMPLE_INQUIRIES.filter(i => getStatus(i) === "confirmed").length,
    pending:   SAMPLE_INQUIRIES.filter(i => getStatus(i) === "pending").length,
  };

  const handleStatusChange = (id, status) => {
    setStatusMap(prev => ({ ...prev, [id]: status }));
    if (selected?.id === id) setSelected(prev => ({ ...prev, _status: status }));
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selected) return;
    handleStatusChange(selected.id, "replied");
    setReplyText("");
  };

  const handleAddNote = () => {
    if (!noteText.trim() || !selected) return;
    setNotes(prev => ({
      ...prev,
      [selected.id]: [...(prev[selected.id] || []), { text: noteText, time: "Just now" }],
    }));
    setNoteText("");
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title="Inquiries" subtitle="Manage client inquiries and requests" />

      <main className="flex-1 p-6 space-y-5 overflow-hidden">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total Inquiries", value: counts.total,     icon: Inbox,         iconBg: "bg-primary-50",  iconColor: "text-primary-600" },
            { label: "New (Unread)",    value: counts.new,        icon: AlertCircle,   iconBg: "bg-info-50",     iconColor: "text-info-600" },
            { label: "Replied",         value: counts.replied,    icon: Send,          iconBg: "bg-surface-100", iconColor: "text-surface-500" },
            { label: "Confirmed",       value: counts.confirmed,  icon: CalendarCheck, iconBg: "bg-success-50",  iconColor: "text-success-600" },
            { label: "Pending",         value: counts.pending,    icon: Clock,         iconBg: "bg-warning-50",  iconColor: "text-warning-600" },
          ].map(s => (
            <StatsCard key={s.label} label={s.label} value={String(s.value)} icon={s.icon} iconBg={s.iconBg} iconColor={s.iconColor} />
          ))}
        </div>

        {/* Two-column layout */}
        <div className="flex gap-5 h-[calc(100vh-280px)] min-h-[520px]">
          {/* Left: Inquiry List (40%) */}
          <div className="w-[40%] flex-shrink-0 bg-white rounded-xl border border-surface-200 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-surface-100 flex items-center justify-between flex-shrink-0">
              <h2 className="text-sm font-semibold text-surface-900">All Inquiries</h2>
              <span className="text-xs text-surface-400">{SAMPLE_INQUIRIES.length} total</span>
            </div>
            <div className="overflow-y-auto flex-1">
              {SAMPLE_INQUIRIES.map((inq, idx) => {
                const status = getStatus(inq);
                const cfg = STATUS_CONFIG[status];
                const isSelected = selected?.id === inq.id;
                const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                const isNew = status === "new";
                return (
                  <button
                    key={inq.id}
                    onClick={() => setSelected(inq)}
                    className={`w-full text-left px-4 py-3.5 border-b border-surface-50 hover:bg-surface-50 transition-colors cursor-pointer ${
                      isSelected ? "bg-primary-50 border-l-2 border-l-primary-600" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar initial={inq.avatar} color={avatarColor} />
                        {isNew && (
                          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-info-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className={`text-xs font-semibold truncate ${isNew ? "text-surface-900" : "text-surface-700"}`}>
                            {inq.from}
                          </p>
                          <span className="text-[10px] text-surface-400 flex-shrink-0">{inq.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${EVENT_COLORS[inq.event] || "bg-surface-100 text-surface-500"}`}>
                            {inq.event}
                          </span>
                          <span className="text-[10px] text-surface-400">{inq.eventDate}</span>
                        </div>
                        <p className="text-[11px] text-surface-500 font-medium truncate mb-1">{inq.service}</p>
                        <p className="text-[11px] text-surface-400 truncate leading-relaxed">{inq.message}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className={cfg.cls}>{cfg.label}</span>
                          {isNew && (
                            <span className="text-[10px] font-bold text-info-600 bg-info-50 px-1.5 py-0.5 rounded-full">NEW</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Detail Panel (60%) */}
          <div className="flex-1 bg-white rounded-xl border border-surface-200 flex flex-col overflow-hidden">
            {selected ? (
              <>
                {/* Detail Header */}
                <div className="px-5 py-4 border-b border-surface-100 flex-shrink-0 bg-surface-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        initial={selected.avatar}
                        size="lg"
                        color={AVATAR_COLORS[SAMPLE_INQUIRIES.findIndex(i => i.id === selected.id) % AVATAR_COLORS.length]}
                      />
                      <div>
                        <h3 className="text-sm font-bold text-surface-900">{selected.from}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${EVENT_COLORS[selected.event] || "bg-surface-100 text-surface-500"}`}>
                            {selected.event}
                          </span>
                          <span className="text-xs text-surface-400 flex items-center gap-1">
                            <Calendar size={11} /> {selected.eventDate}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-surface-400">{selected.id}</span>
                      <span className={STATUS_CONFIG[getStatus(selected)]?.cls}>
                        {STATUS_CONFIG[getStatus(selected)]?.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto">
                  {/* Inquiry Details */}
                  <div className="px-5 py-4 border-b border-surface-100">
                    <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">Inquiry Details</h4>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {[
                        { icon: MessageSquare, label: "Service",    value: selected.service },
                        { icon: Calendar,      label: "Event Date", value: selected.eventDate },
                        { icon: Users,         label: "Guests",     value: `${selected.guests} guests` },
                        { icon: DollarSign,    label: "Budget",     value: selected.budget },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-start gap-2">
                          <div className="w-7 h-7 bg-surface-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Icon size={13} className="text-surface-500" />
                          </div>
                          <div>
                            <p className="text-[10px] text-surface-400 font-medium uppercase tracking-wide">{label}</p>
                            <p className="text-xs text-surface-800 font-semibold">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Message */}
                    <div className="bg-surface-50 rounded-xl p-3.5 border border-surface-100">
                      <p className="text-[10px] text-surface-400 font-medium uppercase tracking-wide mb-1.5">Client Message</p>
                      <p className="text-xs text-surface-700 leading-relaxed">{selected.message}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-5 py-4 border-b border-surface-100">
                    <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleStatusChange(selected.id, "replied")}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none"
                      >
                        <Send size={13} /> Reply
                      </button>
                      <button
                        onClick={() => handleStatusChange(selected.id, "pending")}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-warning-50 text-warning-600 text-xs font-semibold rounded-lg hover:bg-warning-100 transition-colors cursor-pointer border border-warning-200"
                      >
                        <DollarSign size={13} /> Send Offer
                      </button>
                      <button
                        onClick={() => handleStatusChange(selected.id, "confirmed")}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-success-50 text-success-600 text-xs font-semibold rounded-lg hover:bg-success-100 transition-colors cursor-pointer border border-success-200"
                      >
                        <CalendarCheck size={13} /> Confirm Booking
                      </button>
                      <button
                        onClick={() => handleStatusChange(selected.id, "cancelled")}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-danger-50 text-danger-600 text-xs font-semibold rounded-lg hover:bg-danger-100 transition-colors cursor-pointer border border-danger-200"
                      >
                        <X size={13} /> Decline
                      </button>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div className="px-5 py-4 border-b border-surface-100">
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-semibold text-surface-600 whitespace-nowrap">Update Status:</label>
                      <div className="relative">
                        <select
                          value={getStatus(selected)}
                          onChange={e => handleStatusChange(selected.id, e.target.value)}
                          className="appearance-none text-xs font-medium border border-surface-200 rounded-lg px-3 py-2 pr-7 bg-white text-surface-700 cursor-pointer"
                        >
                          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Reply Composer */}
                  <div className="px-5 py-4 border-b border-surface-100">
                    <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">Reply to Client</h4>
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Type your reply here..."
                      rows={4}
                      className="w-full text-xs text-surface-700 border border-surface-200 rounded-xl p-3 resize-none bg-surface-50 placeholder:text-surface-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <button className="flex items-center gap-1.5 text-xs text-surface-500 hover:text-surface-700 transition-colors cursor-pointer border-none bg-transparent">
                        <Paperclip size={13} /> Attach file
                      </button>
                      <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer border-none"
                      >
                        <Send size={12} /> Send Reply
                      </button>
                    </div>
                  </div>

                  {/* Internal Notes */}
                  <div className="px-5 py-4">
                    <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-3">Internal Notes</h4>
                    {(notes[selected.id] || []).length > 0 && (
                      <div className="mb-3 space-y-2">
                        {(notes[selected.id] || []).map((note, i) => (
                          <div key={i} className="bg-warning-50 border border-warning-200 rounded-lg p-2.5">
                            <p className="text-xs text-surface-700">{note.text}</p>
                            <p className="text-[10px] text-surface-400 mt-1">{note.time}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <textarea
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      placeholder="Add internal note (not visible to client)..."
                      rows={2}
                      className="w-full text-xs text-surface-700 border border-surface-200 rounded-xl p-3 resize-none bg-surface-50 placeholder:text-surface-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={handleAddNote}
                        disabled={!noteText.trim()}
                        className="px-3.5 py-1.5 bg-surface-100 text-surface-600 text-xs font-semibold rounded-lg hover:bg-surface-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer border-none"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-14 h-14 bg-surface-100 rounded-full flex items-center justify-center mb-3">
                  <Inbox size={24} className="text-surface-400" />
                </div>
                <p className="text-sm font-semibold text-surface-600">Select an inquiry</p>
                <p className="text-xs text-surface-400 mt-1">Click an inquiry from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
