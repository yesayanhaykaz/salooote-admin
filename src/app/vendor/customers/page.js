"use client";
import { Users, UserPlus, RefreshCw, ShoppingCart, Eye, MessageSquare } from "lucide-react";
import TopBar from "@/components/TopBar";
import StatsCard from "@/components/StatsCard";
import DataTable from "@/components/DataTable";

const CUSTOMERS = [
  { id: 1, name: "Anna Hovhannisyan", email: "anna@example.com",   orders: 14, spent: "$1,820", lastOrder: "Apr 5, 2025",  status: "active",   avatar: "A", color: "bg-pink-500" },
  { id: 2, name: "Tigran Avetisyan",  email: "tigran@example.com", orders: 11, spent: "$1,430", lastOrder: "Apr 3, 2025",  status: "active",   avatar: "T", color: "bg-blue-500" },
  { id: 3, name: "Sona Karapetyan",   email: "sona@example.com",   orders: 5,  spent: "$620",   lastOrder: "Apr 4, 2025",  status: "active",   avatar: "S", color: "bg-purple-500" },
  { id: 4, name: "Lilit Sargsyan",    email: "lilit@example.com",  orders: 7,  spent: "$940",   lastOrder: "Mar 28, 2025", status: "active",   avatar: "L", color: "bg-green-500" },
  { id: 5, name: "Nare Grigoryan",    email: "nare@example.com",   orders: 3,  spent: "$360",   lastOrder: "Mar 31, 2025", status: "active",   avatar: "N", color: "bg-orange-500" },
  { id: 6, name: "Davit Hakobyan",    email: "davit@example.com",  orders: 2,  spent: "$250",   lastOrder: "Mar 15, 2025", status: "inactive", avatar: "D", color: "bg-red-400" },
  { id: 7, name: "Karen Martirosyan", email: "karen@example.com",  orders: 8,  spent: "$1,100", lastOrder: "Apr 1, 2025",  status: "active",   avatar: "K", color: "bg-teal-500" },
  { id: 8, name: "Aram Petrosyan",    email: "aram@example.com",   orders: 6,  spent: "$780",   lastOrder: "Mar 30, 2025", status: "active",   avatar: "A", color: "bg-indigo-500" },
];

const columns = [
  {
    key: "name", label: "Customer", sortable: true,
    render: (val, row) => (
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-full ${row.color} flex items-center justify-center flex-shrink-0`}>
          <span className="text-white text-xs font-bold">{row.avatar}</span>
        </div>
        <span className="font-medium text-surface-800">{val}</span>
      </div>
    ),
  },
  { key: "email",     label: "Email",         sortable: true  },
  { key: "orders",    label: "Total Orders",  sortable: true  },
  { key: "spent",     label: "Total Spent",   sortable: true  },
  { key: "lastOrder", label: "Last Order",    sortable: true  },
  {
    key: "status", label: "Status",
    render: val => (
      <span className={`badge ${val === "active" ? "badge-success" : "badge-gray"}`}>{val}</span>
    ),
  },
  {
    key: "id", label: "Actions",
    render: (_, row) => (
      <div className="flex items-center gap-1.5">
        <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer border-none">
          <Eye size={12} /> View
        </button>
        <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-surface-600 bg-surface-100 rounded-lg hover:bg-surface-200 transition-colors cursor-pointer border-none">
          <MessageSquare size={12} /> Message
        </button>
      </div>
    ),
  },
];

export default function VendorCustomers() {
  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title="Customers" />

      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard label="Total Customers"    value="187"  change={9}  changeLabel="vs last month" icon={Users}       iconBg="bg-violet-50" iconColor="text-violet-500" />
          <StatsCard label="New This Month"     value="23"   change={15} changeLabel="vs last month" icon={UserPlus}    iconBg="bg-blue-50"   iconColor="text-blue-500" />
          <StatsCard label="Repeat Buyers"      value="94%"  change={3}  changeLabel="retention rate" icon={RefreshCw}  iconBg="bg-green-50"  iconColor="text-green-500" />
          <StatsCard label="Avg Order Value"    value="$82"  change={6}  changeLabel="vs last month" icon={ShoppingCart} iconBg="bg-pink-50"  iconColor="text-pink-500" />
        </div>

        <DataTable
          columns={columns}
          data={CUSTOMERS}
          searchable
          searchKeys={["name", "email"]}
          pageSize={8}
        />
      </main>
    </div>
  );
}
