"use client";
import { useState } from "react";
import {
  CalendarCheck, CheckCircle2, Clock, XCircle, Star,
  Download, Search, X, Phone, Mail, MapPin, Users,
  DollarSign, MessageSquare, ChevronRight, Eye,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import StatsCard from "@/components/StatsCard";
import DataTable from "@/components/DataTable";
import { SAMPLE_BOOKINGS } from "@/lib/data";

const AVATAR_COLORS = [
  "bg-pink-500", "bg-violet-500", "bg-blue-500", "bg-green-500",
  "bg-orange-500", "bg-teal-500", "bg-rose-500", "bg-indigo-500",
];

const STATUS_TABS = [
  { key: "all",         label: "All" },
  { key: "new",         label: "New" },
  { key: "pending",     label: "Pending" },
  { key: "confirmed",   label: "Confirmed" },
  { key: "cancelled",   label: "Cancelled" },
  { key: "completed",   label: "Completed" },
];

const STATUS_BADGE = {
  new:         "badge badge-info",
  pending:     "badge badge-warning",
  confirmed:   "badge badge-success",
  cancelled:   "badge badge-danger",
  negotiating: "badge badge-purple",
  completed:   "badge badge-gray",
};

const EVENT_BADGE = {
  Wedding:      "badge badge-purple",
  Birthday:     "badge badge-info",
  Christening:  "badge badge-success",
  "Office Event":"badge badge-gray",
  Engagement:   "badge badge-warning",
};

const TIMELINE_STEPS = [
  { key: "inquiry",      label: "Inquiry" },
  { key: "vendor_reply", label: "Vendor Reply" },
  { key: "negotiation",  label: "Negotiation" },
  { key: "confirmed",    label: "Confirmed" },
  { key: "completed",    label: "Completed" },
];

const STATUS_TO_STEP = {
  new:         0,
  pending:     1,
  negotiating: 2,
  confirmed:   3,
  completed:   4,
  cancelled:   -1,
};

function StatusBadge({ status }) {
  return (
    <span className={STATUS_BADGE[status] || "badge badge-gray"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function EventBadge({ event }) {
  return (
    <span className={EVENT_BADGE[event] || "badge badge-gray"}>
      {event}
    </span>
  );
}

function BookingDrawer({ booking, onClose }) {
  const [selectedStatus, setSelectedStatus] = useState(booking.status);
  const [note, setNote] = useState("");
  const activeStep = STATUS_TO_STEP[booking.status] ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer panel */}
      <div className="w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 sticky top-0 bg-white z-10">
          <div>
            <p className="text-xs text-surface-400 font-medium">Booking Detail</p>
            <h2 className="text-base font-bold text-surface-900">{booking.id}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-surface-50 transition-colors cursor-pointer bg-white"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          {/* Status Timeline */}
          <div className="bg-surface-50 rounded-xl p-4 border border-surface-200">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-4">Status Timeline</p>
            {booking.status === "cancelled" ? (
              <div className="flex items-center gap-2 text-danger-600 text-sm font-semibold">
                <XCircle size={16} />
                This booking was cancelled
              </div>
            ) : (
              <div className="flex items-center gap-0">
                {TIMELINE_STEPS.map((step, i) => (
                  <div key={step.key} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                        i < activeStep
                          ? "bg-primary-600 border-primary-600 text-white"
                          : i === activeStep
                          ? "bg-primary-600 border-primary-600 text-white ring-4 ring-primary-100"
                          : "bg-white border-surface-200 text-surface-400"
                      }`}>
                        {i < activeStep ? <CheckCircle2 size={14} /> : i + 1}
                      </div>
                      <span className={`text-[10px] font-semibold whitespace-nowrap ${
                        i <= activeStep ? "text-primary-600" : "text-surface-400"
                      }`}>{step.label}</span>
                    </div>
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mb-5 mx-0.5 transition-colors ${
                        i < activeStep ? "bg-primary-600" : "bg-surface-200"
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="rounded-xl border border-surface-200 p-4 space-y-3">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Customer</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-white">{booking.customer.charAt(0)}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-800">{booking.customer}</p>
                <p className="text-xs text-surface-400">Customer account</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2 text-xs text-surface-500">
                <Phone size={12} className="text-surface-400" />
                <span>+374 91 000 000</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-surface-500">
                <Mail size={12} className="text-surface-400" />
                <span>customer@example.com</span>
              </div>
            </div>
          </div>

          {/* Vendor Info */}
          <div className="rounded-xl border border-surface-200 p-4 space-y-3">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Vendor</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-500 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-white">{booking.vendor.charAt(0)}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-800">{booking.vendor}</p>
                <p className="text-xs text-surface-400">{booking.service}</p>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="rounded-xl border border-surface-200 p-4 space-y-3">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Event Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-surface-400 uppercase tracking-wide mb-0.5">Event Type</p>
                <EventBadge event={booking.event} />
              </div>
              <div>
                <p className="text-[10px] text-surface-400 uppercase tracking-wide mb-0.5">Event Date</p>
                <p className="text-sm font-semibold text-surface-700">{booking.eventDate}</p>
              </div>
              <div>
                <p className="text-[10px] text-surface-400 uppercase tracking-wide mb-0.5">Guests</p>
                <div className="flex items-center gap-1.5">
                  <Users size={12} className="text-surface-400" />
                  <p className="text-sm font-semibold text-surface-700">{booking.guests}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-surface-400 uppercase tracking-wide mb-0.5">Budget</p>
                <div className="flex items-center gap-1.5">
                  <DollarSign size={12} className="text-surface-400" />
                  <p className="text-sm font-bold text-surface-900">{booking.budget}</p>
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-surface-400 uppercase tracking-wide mb-0.5">Location</p>
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-surface-400" />
                  <p className="text-sm text-surface-600">{booking.city}</p>
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-surface-400 uppercase tracking-wide mb-0.5">Special Requests</p>
                <p className="text-sm text-surface-500 italic">No special requests noted.</p>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="rounded-xl border border-surface-200 p-4 space-y-4">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Admin Actions</p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-surface-600">Update Status</label>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm text-surface-700 bg-white focus:outline-none focus:border-primary-400 cursor-pointer"
              >
                {["new","pending","confirmed","cancelled","negotiating","completed"].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-surface-600">Add Internal Note</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Write an internal note visible only to admins..."
                rows={3}
                className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm text-surface-700 resize-none focus:outline-none focus:border-primary-400 placeholder:text-surface-300"
              />
              <button className="w-full py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors cursor-pointer border-0">
                Save Changes
              </button>
            </div>

            <div className="space-y-2 pt-1">
              <p className="text-xs font-semibold text-surface-600">Contact Parties</p>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-2 py-2 rounded-lg border border-surface-200 text-sm font-semibold text-surface-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer bg-white">
                  <Mail size={13} />
                  Email Customer
                </button>
                <button className="flex items-center justify-center gap-2 py-2 rounded-lg border border-surface-200 text-sm font-semibold text-surface-600 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 transition-colors cursor-pointer bg-white">
                  <MessageSquare size={13} />
                  Message Vendor
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const counts = {
    all:       SAMPLE_BOOKINGS.length,
    new:       SAMPLE_BOOKINGS.filter(b => b.status === "new").length,
    pending:   SAMPLE_BOOKINGS.filter(b => b.status === "pending").length,
    confirmed: SAMPLE_BOOKINGS.filter(b => b.status === "confirmed").length,
    cancelled: SAMPLE_BOOKINGS.filter(b => b.status === "cancelled").length,
    completed: SAMPLE_BOOKINGS.filter(b => b.status === "completed").length,
  };

  const filtered = SAMPLE_BOOKINGS.filter(b => {
    if (activeTab !== "all" && b.status !== activeTab) return false;
    if (search && !`${b.id} ${b.customer} ${b.vendor} ${b.service}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const columns = [
    {
      key: "id",
      label: "Booking ID",
      sortable: true,
      render: (val) => <span className="text-sm font-bold text-primary-600">{val}</span>,
    },
    {
      key: "customer",
      label: "Customer",
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full ${AVATAR_COLORS[row.id?.replace(/\D/g,"") % AVATAR_COLORS.length || 0]} flex items-center justify-center flex-shrink-0`}>
            <span className="text-xs font-bold text-white">{val.charAt(0)}</span>
          </div>
          <span className="text-sm font-semibold text-surface-800">{val}</span>
        </div>
      ),
    },
    {
      key: "vendor",
      label: "Vendor",
      render: (val) => <span className="text-sm text-surface-600">{val}</span>,
    },
    {
      key: "service",
      label: "Service",
      render: (val) => <span className="text-sm text-surface-600 max-w-[160px] truncate block">{val}</span>,
    },
    {
      key: "event",
      label: "Event Type",
      render: (val) => <EventBadge event={val} />,
    },
    {
      key: "eventDate",
      label: "Event Date",
      sortable: true,
      render: (val) => <span className="text-xs text-surface-500">{val}</span>,
    },
    {
      key: "guests",
      label: "Guests",
      render: (val) => <span className="text-sm font-semibold text-surface-700">{val}</span>,
    },
    {
      key: "budget",
      label: "Budget",
      render: (val) => <span className="text-sm font-bold text-surface-900">{val}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: "id",
      label: "Actions",
      render: (val, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedBooking(row); }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-surface-200 text-xs font-semibold text-surface-600 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 transition-colors cursor-pointer bg-white"
        >
          <Eye size={12} />
          View
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        title="Bookings & Inquiries"
        actions={
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-surface-200 text-sm font-semibold text-surface-600 hover:bg-surface-50 transition-colors cursor-pointer bg-white">
            <Download size={14} />
            Export
          </button>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatsCard label="Total Bookings" value="889" icon={CalendarCheck} iconBg="bg-violet-50" iconColor="text-violet-500" />
          <StatsCard label="Confirmed"      value="412" icon={CheckCircle2}  iconBg="bg-green-50"  iconColor="text-green-500"  />
          <StatsCard label="Pending"        value="203" icon={Clock}         iconBg="bg-amber-50"  iconColor="text-amber-500"  />
          <StatsCard label="Cancelled"      value="87"  icon={XCircle}       iconBg="bg-red-50"    iconColor="text-red-500"    />
          <StatsCard label="Completed"      value="187" icon={Star}          iconBg="bg-blue-50"   iconColor="text-blue-500"   />
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-surface-200 p-4 space-y-3">
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

          {/* Search + Date Range + Export */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-surface-50 rounded-lg px-3 py-2 border border-surface-200 w-[260px] gap-2 focus-within:border-primary-400 transition-colors">
              <Search size={14} className="text-surface-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search bookings..."
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-surface-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="border border-surface-200 rounded-lg px-3 py-2 text-sm text-surface-600 bg-surface-50 focus:outline-none focus:border-primary-400 cursor-pointer"
              />
              <span className="text-xs text-surface-400">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="border border-surface-200 rounded-lg px-3 py-2 text-sm text-surface-600 bg-surface-50 focus:outline-none focus:border-primary-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* DataTable — rows clickable */}
        <div>
          <DataTable
            columns={columns}
            data={filtered}
            searchable={false}
            pageSize={8}
            searchKeys={["id", "customer", "vendor", "service"]}
          />
        </div>
      </div>

      {/* Drawer */}
      {selectedBooking && (
        <BookingDrawer
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
