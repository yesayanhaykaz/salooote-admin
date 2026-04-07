"use client";
import { useState } from "react";
import {
  MessageSquare, Paperclip, Send, CheckCircle, Clock, X,
  Star, ChevronDown, Download, AlertCircle, Package
} from "lucide-react";
import TopBar from "@/components/TopBar";

const TABS = ["All", "New", "Replied", "Confirmed", "Completed", "Cancelled"];

const STATUS_MAP = {
  new:       { label: "New",       cls: "badge badge-info" },
  replied:   { label: "Replied",   cls: "badge badge-purple" },
  confirmed: { label: "Confirmed", cls: "badge badge-success" },
  completed: { label: "Completed", cls: "badge badge-gray" },
  cancelled: { label: "Cancelled", cls: "badge badge-danger" },
};

const INQUIRIES = [
  {
    id: 1,
    vendorName: "Sweet Dreams Bakery",
    vendorInitials: "SB",
    vendorInitialsBg: "bg-pink-100 text-pink-600",
    category: "Bakery & Cakes",
    rating: 4.9,
    service: "Custom Wedding Cake (3-tier)",
    eventDate: "Jun 15, 2025",
    guests: 120,
    budget: "$400–$600",
    status: "confirmed",
    lastMessage: "Your booking is confirmed! We'll contact you 2 weeks before the event.",
    timeAgo: "2 hours ago",
    confirmedDate: "April 3, 2025",
    messages: [
      { from: "user",   text: "Hi! I'd like to order a 3-tier wedding cake for 120 guests on June 15. Do you have availability?", time: "Apr 1, 10:22 AM" },
      { from: "vendor", text: "Hello Anna! Yes, we have that date available. We offer 3-tier cakes starting from $450. Would you like to schedule a tasting session?", time: "Apr 1, 2:10 PM" },
      { from: "user",   text: "That sounds perfect! Yes, I'd love a tasting. What days work for you this week?", time: "Apr 2, 9:05 AM" },
    ],
  },
  {
    id: 2,
    vendorName: "DJ Arman Music Studio",
    vendorInitials: "DA",
    vendorInitialsBg: "bg-violet-100 text-violet-600",
    category: "Entertainment",
    rating: 4.7,
    service: "Wedding DJ – 6 Hour Package",
    eventDate: "Jun 15, 2025",
    guests: 120,
    budget: "$500–$700",
    status: "replied",
    lastMessage: "Sure! Our 6-hour package is $580 and includes equipment and lighting.",
    timeAgo: "5 hours ago",
    confirmedDate: null,
    messages: [
      { from: "user",   text: "Hello! I need a DJ for a 120-person wedding on June 15. Do you handle Armenian music requests?", time: "Apr 3, 11:00 AM" },
      { from: "vendor", text: "Hi Anna! Absolutely, we specialize in Armenian & international mix. Our 6-hour package is $580 all-inclusive.", time: "Apr 3, 1:30 PM" },
      { from: "user",   text: "Great price! Can you send me a playlist sample or setlist overview?", time: "Apr 3, 2:00 PM" },
    ],
  },
  {
    id: 3,
    vendorName: "Artisan Flowers Yerevan",
    vendorInitials: "AF",
    vendorInitialsBg: "bg-green-100 text-green-600",
    category: "Florist",
    rating: 4.8,
    service: "Bridal Bouquet + Table Arrangements",
    eventDate: "Jun 15, 2025",
    guests: 120,
    budget: "$300–$500",
    status: "new",
    lastMessage: "You sent an inquiry 2 hours ago.",
    timeAgo: "2 hours ago",
    confirmedDate: null,
    messages: [
      { from: "user", text: "Hi! I need a bridal bouquet and 10 table centerpieces for my June 15 wedding. Can you provide a quote?", time: "Apr 7, 9:15 AM" },
    ],
  },
  {
    id: 4,
    vendorName: "Elite Photography Yerevan",
    vendorInitials: "EP",
    vendorInitialsBg: "bg-blue-100 text-blue-600",
    category: "Photography",
    rating: 5.0,
    service: "Full Day Wedding Photography",
    eventDate: "Jun 15, 2025",
    guests: 120,
    budget: "$700–$900",
    status: "completed",
    lastMessage: "Thank you for choosing us! Your photo album is ready for download.",
    timeAgo: "3 weeks ago",
    confirmedDate: "March 10, 2025",
    messages: [
      { from: "user",   text: "I'd love to book your full-day wedding package for June 15.", time: "Mar 5, 10:00 AM" },
      { from: "vendor", text: "Hi Anna! We'd be honored to capture your special day. Our full-day package is $750.", time: "Mar 5, 12:30 PM" },
      { from: "user",   text: "Perfect. Let's confirm the booking!", time: "Mar 8, 9:00 AM" },
    ],
  },
  {
    id: 5,
    vendorName: "Grand Decor Studio",
    vendorInitials: "GD",
    vendorInitialsBg: "bg-yellow-100 text-yellow-700",
    category: "Decoration",
    rating: 4.6,
    service: "Full Venue Decoration",
    eventDate: "Jun 15, 2025",
    guests: 120,
    budget: "$800–$1,200",
    status: "cancelled",
    lastMessage: "This inquiry was cancelled.",
    timeAgo: "1 week ago",
    confirmedDate: null,
    messages: [
      { from: "user",   text: "Hi! I need full venue decoration for a 120-person wedding. What are your packages?", time: "Mar 20, 8:45 AM" },
      { from: "vendor", text: "Hello! Our full decoration starts at $900. Can we schedule a site visit?", time: "Mar 20, 11:00 AM" },
      { from: "user",   text: "I've decided to go with another vendor. Thank you for your time!", time: "Mar 25, 3:00 PM" },
    ],
  },
];

export default function UserInquiriesPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [selectedId, setSelectedId] = useState(1);
  const [reply, setReply] = useState("");
  const [sent, setSent] = useState({});

  const filtered = activeTab === "All"
    ? INQUIRIES
    : INQUIRIES.filter(i => i.status === activeTab.toLowerCase());

  const selected = INQUIRIES.find(i => i.id === selectedId) || INQUIRIES[0];

  function sendReply() {
    if (!reply.trim()) return;
    setSent(prev => ({ ...prev, [selectedId]: [...(prev[selectedId] || []), { text: reply, time: "Just now" }] }));
    setReply("");
  }

  const tabCount = (tab) => {
    if (tab === "All") return INQUIRIES.length;
    return INQUIRIES.filter(i => i.status === tab.toLowerCase()).length;
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title="My Inquiries" subtitle="Track your vendor conversations" />

      <main className="flex-1 flex flex-col p-6 gap-4">

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-xl px-2 py-1.5 overflow-x-auto w-fit">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === tab ? "bg-primary-600 text-white" : "text-surface-500 hover:bg-surface-100"
              }`}
            >
              {tab}
              {tabCount(tab) > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab ? "bg-white/20 text-white" : "bg-surface-100 text-surface-500"}`}>
                  {tabCount(tab)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Two-panel layout */}
        <div className="flex gap-4 flex-1 min-h-0" style={{ height: "calc(100vh - 200px)" }}>

          {/* Left: Inquiry List */}
          <div className="w-[40%] flex-shrink-0 bg-white rounded-xl border border-surface-200 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center p-6">
                <MessageSquare size={32} className="text-surface-300 mb-2" />
                <p className="text-sm text-surface-400">No inquiries in this category</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-50">
                {filtered.map(inq => (
                  <button
                    key={inq.id}
                    onClick={() => setSelectedId(inq.id)}
                    className={`w-full text-left px-4 py-4 transition-colors hover:bg-surface-50 ${selectedId === inq.id ? "bg-primary-50 border-l-2 border-primary-600" : ""}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${inq.vendorInitialsBg}`}>
                        {inq.vendorInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-surface-900 truncate">{inq.vendorName}</p>
                          <span className="text-[10px] text-surface-400 flex-shrink-0">{inq.timeAgo}</span>
                        </div>
                        <p className="text-xs text-surface-500 truncate">{inq.service}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-surface-400 truncate flex-1">{inq.lastMessage}</p>
                      <span className={STATUS_MAP[inq.status].cls}>{STATUS_MAP[inq.status].label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-surface-400">
                      <Clock size={10} />
                      {inq.eventDate}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Detail View */}
          <div className="flex-1 bg-white rounded-xl border border-surface-200 flex flex-col overflow-hidden">

            {/* Vendor Header */}
            <div className="px-5 py-4 border-b border-surface-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold ${selected.vendorInitialsBg}`}>
                    {selected.vendorInitials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-surface-900">{selected.vendorName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-surface-400">{selected.category}</span>
                      <span className="text-surface-300">·</span>
                      <div className="flex items-center gap-0.5">
                        <Star size={11} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-semibold text-surface-600">{selected.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <span className={STATUS_MAP[selected.status].cls}>{STATUS_MAP[selected.status].label}</span>
              </div>
            </div>

            {/* Inquiry Details */}
            <div className="px-5 py-3 border-b border-surface-100 bg-surface-50">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Service", value: selected.service },
                  { label: "Event Date", value: selected.eventDate },
                  { label: "Guests", value: selected.guests },
                  { label: "Budget", value: selected.budget },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-[10px] text-surface-400 font-medium uppercase tracking-wider">{item.label}</p>
                    <p className="text-xs font-semibold text-surface-700 mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirmed Banner */}
            {selected.status === "confirmed" && (
              <div className="mx-5 mt-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
                <CheckCircle size={15} className="text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-700">Booking Confirmed</p>
                  <p className="text-xs text-green-600">Confirmed on {selected.confirmedDate}</p>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {selected.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-3.5 py-2.5 rounded-xl text-sm ${
                    msg.from === "user"
                      ? "bg-primary-600 text-white rounded-br-sm"
                      : "bg-surface-100 text-surface-800 rounded-bl-sm"
                  }`}>
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.from === "user" ? "text-white/60" : "text-surface-400"}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
              {(sent[selectedId] || []).map((msg, i) => (
                <div key={`sent-${i}`} className="flex justify-end">
                  <div className="max-w-[75%] px-3.5 py-2.5 rounded-xl rounded-br-sm bg-primary-600 text-white text-sm">
                    <p>{msg.text}</p>
                    <p className="text-[10px] mt-1 text-white/60">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Box */}
            {selected.status !== "completed" && selected.status !== "cancelled" && (
              <div className="px-5 py-4 border-t border-surface-100">
                <div className="flex items-end gap-2">
                  <textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder="Write a message…"
                    rows={2}
                    className="flex-1 resize-none border border-surface-200 rounded-xl px-3 py-2.5 text-sm text-surface-700 placeholder:text-surface-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-50 transition-colors"
                  />
                  <div className="flex flex-col gap-2">
                    <button className="w-9 h-9 rounded-xl border border-surface-200 flex items-center justify-center hover:bg-surface-50 transition-colors">
                      <Paperclip size={15} className="text-surface-400" />
                    </button>
                    <button
                      onClick={sendReply}
                      className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center hover:bg-primary-700 transition-colors"
                    >
                      <Send size={15} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="px-5 pb-4 flex items-center gap-2">
              {selected.status !== "cancelled" && selected.status !== "completed" && (
                <button className="flex items-center gap-1.5 text-xs font-medium text-danger-600 border border-danger-200 px-3 py-1.5 rounded-lg hover:bg-danger-50 transition-colors">
                  <X size={13} /> Cancel Inquiry
                </button>
              )}
              <button className="flex items-center gap-1.5 text-xs font-medium text-surface-600 border border-surface-200 px-3 py-1.5 rounded-lg hover:bg-surface-50 transition-colors ml-auto">
                <Download size={13} /> Download Details
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
