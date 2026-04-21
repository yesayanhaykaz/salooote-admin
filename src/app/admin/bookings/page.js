"use client";
import { useState, useEffect, useCallback } from "react";
import {
  CalendarCheck, CheckCircle2, Clock, XCircle, Star,
  Download, Search, X, Phone, Mail, MapPin, Users,
  DollarSign, MessageSquare, ChevronRight, Eye,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import StatsCard from "@/components/StatsCard";
import DataTable from "@/components/DataTable";
import { adminBookingsAPI } from "@/lib/api";

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
  Wedding:       "badge badge-purple",
  Birthday:      "badge badge-info",
  Christening:   "badge badge-success",
  "Office Event":"badge badge-gray",
  Engagement:    "badge badge-warning",
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

function fmt(dateStr) {
  if (!dateStr) return "—";
  try { return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
  catch { return dateStr; }
}

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
      {event || "—"}
    </span>
  );
}

function BookingDrawer({ booking, onClose, onStatusUpdate }) {
  const [selectedStatus, setSelectedStatus] = useState(booking.status);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const activeStep = STATUS_TO_STEP[booking.status] ?? 0;

  const customerName = booking.user_name || booking.user?.first_name || "Unknown";
  const vendorName   = booking.vendor?.business_name || "—";
  const serviceName  = booking.service?.name || "—";

  async function handleSave() {
    if (selectedStatus === booking.status) return;
    setSaving(true);
    try {
      await adminBookingsAPI.updateStatus(booking.id, selectedStatus);
      onStatusUpdate(booking.id, selectedStatus);
      onClose();
    } catch (e) {
      alert(e.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  }

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
            <h2 className="text-base font-bold text-surface-900 truncate max-w-[200px]">{booking.id}</h2>
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
                <span className="text-sm font-bold text-white">{customerName.charAt(0)}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-800">{customerName}</p>
                <p className="text-xs text-surface-400">Customer account</p>
              </div>
            </div>
          </div>

          {/* Vendor Info */}
          <div className="rounded-xl border border-surface-200 p-4 space-y-3">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Vendor</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-500 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-white">{vendorName.charAt(0)}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-800">{vendorName}</p>
                <p className="text-xs text-surface-400">{serviceName}</p>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="rounded-xl border border-surface-200 p-4 space-y-3">
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Event Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-surface-400 uppercase tracking-wide mb-0.5">Event Type</p>
                <EventBadge event={booking.event_type} />
              </div>
              <div>
                <p className="text-[10px] text-surface-400 uppercase tracking-wide mb-0.5">Event Date</p>
                <p className="text-sm font-semibold text-surface-700">{fmt(booking.event_date)}</p>
              </div>
              <div>
                <p className="text-[10px] text-surface-400 uppercase tracking-wide mb-0.5">Guests</p>
                <div className="flex items-center gap-1.5">
                  <Users size={12} className="text-surface-400" />
                  <p className="text-sm font-semibold text-surface-700">{booking.guest_count ?? "—"}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-surface-400 uppercase tracking-wide mb-0.5">Budget</p>
                <div className="flex items-center gap-1.5">
                  <DollarSign size={12} className="text-surface-400" />
                  <p className="text-sm font-bold text-surface-900">{booking.budget ? `$${booking.budget}` : "—"}</p>
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-surface-400 uppercase tracking-wide mb-0.5">Location</p>
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-surface-400" />
                  <p className="text-sm text-surface-600">{booking.location || "—"}</p>
                </div>
              </div>
              {booking.notes && (
                <div className="col-span-2">
                  <p className="text-[10px] text-surface-400 uppercase tracking-wide mb-0.5">Notes</p>
                  <p className="text-sm text-surface-500 italic">{booking.notes}</p>
                </div>
              )}
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
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors cursor-pointer border-0 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save Changes"}
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
  const [bookings, setBookings]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState("all");
  const [search, setSearch]           = useState("");
  const [dateFrom, setDateFrom]       = useState("");
  const [dateTo, setDateTo]           = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 200, page: 1 };
      if (activeTab !== "all") params.status = activeTab;
      const res = await adminBookingsAPI.list(params);
      setBookings(res?.data?.items || res?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  function handleStatusUpdate(id, status) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  }

  const counts = {
    all:       bookings.length,
    new:       bookings.filter(b => b.status === "new").length,
    pending:   bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
    completed: bookings.filter(b => b.status === "completed").length,
  };

  const filtered = bookings.filter(b => {
    if (search) {
      const name = b.user_name || b.user?.first_name || "";
      const vendor = b.vendor?.business_name || "";
      const service = b.service?.name || "";
      if (!`${b.id} ${name} ${vendor} ${service}`.toLowerCase().includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const columns = [
    {
      key: "id",
      label: "Booking ID",
      sortable: true,
      render: (val) => <span className="text-xs font-bold text-primary-600 truncate max-w-[100px] block">{val}</span>,
    },
    {
      key: "user_name",
      label: "Customer",
      sortable: true,
      render: (val, row) => {
        const name = val || row.user?.first_name || "Unknown";
        return (
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full ${AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]} flex items-center justify-center flex-shrink-0`}>
              <span className="text-xs font-bold text-white">{name.charAt(0)}</span>
            </div>
            <span className="text-sm font-semibold text-surface-800">{name}</span>
          </div>
        );
      },
    },
    {
      key: "vendor",
      label: "Vendor",
      render: (val) => <span className="text-sm text-surface-600">{val?.business_name || "—"}</span>,
    },
    {
      key: "event_type",
      label: "Event Type",
      render: (val) => <EventBadge event={val} />,
    },
    {
      key: "event_date",
      label: "Event Date",
      sortable: true,
      render: (val) => <span className="text-xs text-surface-500">{fmt(val)}</span>,
    },
    {
      key: "guest_count",
      label: "Guests",
      render: (val) => <span className="text-sm font-semibold text-surface-700">{val ?? "—"}</span>,
    },
    {
      key: "budget",
      label: "Budget",
      render: (val) => <span className="text-sm font-bold text-surface-900">{val ? `$${val}` : "—"}</span>,
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
          <StatsCard label="Total Bookings" value={counts.all}       icon={CalendarCheck} iconBg="bg-violet-50" iconColor="text-violet-500" />
          <StatsCard label="Confirmed"      value={counts.confirmed} icon={CheckCircle2}  iconBg="bg-green-50"  iconColor="text-green-500"  />
          <StatsCard label="Pending"        value={counts.pending}   icon={Clock}         iconBg="bg-amber-50"  iconColor="text-amber-500"  />
          <StatsCard label="Cancelled"      value={counts.cancelled} icon={XCircle}       iconBg="bg-red-50"    iconColor="text-red-500"    />
          <StatsCard label="Completed"      value={counts.completed} icon={Star}          iconBg="bg-blue-50"   iconColor="text-blue-500"   />
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

          {/* Search + Date Range */}
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

        {/* DataTable */}
        <div>
          {loading ? (
            <div className="bg-white rounded-xl border border-surface-200 py-16 text-center">
              <p className="text-sm text-surface-400">Loading bookings…</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filtered}
              searchable={false}
              pageSize={8}
              searchKeys={["id", "user_name", "event_type"]}
            />
          )}
        </div>
      </div>

      {/* Drawer */}
      {selectedBooking && (
        <BookingDrawer
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}
