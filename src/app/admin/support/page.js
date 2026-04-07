"use client";
import { useState } from "react";
import {
  Headphones, CheckCircle2, Clock, AlertCircle, Inbox,
  ChevronDown, ChevronUp, Send, ArrowUpRight, Check,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import StatsCard from "@/components/StatsCard";
import { SUPPORT_TICKETS } from "@/lib/data";

const STATUS_TABS = [
  { key: "all",         label: "All" },
  { key: "open",        label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved",    label: "Resolved" },
];

const PRIORITY_OPTIONS = ["All", "High", "Medium", "Low"];
const TYPE_OPTIONS     = ["All", "Complaint", "Billing", "Technical", "Dispute"];

const STATUS_BADGE = {
  open:        "badge badge-danger",
  in_progress: "badge badge-warning",
  resolved:    "badge badge-success",
};

const PRIORITY_BADGE = {
  high:   "badge badge-danger",
  medium: "badge badge-warning",
  low:    "badge badge-success",
};

const TYPE_BADGE = {
  complaint: "badge badge-danger",
  billing:   "badge badge-warning",
  technical: "badge badge-info",
  dispute:   "badge badge-purple",
};

const SAMPLE_MESSAGES = [
  {
    from: "customer",
    name: "Anna Hovhannisyan",
    text: "Hi, I submitted an inquiry to the vendor 3 days ago and haven't received any response. Can you please look into this?",
    time: "Apr 5, 2025 — 10:22 AM",
  },
  {
    from: "admin",
    name: "Admin Team",
    text: "Thank you for reaching out. We have sent a follow-up message to the vendor on your behalf. We'll update you within 24 hours.",
    time: "Apr 5, 2025 — 11:45 AM",
  },
];

function TicketRow({ ticket, isExpanded, onToggle, onResolve }) {
  const [reply, setReply] = useState("");
  const [assignee, setAssignee] = useState("Unassigned");

  return (
    <div className={`bg-white rounded-xl border transition-shadow ${
      ticket.priority === "high" ? "border-l-4 border-l-red-400 border-surface-200" :
      ticket.priority === "medium" ? "border-l-4 border-l-amber-400 border-surface-200" :
      "border-surface-200"
    } ${isExpanded ? "shadow-sm" : ""}`}>
      {/* Row Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-surface-50 rounded-xl transition-colors"
        onClick={onToggle}
      >
        {/* Ticket ID + Priority */}
        <div className="flex items-center gap-2 flex-shrink-0 w-32">
          <span className="text-sm font-bold text-primary-600">{ticket.id}</span>
          <span className={PRIORITY_BADGE[ticket.priority] || "badge badge-gray"}>
            {ticket.priority}
          </span>
        </div>

        {/* Subject */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-surface-800 truncate">{ticket.subject}</p>
          <p className="text-xs text-surface-400 mt-0.5">{ticket.from}</p>
        </div>

        {/* Type badge */}
        <span className={`${TYPE_BADGE[ticket.type] || "badge badge-gray"} flex-shrink-0`}>
          {ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1)}
        </span>

        {/* Status + Date */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={STATUS_BADGE[ticket.status] || "badge badge-gray"}>
            {ticket.status === "in_progress" ? "In Progress" : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
          </span>
          <span className="text-xs text-surface-400 hidden sm:block">{ticket.date}</span>
        </div>

        {/* Assign + Resolve */}
        <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <select
            value={assignee}
            onChange={e => setAssignee(e.target.value)}
            className="border border-surface-200 rounded-lg px-2 py-1.5 text-xs text-surface-600 bg-white focus:outline-none focus:border-primary-400 cursor-pointer"
          >
            <option>Unassigned</option>
            <option>Sara M.</option>
            <option>Arman K.</option>
            <option>Hasmik T.</option>
          </select>
          {ticket.status !== "resolved" && (
            <button
              onClick={() => onResolve(ticket.id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-green-200 text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer"
            >
              <Check size={11} />
              Resolve
            </button>
          )}
        </div>

        {/* Expand toggle */}
        <div className="flex-shrink-0 text-surface-400">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded Reply Section */}
      {isExpanded && (
        <div className="border-t border-surface-100 p-4 space-y-4">
          {/* Message history */}
          <div className="space-y-3">
            {SAMPLE_MESSAGES.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.from === "admin" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white ${
                  msg.from === "admin" ? "bg-violet-500" : "bg-pink-500"
                }`}>
                  {msg.name.charAt(0)}
                </div>
                <div className={`max-w-[75%] ${msg.from === "admin" ? "items-end" : "items-start"} flex flex-col`}>
                  <div className={`rounded-xl px-3.5 py-2.5 text-sm ${
                    msg.from === "admin"
                      ? "bg-primary-600 text-white"
                      : "bg-surface-100 text-surface-700"
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-surface-400 mt-1 px-1">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Reply textarea */}
          <div className="space-y-2">
            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder="Type your reply..."
              rows={3}
              className="w-full border border-surface-200 rounded-xl px-4 py-3 text-sm text-surface-700 resize-none focus:outline-none focus:border-primary-400 placeholder:text-surface-300"
            />
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors cursor-pointer border-0">
                <Send size={13} />
                Send Reply
              </button>
              {ticket.status !== "resolved" && (
                <button
                  onClick={() => onResolve(ticket.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 text-sm font-semibold text-green-600 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer"
                >
                  <CheckCircle2 size={13} />
                  Mark Resolved
                </button>
              )}
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-surface-200 text-sm font-semibold text-surface-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer bg-white ml-auto">
                <ArrowUpRight size={13} />
                Escalate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SupportPage() {
  const [tickets, setTickets] = useState(SUPPORT_TICKETS);
  const [activeTab, setActiveTab] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [expandedId, setExpandedId] = useState(null);

  const counts = {
    all:         tickets.length,
    open:        tickets.filter(t => t.status === "open").length,
    in_progress: tickets.filter(t => t.status === "in_progress").length,
    resolved:    tickets.filter(t => t.status === "resolved").length,
  };

  const handleResolve = (id) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "resolved" } : t));
  };

  const filtered = tickets.filter(t => {
    if (activeTab !== "all" && t.status !== activeTab) return false;
    if (priorityFilter !== "All" && t.priority !== priorityFilter.toLowerCase()) return false;
    if (typeFilter !== "All" && t.type !== typeFilter.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Support & Complaints" />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatsCard label="Open Tickets"    value={String(counts.open)}        icon={AlertCircle}  iconBg="bg-red-50"    iconColor="text-red-500"    />
          <StatsCard label="In Progress"     value={String(counts.in_progress)} icon={Clock}        iconBg="bg-amber-50"  iconColor="text-amber-500"  />
          <StatsCard label="Resolved"        value={String(counts.resolved)}    icon={CheckCircle2} iconBg="bg-green-50"  iconColor="text-green-500"  />
          <StatsCard label="Total This Month" value="8"                         icon={Headphones}   iconBg="bg-violet-50" iconColor="text-violet-500" />
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-surface-200 p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Tabs */}
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

            <div className="flex items-center gap-2 ml-auto">
              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="border border-surface-200 rounded-lg px-3 py-2 text-sm text-surface-600 bg-white focus:outline-none focus:border-primary-400 cursor-pointer"
              >
                {PRIORITY_OPTIONS.map(p => <option key={p}>{p}</option>)}
              </select>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="border border-surface-200 rounded-lg px-3 py-2 text-sm text-surface-600 bg-white focus:outline-none focus:border-primary-400 cursor-pointer"
              >
                {TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-surface-200 py-16 text-center">
              <Inbox size={32} className="text-surface-200 mx-auto mb-3" />
              <p className="text-sm text-surface-400">No tickets found</p>
            </div>
          ) : (
            filtered.map(ticket => (
              <TicketRow
                key={ticket.id}
                ticket={ticket}
                isExpanded={expandedId === ticket.id}
                onToggle={() => setExpandedId(prev => prev === ticket.id ? null : ticket.id)}
                onResolve={handleResolve}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
