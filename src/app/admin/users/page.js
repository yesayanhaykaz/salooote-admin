"use client";
import { useState } from "react";
import { Eye, Pencil, Ban, Download, UserPlus } from "lucide-react";
import TopBar from "@/components/TopBar";
import DataTable from "@/components/DataTable";
import { SAMPLE_USERS } from "@/lib/data";

const AVATAR_COLORS = [
  "bg-pink-500", "bg-violet-500", "bg-blue-500", "bg-green-500",
  "bg-orange-500", "bg-teal-500", "bg-rose-500", "bg-indigo-500",
];

function RoleBadge({ role }) {
  const map = {
    vendor: "badge badge-purple",
    user:   "badge badge-info",
    admin:  "badge badge-gray",
  };
  return <span className={map[role] || "badge badge-gray"}>{role.charAt(0).toUpperCase() + role.slice(1)}</span>;
}

function StatusBadge({ status }) {
  const map = {
    active:  "badge badge-success",
    banned:  "badge badge-danger",
    pending: "badge badge-warning",
  };
  return <span className={map[status] || "badge badge-gray"}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

const TABS = [
  { key: "all",     label: "All" },
  { key: "active",  label: "Active" },
  { key: "vendor",  label: "Vendors" },
  { key: "banned",  label: "Banned" },
];

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("all");

  const getCounts = () => ({
    all:    SAMPLE_USERS.length,
    active: SAMPLE_USERS.filter(u => u.status === "active").length,
    vendor: SAMPLE_USERS.filter(u => u.role === "vendor").length,
    banned: SAMPLE_USERS.filter(u => u.status === "banned").length,
  });

  const counts = getCounts();

  const filteredUsers = SAMPLE_USERS.filter(u => {
    if (activeTab === "all")    return true;
    if (activeTab === "active") return u.status === "active";
    if (activeTab === "vendor") return u.role === "vendor";
    if (activeTab === "banned") return u.status === "banned";
    return true;
  });

  const columns = [
    {
      key: "name",
      label: "User",
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full ${AVATAR_COLORS[row.id % AVATAR_COLORS.length]} flex items-center justify-center flex-shrink-0`}>
            <span className="text-xs font-bold text-white">{row.avatar}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-surface-800">{row.name}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (val) => <span className="text-surface-500">{val}</span>,
    },
    {
      key: "role",
      label: "Role",
      render: (val) => <RoleBadge role={val} />,
    },
    {
      key: "status",
      label: "Status",
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: "joined",
      label: "Joined",
      sortable: true,
      render: (val) => <span className="text-surface-400 text-xs">{val}</span>,
    },
    {
      key: "orders",
      label: "Orders",
      render: (val) => (
        <span className="text-sm font-semibold text-surface-700">{val}</span>
      ),
    },
    {
      key: "id",
      label: "Actions",
      render: (val, row) => (
        <div className="flex items-center gap-1.5">
          <button className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer bg-white">
            <Eye size={13} />
          </button>
          <button className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 transition-colors cursor-pointer bg-white">
            <Pencil size={13} />
          </button>
          <button className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer bg-white">
            <Ban size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        title="Users"
        actions={
          <>
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-surface-200 text-sm font-semibold text-surface-600 hover:bg-surface-50 transition-colors cursor-pointer bg-white">
              <Download size={14} />
              Export
            </button>
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700 transition-colors cursor-pointer border-0">
              <UserPlus size={14} />
              Add User
            </button>
          </>
        }
      />

      <div className="flex-1 p-6 space-y-5">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-xl p-1.5 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-0 ${
                activeTab === tab.key
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-surface-500 hover:text-surface-800 hover:bg-surface-50 bg-transparent"
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === tab.key ? "bg-white/20 text-white" : "bg-surface-100 text-surface-500"
              }`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={filteredUsers}
          searchKeys={["name", "email", "role"]}
          pageSize={8}
        />
      </div>
    </div>
  );
}
