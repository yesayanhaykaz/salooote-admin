"use client";
import { Plus, Eye, Pencil } from "lucide-react";
import TopBar from "@/components/TopBar";
import DataTable from "@/components/DataTable";

const EVENTS = [
  { id: 1, name: "Hovhannisyan Wedding",   customer: "Anna Hovhannisyan", type: "Wedding",    date: "Jun 14, 2025", budget: "$2,800", status: "confirmed" },
  { id: 2, name: "Petrosyan Birthday",     customer: "Aram Petrosyan",    type: "Birthday",   date: "May 3, 2025",  budget: "$650",   status: "confirmed" },
  { id: 3, name: "Corporate Gala Dinner",  customer: "Tech Corp Armenia", type: "Corporate",  date: "May 20, 2025", budget: "$4,500", status: "planning"  },
  { id: 4, name: "Sargsyan Baby Shower",   customer: "Lilit Sargsyan",    type: "Baby Shower",date: "Apr 26, 2025", budget: "$420",   status: "confirmed" },
  { id: 5, name: "Grigoryan Anniversary",  customer: "Nare Grigoryan",    type: "Anniversary",date: "Jul 8, 2025",  budget: "$1,100", status: "planning"  },
  { id: 6, name: "Karapetyan Graduation",  customer: "Sona Karapetyan",   type: "Graduation", date: "Jun 30, 2025", budget: "$380",   status: "pending"   },
];

const STATUS_BADGE = {
  confirmed: "badge badge-success",
  planning:  "badge badge-info",
  pending:   "badge badge-warning",
  cancelled: "badge badge-danger",
};

const columns = [
  { key: "name",     label: "Event Name",  sortable: true },
  { key: "customer", label: "Customer",    sortable: true },
  { key: "type",     label: "Type",        sortable: true },
  { key: "date",     label: "Date",        sortable: true },
  { key: "budget",   label: "Budget",      sortable: true },
  {
    key: "status", label: "Status",
    render: val => <span className={STATUS_BADGE[val] || "badge badge-gray"}>{val}</span>,
  },
  {
    key: "id", label: "Actions",
    render: () => (
      <div className="flex items-center gap-1.5">
        <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer border-none">
          <Eye size={12} /> View
        </button>
        <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-surface-600 bg-surface-100 rounded-lg hover:bg-surface-200 transition-colors cursor-pointer border-none">
          <Pencil size={12} /> Edit
        </button>
      </div>
    ),
  },
];

export default function VendorEvents() {
  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar
        title="Events"
        actions={
          <button className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none">
            <Plus size={15} /> Create Event Package
          </button>
        }
      />

      <main className="flex-1 p-6">
        <DataTable
          columns={columns}
          data={EVENTS}
          searchable
          searchKeys={["name", "customer", "type", "status"]}
          pageSize={8}
        />
      </main>
    </div>
  );
}
