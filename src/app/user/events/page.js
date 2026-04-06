"use client";
import { useState } from "react";
import { Plus, Calendar, X, Pencil, Users } from "lucide-react";
import TopBar from "@/components/TopBar";

const SAMPLE_EVENTS = [
  {
    id: 1,
    name: "Our Wedding Day",
    type: "Wedding",
    date: "Jun 14, 2025",
    budget: "$5,500",
    vendors: ["Sweet Dreams Bakery", "Salooote Flowers", "Sound Wave DJ"],
    status: "planning",
    gradient: "from-pink-400 to-rose-500",
  },
  {
    id: 2,
    name: "Mum's 60th Birthday",
    type: "Birthday",
    date: "May 3, 2025",
    budget: "$1,200",
    vendors: ["Sweet Dreams Bakery", "Party Planet"],
    status: "confirmed",
    gradient: "from-violet-400 to-purple-500",
  },
  {
    id: 3,
    name: "Office Year-End Party",
    type: "Corporate",
    date: "Dec 20, 2025",
    budget: "$3,800",
    vendors: ["Cater King"],
    status: "planning",
    gradient: "from-blue-400 to-indigo-500",
  },
  {
    id: 4,
    name: "Baby Shower - Ani",
    type: "Baby Shower",
    date: "Apr 26, 2025",
    budget: "$650",
    vendors: ["Bloom Studio", "Sweet Dreams Bakery"],
    status: "confirmed",
    gradient: "from-emerald-400 to-green-500",
  },
];

const STATUS_BADGE = {
  planning:  "badge badge-warning",
  confirmed: "badge badge-success",
  completed: "badge badge-info",
  cancelled: "badge badge-danger",
};

const EVENT_TYPES = ["Wedding", "Birthday", "Baby Shower", "Corporate", "Graduation", "Anniversary", "Other"];

function NewEventModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.4)" }}>
      <div className="bg-white rounded-2xl border border-surface-200 w-full max-w-lg shadow-elevated fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <div>
            <h2 className="text-base font-bold text-surface-900">Plan New Event</h2>
            <p className="text-xs text-surface-400 mt-0.5">Fill in the details to get started</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-100 cursor-pointer border-none bg-transparent text-surface-500">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">Event Name</label>
            <input
              type="text"
              placeholder="e.g. Sarah's Wedding"
              className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">Event Type</label>
            <select className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 transition-colors bg-white">
              <option value="">Select type…</option>
              {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">Event Date</label>
              <input type="date" className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">Budget</label>
              <input type="text" placeholder="$0" className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">Notes</label>
            <textarea
              rows={3}
              placeholder="Any special requirements or notes…"
              className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-surface-600 border border-surface-200 rounded-lg hover:bg-surface-50 cursor-pointer bg-white">
            Cancel
          </button>
          <button onClick={onClose} className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 cursor-pointer border-none">
            <Plus size={14} /> Create Event
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserEvents() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar
        title="My Events"
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none"
          >
            <Plus size={15} /> Plan New Event
          </button>
        }
      />

      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-5">
          {SAMPLE_EVENTS.map(event => (
            <div key={event.id} className="bg-white rounded-xl border border-surface-200 overflow-hidden hover:shadow-elevated transition-shadow fade-in">
              {/* Header Banner */}
              <div className={`h-24 bg-gradient-to-br ${event.gradient} flex items-end px-5 pb-4`}>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="text-white text-base font-bold">{event.name}</p>
                    <p className="text-white/70 text-xs">{event.type}</p>
                  </div>
                  <span className={STATUS_BADGE[event.status]}>{event.status}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-surface-50 rounded-lg p-3">
                    <p className="text-xs text-surface-400 mb-0.5">Date</p>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-primary-500" />
                      <p className="text-sm font-semibold text-surface-800">{event.date}</p>
                    </div>
                  </div>
                  <div className="bg-surface-50 rounded-lg p-3">
                    <p className="text-xs text-surface-400 mb-0.5">Budget</p>
                    <p className="text-sm font-bold text-primary-600">{event.budget}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Users size={12} className="text-surface-400" />
                    <p className="text-xs font-medium text-surface-500">{event.vendors.length} vendor{event.vendors.length !== 1 ? "s" : ""} assigned</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {event.vendors.map((v, i) => (
                      <span key={i} className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">{v}</span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none">
                    View Details
                  </button>
                  <button className="flex items-center justify-center w-9 h-8 text-surface-500 bg-surface-100 rounded-lg hover:bg-surface-200 transition-colors cursor-pointer border-none">
                    <Pencil size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showModal && <NewEventModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
