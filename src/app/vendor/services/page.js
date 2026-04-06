"use client";
import { Plus, Pencil, Eye } from "lucide-react";
import TopBar from "@/components/TopBar";
import DataTable from "@/components/DataTable";

const SERVICES = [
  { id: 1, name: "Wedding Photography",  priceRange: "$800–$2,500", duration: "8 hrs",  bookings: 24, category: "Photography", status: "active", gradient: "from-pink-400 to-rose-500" },
  { id: 2, name: "Event Coverage",       priceRange: "$400–$1,200", duration: "4–6 hrs",bookings: 38, category: "Photography", status: "active", gradient: "from-violet-400 to-purple-500" },
  { id: 3, name: "Custom Wedding Cakes", priceRange: "$250–$800",   duration: "3 days", bookings: 47, category: "Bakery",      status: "active", gradient: "from-amber-400 to-orange-500" },
  { id: 4, name: "Party Cake Packages",  priceRange: "$95–$350",    duration: "2 days", bookings: 78, category: "Bakery",      status: "active", gradient: "from-emerald-400 to-green-500" },
  { id: 5, name: "Catering Sets",        priceRange: "$300–$1,500", duration: "1 day",  bookings: 12, category: "Catering",    status: "active", gradient: "from-blue-400 to-indigo-500" },
  { id: 6, name: "Venue Decoration",     priceRange: "$500–$3,000", duration: "1 day",  bookings: 19, category: "Decor",       status: "draft",  gradient: "from-teal-400 to-cyan-500" },
];

const listColumns = [
  {
    key: "name", label: "Service", sortable: true,
    render: (val, row) => (
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${row.gradient} flex-shrink-0`} />
        <span className="font-medium text-surface-800">{val}</span>
      </div>
    ),
  },
  { key: "category",   label: "Category",    sortable: true },
  { key: "priceRange", label: "Price Range",  sortable: false },
  { key: "duration",   label: "Duration",     sortable: false },
  { key: "bookings",   label: "Bookings",     sortable: true  },
  {
    key: "status", label: "Status",
    render: val => <span className={`badge ${val === "active" ? "badge-success" : "badge-gray"}`}>{val}</span>,
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

export default function VendorServices() {
  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar
        title="My Services"
        actions={
          <button className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none">
            <Plus size={15} /> Add Service
          </button>
        }
      />

      <main className="flex-1 p-6 space-y-6">
        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {SERVICES.map(svc => (
            <div key={svc.id} className="bg-white rounded-xl border border-surface-200 overflow-hidden hover:shadow-elevated transition-shadow fade-in">
              {/* Gradient Image */}
              <div className={`h-32 bg-gradient-to-br ${svc.gradient} flex items-center justify-center relative`}>
                <span className="text-white text-4xl font-bold opacity-30">{svc.name.charAt(0)}</span>
                <span className={`absolute top-3 right-3 badge ${svc.status === "active" ? "badge-success" : "badge-gray"}`}>{svc.status}</span>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-surface-900 mb-1">{svc.name}</h3>
                <p className="text-xs text-surface-400 mb-3">{svc.category}</p>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-base font-bold text-primary-600">{svc.priceRange}</p>
                    <p className="text-xs text-surface-400">{svc.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-surface-900">{svc.bookings}</p>
                    <p className="text-xs text-surface-400">bookings</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none">
                    <Eye size={12} /> View
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-surface-600 bg-surface-100 rounded-lg hover:bg-surface-200 transition-colors cursor-pointer border-none">
                    <Pencil size={12} /> Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* List View */}
        <div>
          <h2 className="text-sm font-semibold text-surface-700 mb-3">All Services</h2>
          <DataTable
            columns={listColumns}
            data={SERVICES}
            searchable
            searchKeys={["name", "category", "status"]}
            pageSize={6}
          />
        </div>
      </main>
    </div>
  );
}
