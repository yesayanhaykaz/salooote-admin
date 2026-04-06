"use client";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import TopBar from "@/components/TopBar";
import DataTable from "@/components/DataTable";

const SAMPLE_EVENTS = [
  { id: 1, name: "Arman & Nare's Wedding",    customer: "Arman Mkrtchyan",  type: "Wedding",    date: "May 18, 2025",  budget: "$3,200", vendors: 4, status: "confirmed"  },
  { id: 2, name: "Hayk's 30th Birthday",       customer: "Hayk Grigoryan",   type: "Birthday",   date: "Apr 20, 2025",  budget: "$850",   vendors: 2, status: "confirmed"  },
  { id: 3, name: "TechStart Annual Party",     customer: "TechStart LLC",    type: "Corporate",  date: "Jun 5, 2025",   budget: "$5,000", vendors: 5, status: "planning"   },
  { id: 4, name: "Lili's Sweet 16",            customer: "Lilit Sargsyan",   type: "Birthday",   date: "Apr 28, 2025",  budget: "$1,100", vendors: 3, status: "confirmed"  },
  { id: 5, name: "Aram & Sona's Engagement",   customer: "Aram Petrosyan",   type: "Party",      date: "May 3, 2025",   budget: "$2,400", vendors: 3, status: "confirmed"  },
  { id: 6, name: "Summer Garden Party",        customer: "Tigran Avetisyan", type: "Party",      date: "Jul 12, 2025",  budget: "$1,800", vendors: 2, status: "planning"   },
  { id: 7, name: "Anna's Baby Shower",         customer: "Anna Hovhannisyan",type: "Party",      date: "Apr 15, 2025",  budget: "$600",   vendors: 1, status: "confirmed"  },
  { id: 8, name: "Gevorg & Mari's Wedding",    customer: "Gevorg Danielyan",  type: "Wedding",    date: "Sep 6, 2025",   budget: "$4,500", vendors: 6, status: "planning"   },
];

const TYPE_STYLES = {
  Wedding:   "bg-rose-50 text-rose-700",
  Birthday:  "bg-pink-50 text-pink-700",
  Party:     "bg-violet-50 text-violet-700",
  Corporate: "bg-blue-50 text-blue-700",
};

function TypeBadge({ type }) {
  return (
    <span className={`badge ${TYPE_STYLES[type] || "bg-surface-100 text-surface-600"}`}>
      {type}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    confirmed: "badge badge-success",
    planning:  "badge badge-info",
    cancelled: "badge badge-danger",
    completed: "badge badge-gray",
  };
  return (
    <span className={map[status] || "badge badge-gray"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function EventsPage() {
  const columns = [
    {
      key: "name",
      label: "Event Name",
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="text-sm font-semibold text-surface-800">{val}</p>
          <p className="text-xs text-surface-400 mt-0.5">#{row.id}</p>
        </div>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-primary-600">{val.charAt(0)}</span>
          </div>
          <span className="text-sm text-surface-700">{val}</span>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (val) => <TypeBadge type={val} />,
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
      render: (val) => <span className="text-sm text-surface-600 font-medium">{val}</span>,
    },
    {
      key: "budget",
      label: "Budget",
      render: (val) => <span className="text-sm font-bold text-surface-900">{val}</span>,
    },
    {
      key: "vendors",
      label: "Vendors",
      render: (val) => (
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center">{val}</span>
          <span className="text-xs text-surface-400">assigned</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: "id",
      label: "Actions",
      render: () => (
        <div className="flex items-center gap-1.5">
          <button className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer bg-white" title="View">
            <Eye size={13} />
          </button>
          <button className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 transition-colors cursor-pointer bg-white" title="Edit">
            <Pencil size={13} />
          </button>
          <button className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer bg-white" title="Delete">
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  const totalBudget    = SAMPLE_EVENTS.reduce((acc, e) => acc + parseInt(e.budget.replace(/[$,]/g, "")), 0);
  const confirmedCount = SAMPLE_EVENTS.filter(e => e.status === "confirmed").length;
  const planningCount  = SAMPLE_EVENTS.filter(e => e.status === "planning").length;

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        title="Events"
        actions={
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700 transition-colors cursor-pointer border-0">
            <Plus size={14} />
            Add Event
          </button>
        }
      />

      <div className="flex-1 p-6 space-y-5">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Events",    value: SAMPLE_EVENTS.length,                      color: "text-primary-600"  },
            { label: "Confirmed",       value: confirmedCount,                              color: "text-success-600"  },
            { label: "Planning",        value: planningCount,                               color: "text-info-600"     },
            { label: "Total Budget",    value: `$${totalBudget.toLocaleString()}`,          color: "text-surface-900"  },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-surface-200 px-5 py-4">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-surface-400 font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={SAMPLE_EVENTS}
          searchKeys={["name", "customer", "type", "status"]}
          pageSize={8}
        />
      </div>
    </div>
  );
}
