"use client";
import { useState } from "react";
import {
  ChevronDown, ChevronRight, Plus, CheckCircle, Clock, AlertCircle,
  DollarSign, Users, Calendar, MoreHorizontal
} from "lucide-react";
import TopBar from "@/components/TopBar";

const EVENTS = [
  { id: 1, label: "My Wedding (Jun 15)" },
  { id: 2, label: "Lilit's Birthday (May 3)" },
];

const CHECKLIST_CATEGORIES = [
  {
    id: "venue",
    name: "Venue & Decor",
    color: "text-violet-600",
    bg: "bg-violet-50",
    items: [
      { id: 1, text: "Book wedding venue",           status: "done" },
      { id: 2, text: "Confirm decoration package",   status: "done" },
      { id: 3, text: "Choose floral arrangements",   status: "in-progress" },
      { id: 4, text: "Order table centerpieces",     status: "pending" },
    ],
  },
  {
    id: "catering",
    name: "Catering",
    color: "text-orange-600",
    bg: "bg-orange-50",
    items: [
      { id: 5, text: "Choose catering service",      status: "in-progress" },
      { id: 6, text: "Finalize menu",                status: "pending" },
      { id: 7, text: "Arrange dietary requirements", status: "pending" },
    ],
  },
  {
    id: "entertainment",
    name: "Entertainment",
    color: "text-blue-600",
    bg: "bg-blue-50",
    items: [
      { id: 8, text: "Book DJ / live band",          status: "pending" },
      { id: 9, text: "Plan first dance song",        status: "pending" },
    ],
  },
  {
    id: "photography",
    name: "Photography",
    color: "text-green-600",
    bg: "bg-green-50",
    items: [
      { id: 10, text: "Book wedding photographer",   status: "done" },
      { id: 11, text: "Schedule engagement shoot",   status: "done" },
      { id: 12, text: "Create shot list",            status: "in-progress" },
    ],
  },
  {
    id: "beauty",
    name: "Beauty & Attire",
    color: "text-pink-600",
    bg: "bg-pink-50",
    items: [
      { id: 13, text: "Book hair & makeup artist",   status: "done" },
      { id: 14, text: "Final dress fitting",         status: "pending" },
      { id: 15, text: "Order wedding rings",         status: "done" },
    ],
  },
];

const TIMELINE = [
  { date: "Jan 15",  milestone: "Engaged & planning starts",        status: "done" },
  { date: "Feb 10",  milestone: "Venue booked",                     status: "done" },
  { date: "Mar 18",  milestone: "Photography & catering confirmed",  status: "done" },
  { date: "May 1",   milestone: "Send invitations (120 guests)",     status: "upcoming" },
  { date: "Jun 1",   milestone: "Final fittings & vendor check-ins", status: "upcoming" },
];

const BUDGET_CATEGORIES = [
  { name: "Catering",     spent: 850,  total: 2000, booked: true },
  { name: "Photography",  spent: 700,  total: 800,  booked: true },
  { name: "Flowers",      spent: 300,  total: 500,  booked: true },
  { name: "DJ / Music",   spent: 0,    total: 400,  booked: false },
  { name: "Cake",         spent: 0,    total: 300,  booked: false },
];

const STATUS_ICON = {
  done:        { icon: CheckCircle, cls: "text-green-500", bg: "bg-green-50" },
  "in-progress": { icon: Clock,    cls: "text-blue-500",  bg: "bg-blue-50" },
  pending:     { icon: Clock,      cls: "text-surface-300", bg: "bg-surface-50" },
};

function categoryCompletion(cat) {
  const done = cat.items.filter(i => i.status === "done").length;
  return Math.round((done / cat.items.length) * 100);
}

function totalCompletion() {
  const all = CHECKLIST_CATEGORIES.flatMap(c => c.items);
  return Math.round((all.filter(i => i.status === "done").length / all.length) * 100);
}

export default function PlannerPage() {
  const [activeEvent, setActiveEvent] = useState(1);
  const [collapsed, setCollapsed] = useState({});
  const [items, setItems] = useState(() => {
    const map = {};
    CHECKLIST_CATEGORIES.forEach(cat => {
      cat.items.forEach(item => { map[item.id] = item.status; });
    });
    return map;
  });
  const [addingTask, setAddingTask] = useState(null);
  const [newTaskText, setNewTaskText] = useState("");
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expense, setExpense] = useState({ category: "", vendor: "", amount: "", date: "" });

  function toggleCollapse(id) { setCollapsed(prev => ({ ...prev, [id]: !prev[id] })); }

  function toggleItem(id) {
    setItems(prev => ({ ...prev, [id]: prev[id] === "done" ? "pending" : "done" }));
  }

  const totalBudget = 5000;
  const totalSpent = BUDGET_CATEGORIES.reduce((sum, c) => sum + c.spent, 0);
  const remaining = totalBudget - totalSpent;
  const spentPct = Math.round((totalSpent / totalBudget) * 100);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title="Event Planner" subtitle="Manage your events & budgets" />

      <main className="flex-1 p-6 space-y-5">

        {/* Event Selector */}
        <div className="flex items-center gap-2">
          {EVENTS.map(ev => (
            <button
              key={ev.id}
              onClick={() => setActiveEvent(ev.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeEvent === ev.id
                  ? "bg-primary-600 text-white"
                  : "bg-white border border-surface-200 text-surface-600 hover:bg-surface-50"
              }`}
            >
              {ev.label}
            </button>
          ))}
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-surface-200 text-surface-500 hover:bg-surface-50 transition-colors">
            <Plus size={15} /> Add Event
          </button>
          <div className="ml-auto">
            <span className="text-xs text-surface-400 font-medium">Overall Completion:</span>
            <span className="ml-2 text-sm font-bold text-primary-600">{totalCompletion()}%</span>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

          {/* Left column (60%) */}
          <div className="xl:col-span-3 space-y-6">

            {/* Checklist */}
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-surface-100">
                <h2 className="text-sm font-semibold text-surface-900">Planning Checklist</h2>
              </div>
              <div className="divide-y divide-surface-50">
                {CHECKLIST_CATEGORIES.map(cat => {
                  const pct = categoryCompletion(cat);
                  const isOpen = !collapsed[cat.id];
                  return (
                    <div key={cat.id}>
                      <button
                        onClick={() => toggleCollapse(cat.id)}
                        className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-surface-50 transition-colors"
                      >
                        <div className={`w-7 h-7 rounded-lg ${cat.bg} flex items-center justify-center flex-shrink-0`}>
                          <CheckCircle size={14} className={cat.color} />
                        </div>
                        <span className="flex-1 text-sm font-semibold text-surface-900 text-left">{cat.name}</span>
                        <div className="flex items-center gap-3">
                          <div className="hidden sm:flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${pct === 100 ? "bg-green-500" : "bg-primary-600"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-surface-500 w-8 text-right">{pct}%</span>
                          </div>
                          {isOpen ? <ChevronDown size={15} className="text-surface-400" /> : <ChevronRight size={15} className="text-surface-400" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="pb-2">
                          {cat.items.map(item => {
                            const status = items[item.id] || item.status;
                            const done = status === "done";
                            const SI = STATUS_ICON[status] || STATUS_ICON.pending;
                            return (
                              <div
                                key={item.id}
                                onClick={() => toggleItem(item.id)}
                                className="px-5 py-2.5 flex items-center gap-3 hover:bg-surface-50 transition-colors cursor-pointer"
                              >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${done ? "bg-green-500 border-green-500" : "border-surface-300 hover:border-primary-400"}`}>
                                  {done && <CheckCircle size={12} className="text-white" />}
                                </div>
                                <span className={`text-sm flex-1 ${done ? "line-through text-surface-400" : "text-surface-700"}`}>
                                  {item.text}
                                </span>
                                {!done && status === "in-progress" && (
                                  <span className="badge badge-info text-[10px]">In Progress</span>
                                )}
                              </div>
                            );
                          })}
                          {addingTask === cat.id ? (
                            <div className="px-5 pb-2 flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full border-2 border-dashed border-surface-300 flex-shrink-0" />
                              <input
                                autoFocus
                                value={newTaskText}
                                onChange={e => setNewTaskText(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") { setAddingTask(null); setNewTaskText(""); }}}
                                placeholder="Add task and press Enter…"
                                className="flex-1 text-sm border-b border-surface-200 py-1 outline-none focus:border-primary-400 bg-transparent"
                              />
                            </div>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); setAddingTask(cat.id); }}
                              className="mx-5 mb-1 flex items-center gap-1.5 text-xs text-primary-600 font-medium hover:text-primary-700 transition-colors"
                            >
                              <Plus size={13} /> Add task
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-surface-100">
                <h2 className="text-sm font-semibold text-surface-900">Event Timeline</h2>
              </div>
              <div className="px-5 py-4">
                <div className="relative">
                  <div className="absolute left-[52px] top-4 bottom-4 w-0.5 bg-surface-100" />
                  <div className="space-y-0">
                    {TIMELINE.map((item, i) => {
                      const done = item.status === "done";
                      const overdue = item.status === "overdue";
                      return (
                        <div key={i} className="flex items-start gap-4 py-3">
                          <div className="w-12 text-right flex-shrink-0">
                            <span className="text-xs font-semibold text-surface-400">{item.date}</span>
                          </div>
                          <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 relative z-10 flex items-center justify-center ${done ? "bg-green-500" : overdue ? "bg-danger-500" : "bg-surface-200 border-2 border-surface-300"}`}>
                            {done && <CheckCircle size={10} className="text-white" />}
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${done ? "text-surface-600" : "text-surface-900"}`}>{item.milestone}</p>
                            <span className={`text-[11px] font-semibold ${done ? "text-green-600" : overdue ? "text-danger-600" : "text-blue-600"}`}>
                              {done ? "Completed" : overdue ? "Overdue" : "Upcoming"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right column (40%) */}
          <div className="xl:col-span-2 space-y-6">

            {/* Budget Tracker */}
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-surface-900">Budget Tracker</h2>
                <button
                  onClick={() => setShowExpenseForm(v => !v)}
                  className="flex items-center gap-1 text-xs font-semibold bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus size={13} /> Add Expense
                </button>
              </div>

              <div className="px-5 pt-4 pb-2">
                {/* Budget summary */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
                      <circle cx="40" cy="40" r="32" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                      <circle
                        cx="40" cy="40" r="32" fill="none"
                        stroke="#7c3aed" strokeWidth="10"
                        strokeDasharray={`${2 * Math.PI * 32 * spentPct / 100} ${2 * Math.PI * 32}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-sm font-bold text-surface-900">{spentPct}%</span>
                      <span className="text-[9px] text-surface-400">spent</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div>
                      <p className="text-[10px] text-surface-400 uppercase font-medium tracking-wider">Total Budget</p>
                      <p className="text-lg font-bold text-surface-900">${totalBudget.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-[10px] text-surface-400">Spent</p>
                        <p className="text-sm font-semibold text-danger-600">${totalSpent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-surface-400">Remaining</p>
                        <p className="text-sm font-semibold text-green-600">${remaining.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expense Form */}
                {showExpenseForm && (
                  <div className="mb-4 border border-primary-200 rounded-xl bg-primary-50 p-3 space-y-2">
                    <p className="text-xs font-semibold text-primary-700 mb-2">Add Expense</p>
                    <select
                      value={expense.category}
                      onChange={e => setExpense(p => ({ ...p, category: e.target.value }))}
                      className="w-full border border-surface-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-primary-400"
                    >
                      <option value="">Select category</option>
                      {BUDGET_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                    <input
                      value={expense.vendor}
                      onChange={e => setExpense(p => ({ ...p, vendor: e.target.value }))}
                      placeholder="Vendor name"
                      className="w-full border border-surface-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-primary-400"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={expense.amount}
                        onChange={e => setExpense(p => ({ ...p, amount: e.target.value }))}
                        placeholder="Amount ($)"
                        type="number"
                        className="border border-surface-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-primary-400"
                      />
                      <input
                        value={expense.date}
                        onChange={e => setExpense(p => ({ ...p, date: e.target.value }))}
                        type="date"
                        className="border border-surface-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-primary-400"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => { setShowExpenseForm(false); setExpense({ category: "", vendor: "", amount: "", date: "" }); }}
                        className="flex-1 text-xs font-semibold bg-primary-600 text-white py-1.5 rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Save Expense
                      </button>
                      <button onClick={() => setShowExpenseForm(false)} className="text-xs text-surface-500 px-3 py-1.5 rounded-lg hover:bg-surface-100 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Category breakdowns */}
                <div className="space-y-3 pb-4">
                  {BUDGET_CATEGORIES.map(cat => {
                    const pct = cat.total > 0 ? Math.round((cat.spent / cat.total) * 100) : 0;
                    return (
                      <div key={cat.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-surface-700">{cat.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-surface-400">${cat.spent} / ${cat.total}</span>
                            {!cat.booked && <span className="badge badge-warning text-[10px]">Not booked</span>}
                          </div>
                        </div>
                        <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-danger-500" : pct >= 70 ? "bg-warning-500" : "bg-primary-600"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Guest Count Tracker */}
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-surface-100">
                <h2 className="text-sm font-semibold text-surface-900">Guest Tracker</h2>
              </div>
              <div className="px-5 py-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Invited",   value: 120, color: "text-surface-900", bg: "bg-surface-100" },
                    { label: "Confirmed", value: 87,  color: "text-green-700",   bg: "bg-green-50" },
                    { label: "Declined",  value: 12,  color: "text-danger-700",  bg: "bg-danger-50" },
                    { label: "Pending",   value: 21,  color: "text-warning-700", bg: "bg-warning-50" },
                  ].map(g => (
                    <div key={g.label} className={`${g.bg} rounded-xl px-4 py-3 text-center`}>
                      <p className={`text-2xl font-black ${g.color}`}>{g.value}</p>
                      <p className="text-xs text-surface-500 font-medium mt-0.5">{g.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                    <div className="bg-green-400 rounded-l-full" style={{ width: `${(87/120)*100}%` }} />
                    <div className="bg-danger-400" style={{ width: `${(12/120)*100}%` }} />
                    <div className="bg-yellow-400 rounded-r-full flex-1" />
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {[
                      { label: "Confirmed", cls: "bg-green-400" },
                      { label: "Declined",  cls: "bg-danger-400" },
                      { label: "Pending",   cls: "bg-yellow-400" },
                    ].map(l => (
                      <div key={l.label} className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${l.cls}`} />
                        <span className="text-[11px] text-surface-500">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
