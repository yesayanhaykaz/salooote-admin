"use client";
import { useState, useEffect } from "react";
import {
  UserPlus, Eye, ShieldOff, Trash2, X,
  Mail, Phone, MapPin, Calendar, ShoppingBag,
  KeyRound, MessageSquare, ShieldAlert,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import { adminUsersAPI } from "@/lib/api";

const STATUS_TABS = ["All", "Active", "Banned", "Pending"];

function RoleBadge({ role }) {
  const map = { user: "badge badge-info", vendor: "badge badge-purple", admin: "badge badge-success" };
  return <span className={map[role] || "badge badge-gray"}>{role?.charAt(0).toUpperCase() + role?.slice(1)}</span>;
}

function StatusBadge({ status }) {
  const map = { active: "badge badge-success", banned: "badge badge-danger", pending: "badge badge-warning" };
  return <span className={map[status] || "badge badge-gray"}>{status?.charAt(0).toUpperCase() + status?.slice(1)}</span>;
}

function fullName(user) {
  const n = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return n || user.email || "?";
}

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

function UserDetailPanel({ user, onClose, onStatusChange }) {
  return (
    <div className="border-t border-surface-100 bg-surface-50 px-6 py-5">
      <div className="flex items-start gap-5 flex-wrap">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-primary-600">{initials(fullName(user))}</span>
          </div>
          <div>
            <p className="text-base font-bold text-surface-900">{fullName(user)}</p>
            <p className="text-sm text-surface-500 mt-0.5">{user.email}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <RoleBadge role={user.role} />
              <StatusBadge status={user.status} />
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-[200px] grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {user.phone && (
            <div className="flex items-center gap-2 text-surface-600">
              <Phone size={13} className="text-surface-400 flex-shrink-0" />
              <span>{user.phone}</span>
            </div>
          )}
          {user.city && (
            <div className="flex items-center gap-2 text-surface-600">
              <MapPin size={13} className="text-surface-400 flex-shrink-0" />
              <span>{user.city}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-surface-600">
            <Calendar size={13} className="text-surface-400 flex-shrink-0" />
            <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-surface-600">
            <Mail size={13} className="text-surface-400 flex-shrink-0" />
            <span>{user.email}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onStatusChange(user.id, user.status === "active" ? "banned" : "active")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 text-xs font-semibold transition-colors"
          >
            <ShieldAlert size={12} /> {user.status === "active" ? "Suspend" : "Activate"}
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-200 text-surface-400 transition-colors ml-1"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

const COLUMNS = ["User", "Role", "Status", "Joined", "Actions"];

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { limit: 50, page: 1 };
      if (activeTab !== "All") params.status = activeTab.toLowerCase();
      if (search) params.search = search;
      const res = await adminUsersAPI.list(params);
      setUsers(res.data || []);
      setTotal(res.pagination?.total || (res.data?.length ?? 0));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [activeTab]);

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleStatusChange = async (id, status) => {
    try {
      await adminUsersAPI.updateStatus(id, status);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
      if (selectedUser?.id === id) setSelectedUser(prev => ({ ...prev, status }));
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = users;

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        title="Users"
        subtitle="Manage all registered users"
        actions={
          <button className="flex items-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <UserPlus size={14} /> Add User
          </button>
        }
      />

      <div className="flex-1 p-6 space-y-5 overflow-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Users",    value: total,  color: "text-blue-600" },
            { label: "Active",         value: users.filter(u => u.status === "active").length,  color: "text-green-600" },
            { label: "Banned",         value: users.filter(u => u.status === "banned").length,  color: "text-red-600" },
            { label: "Pending",        value: users.filter(u => u.status === "pending").length, color: "text-violet-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-surface-200 px-5 py-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-surface-400 font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-surface-200 px-5 py-3.5 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            {STATUS_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === tab ? "bg-primary-600 text-white" : "text-surface-500 hover:bg-surface-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <div className="flex items-center bg-surface-50 rounded-lg px-3 py-2 border border-surface-200 w-[220px] gap-2 focus-within:border-primary-400 transition-colors">
            <svg className="w-3.5 h-3.5 text-surface-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users…"
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-surface-400"
            />
          </div>
          <span className="text-xs text-surface-400">{filtered.length} results</span>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-100">
                  {COLUMNS.map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={COLUMNS.length} className="px-5 py-12 text-center text-sm text-surface-400">Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={COLUMNS.length} className="px-5 py-12 text-center text-sm text-surface-400">No users found</td></tr>
                ) : filtered.map(row => (
                  <>
                    <tr
                      key={row.id}
                      onClick={() => setSelectedUser(selectedUser?.id === row.id ? null : row)}
                      className={`table-row border-b border-surface-50 last:border-0 cursor-pointer transition-colors ${selectedUser?.id === row.id ? "bg-primary-50" : ""}`}
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary-600">{initials(fullName(row))}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-surface-800">{fullName(row)}</p>
                            <p className="text-xs text-surface-400">{row.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap"><RoleBadge role={row.role} /></td>
                      <td className="px-5 py-3.5 whitespace-nowrap"><StatusBadge status={row.status} /></td>
                      <td className="px-5 py-3.5 text-sm text-surface-500 whitespace-nowrap">
                        {row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedUser(selectedUser?.id === row.id ? null : row)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-100 hover:bg-primary-50 text-surface-600 hover:text-primary-600 text-xs font-semibold transition-colors"
                          >
                            <Eye size={12} /> View
                          </button>
                          <button
                            onClick={() => handleStatusChange(row.id, row.status === "active" ? "banned" : "active")}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 text-xs font-semibold transition-colors"
                          >
                            <ShieldOff size={12} /> {row.status === "active" ? "Suspend" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {selectedUser?.id === row.id && (
                      <tr key={`detail-${row.id}`}>
                        <td colSpan={COLUMNS.length} className="p-0">
                          <UserDetailPanel
                            user={selectedUser}
                            onClose={() => setSelectedUser(null)}
                            onStatusChange={handleStatusChange}
                          />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
