"use client";
import { useState, useEffect, useCallback } from "react";
import {
  UserPlus, Eye, ShieldOff, ShieldCheck, X,
  Mail, Phone, Calendar, ShieldAlert, CheckCircle, Clock,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import { adminUsersAPI } from "@/lib/api";
import { useLocale } from "@/lib/i18n";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fullName(user) {
  const n = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return n || user.email || "?";
}

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function Avatar({ user, size = "w-8 h-8", textSize = "text-xs" }) {
  if (user.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={fullName(user)}
        className={`${size} rounded-full object-cover flex-shrink-0`}
      />
    );
  }
  return (
    <div className={`${size} rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0`}>
      <span className={`${textSize} font-bold text-primary-600`}>{initials(fullName(user))}</span>
    </div>
  );
}

// ─── Badges ──────────────────────────────────────────────────────────────────

function RoleBadge({ role }) {
  const map = {
    user:   "badge badge-info",
    vendor: "badge badge-purple",
    admin:  "badge badge-success",
  };
  return <span className={map[role] || "badge badge-gray"}>{role?.charAt(0).toUpperCase() + role?.slice(1)}</span>;
}

function StatusBadge({ status }) {
  const { t } = useLocale();
  const map = {
    active:    "badge badge-success",
    pending:   "badge badge-warning",
    suspended: "badge badge-warning",
    banned:    "badge badge-danger",
  };
  const key = `users.status_${status}`;
  return <span className={map[status] || "badge badge-gray"}>{t(key) || status}</span>;
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function UserDetailPanel({ user, onClose, onStatusChange }) {
  const { t } = useLocale();

  const isSuspendable = user.status === "active";
  const isActivatable = user.status === "suspended" || user.status === "banned" || user.status === "pending";

  return (
    <div className="border-t border-surface-100 bg-surface-50 px-6 py-5">
      <div className="flex items-start gap-5 flex-wrap">

        {/* Avatar + info */}
        <div className="flex items-start gap-4">
          <Avatar user={user} size="w-14 h-14" textSize="text-xl" />
          <div>
            <p className="text-base font-bold text-surface-900">{fullName(user)}</p>
            <p className="text-sm text-surface-500 mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <RoleBadge role={user.role} />
              <StatusBadge status={user.status} />
              {user.email_verified && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-success-600 bg-success-50 px-1.5 py-0.5 rounded-full">
                  <CheckCircle size={10} /> {t("users.verified")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Meta fields */}
        <div className="flex-1 min-w-[200px] grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2 text-surface-600">
            <Mail size={13} className="text-surface-400 flex-shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-2 text-surface-600">
              <Phone size={13} className="text-surface-400 flex-shrink-0" />
              <span>{user.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-surface-600">
            <Calendar size={13} className="text-surface-400 flex-shrink-0" />
            <span>{t("users.joined")} {new Date(user.created_at).toLocaleDateString()}</span>
          </div>
          {user.last_login_at && (
            <div className="flex items-center gap-2 text-surface-600">
              <Clock size={13} className="text-surface-400 flex-shrink-0" />
              <span>{t("users.last_login")} {new Date(user.last_login_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {isSuspendable && (
            <button
              onClick={() => onStatusChange(user.id, "suspended")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 text-xs font-semibold transition-colors"
            >
              <ShieldAlert size={12} /> {t("users.suspend")}
            </button>
          )}
          {isActivatable && (
            <button
              onClick={() => onStatusChange(user.id, "active")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success-50 hover:bg-success-100 text-success-600 text-xs font-semibold transition-colors"
            >
              <ShieldCheck size={12} /> {t("users.activate")}
            </button>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-200 text-surface-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { t } = useLocale();

  const STATUS_TABS = [
    { value: "all",       label: t("common.all") },
    { value: "active",    label: t("users.status_active") },
    { value: "pending",   label: t("users.status_pending") },
    { value: "suspended", label: t("users.status_suspended") },
    { value: "banned",    label: t("users.status_banned") },
  ];

  const COLUMNS = [
    t("users.col_user"),
    t("users.col_role"),
    t("users.col_status"),
    t("users.col_joined"),
    t("common.actions"),
  ];

  const [activeTab,    setActiveTab]    = useState("all");
  const [search,       setSearch]       = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users,        setUsers]        = useState([]);
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [page,         setPage]         = useState(1);
  const LIMIT = 50;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: LIMIT, page };
      if (activeTab !== "all") params.status = activeTab;
      if (search.trim())       params.search = search.trim();
      const res = await adminUsersAPI.list(params);
      setUsers(res.data || []);
      setTotal(res.pagination?.total ?? (res.data?.length ?? 0));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, search]);

  // Fetch on tab / page change
  useEffect(() => { fetchUsers(); }, [activeTab, page]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchUsers(); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when tab changes
  useEffect(() => { setPage(1); }, [activeTab]);

  const handleStatusChange = async (id, status) => {
    try {
      await adminUsersAPI.updateStatus(id, status);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
      if (selectedUser?.id === id) setSelectedUser(prev => ({ ...prev, status }));
    } catch (e) {
      console.error(e);
    }
  };

  const STATS = [
    { label: t("users.total"),            value: total,                                               color: "text-blue-600" },
    { label: t("users.status_active"),    value: users.filter(u => u.status === "active").length,    color: "text-green-600" },
    { label: t("users.status_suspended"), value: users.filter(u => u.status === "suspended").length, color: "text-amber-600" },
    { label: t("users.status_banned"),    value: users.filter(u => u.status === "banned").length,    color: "text-red-600" },
  ];

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        title={t("users.title")}
        subtitle={t("users.subtitle")}
        actions={
          <button className="flex items-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <UserPlus size={14} /> {t("users.add_user")}
          </button>
        }
      />

      <div className="flex-1 p-6 space-y-5 overflow-auto">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-surface-200 px-5 py-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-surface-400 font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div className="bg-white rounded-xl border border-surface-200 px-5 py-3.5 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 flex-wrap">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === tab.value ? "bg-primary-600 text-white" : "text-surface-500 hover:bg-surface-100"
                }`}
              >
                {tab.label}
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
              placeholder={t("users.search")}
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-surface-400"
            />
          </div>
          <span className="text-xs text-surface-400">{total} {t("table.results")}</span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-100">
                  {COLUMNS.map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="px-5 py-12 text-center text-sm text-surface-400">
                      {t("users.loading")}
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="px-5 py-12 text-center text-sm text-surface-400">
                      {t("users.no_users")}
                    </td>
                  </tr>
                ) : users.map(row => (
                  <>
                    <tr
                      key={row.id}
                      onClick={() => setSelectedUser(selectedUser?.id === row.id ? null : row)}
                      className={`border-b border-surface-50 last:border-0 cursor-pointer transition-colors hover:bg-surface-50 ${
                        selectedUser?.id === row.id ? "bg-primary-50" : ""
                      }`}
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar user={row} />
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
                            <Eye size={12} /> {t("users.view")}
                          </button>
                          {row.status === "active" ? (
                            <button
                              onClick={() => handleStatusChange(row.id, "suspended")}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 text-xs font-semibold transition-colors"
                            >
                              <ShieldOff size={12} /> {t("users.suspend")}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(row.id, "active")}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-success-50 hover:bg-success-100 text-success-600 text-xs font-semibold transition-colors"
                            >
                              <ShieldCheck size={12} /> {t("users.activate")}
                            </button>
                          )}
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
