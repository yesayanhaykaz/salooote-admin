"use client";
import { useState } from "react";
import { Shield, Users, Plus, X, ChevronRight, Check, Lock } from "lucide-react";
import TopBar from "@/components/TopBar";

// ─── Definitions ─────────────────────────────────────────────────────────────
const MODULES = [
  "Dashboard", "Users", "Vendors", "Approvals", "Bookings", "Products",
  "Subscriptions", "Payments", "Reviews", "Support", "Marketing", "CMS",
  "Reports", "Roles", "Settings",
];
const ACTIONS = ["View", "Create", "Edit", "Delete"];

const ROLES_DEFAULT = [
  {
    key: "super_admin",
    name: "Super Admin",
    description: "Full unrestricted access to all platform features.",
    userCount: 1,
    color: "bg-danger-500",
    locked: true,
    permissions: Object.fromEntries(MODULES.map(m => [m, { View: true, Create: true, Edit: true, Delete: true }])),
  },
  {
    key: "admin",
    name: "Admin",
    description: "Manages all platform operations except role configuration.",
    userCount: 3,
    color: "bg-primary-500",
    locked: false,
    permissions: Object.fromEntries(MODULES.map(m => [m, {
      View: true,
      Create: m !== "Roles" && m !== "Settings",
      Edit: m !== "Roles",
      Delete: ["Roles", "Settings", "Payments"].indexOf(m) === -1,
    }])),
  },
  {
    key: "content_manager",
    name: "Content Manager",
    description: "Manages CMS, blog, marketing content and banners.",
    userCount: 2,
    color: "bg-info-500",
    locked: false,
    permissions: Object.fromEntries(MODULES.map(m => [m, {
      View: ["Dashboard", "CMS", "Marketing", "Blog"].includes(m) || m === "Dashboard",
      Create: ["CMS", "Marketing"].includes(m),
      Edit: ["CMS", "Marketing"].includes(m),
      Delete: m === "CMS",
    }])),
  },
  {
    key: "support_manager",
    name: "Support Manager",
    description: "Handles support tickets, reviews and user queries.",
    userCount: 4,
    color: "bg-warning-500",
    locked: false,
    permissions: Object.fromEntries(MODULES.map(m => [m, {
      View: ["Dashboard", "Support", "Reviews", "Users", "Bookings"].includes(m),
      Create: m === "Support",
      Edit: ["Support", "Reviews"].includes(m),
      Delete: false,
    }])),
  },
  {
    key: "finance_manager",
    name: "Finance Manager",
    description: "Manages payments, subscriptions, and financial reports.",
    userCount: 2,
    color: "bg-success-500",
    locked: false,
    permissions: Object.fromEntries(MODULES.map(m => [m, {
      View: ["Dashboard", "Payments", "Subscriptions", "Reports"].includes(m),
      Create: false,
      Edit: ["Payments", "Subscriptions"].includes(m),
      Delete: false,
    }])),
  },
];

// ─── Add Role Modal ───────────────────────────────────────────────────────────
function AddRoleModal({ roles, onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", description: "", copyFrom: "" });

  const handleAdd = () => {
    if (!form.name) return;
    const copySource = roles.find(r => r.key === form.copyFrom);
    const permissions = copySource
      ? JSON.parse(JSON.stringify(copySource.permissions))
      : Object.fromEntries(MODULES.map(m => [m, { View: false, Create: false, Edit: false, Delete: false }]));

    onAdd({
      key: form.name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now(),
      name: form.name,
      description: form.description,
      userCount: 0,
      color: "bg-surface-400",
      locked: false,
      permissions,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h2 className="text-base font-bold text-surface-900">Add New Role</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-100 cursor-pointer border-none bg-transparent">
            <X size={16} className="text-surface-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-surface-500 mb-1.5 block">Role Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Marketing Manager"
              className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-surface-500 mb-1.5 block">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe what this role can do…" rows={3}
              className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-400 resize-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-surface-500 mb-1.5 block">Copy Permissions From</label>
            <select value={form.copyFrom} onChange={e => setForm(f => ({ ...f, copyFrom: e.target.value }))}
              className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary-400 bg-white cursor-pointer">
              <option value="">— Start from scratch —</option>
              {roles.map(r => <option key={r.key} value={r.key}>{r.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-surface-200 rounded-lg hover:bg-surface-50 cursor-pointer bg-white text-surface-700">Cancel</button>
            <button onClick={handleAdd} className="px-5 py-2 text-sm bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 cursor-pointer">Create Role</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Permissions Grid ─────────────────────────────────────────────────────────
function PermissionsGrid({ role, onChange }) {
  const toggle = (module, action) => {
    if (role.locked) return;
    onChange(module, action, !role.permissions[module][action]);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-100 bg-surface-50">
            <th className="px-5 py-3 text-left text-xs font-semibold text-surface-500 uppercase tracking-wide w-48">Module</th>
            {ACTIONS.map(a => (
              <th key={a} className="px-4 py-3 text-center text-xs font-semibold text-surface-500 uppercase tracking-wide">{a}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MODULES.map(mod => (
            <tr key={mod} className="border-b border-surface-50 last:border-0 hover:bg-surface-50/40 transition-colors">
              <td className="px-5 py-3 text-sm font-medium text-surface-700">{mod}</td>
              {ACTIONS.map(action => {
                const checked = role.permissions[mod]?.[action] ?? false;
                return (
                  <td key={action} className="px-4 py-3 text-center">
                    {role.locked ? (
                      <div className="inline-flex items-center justify-center w-5 h-5 rounded bg-primary-100">
                        <Lock size={10} className="text-primary-400" />
                      </div>
                    ) : (
                      <button
                        onClick={() => toggle(mod, action)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer mx-auto ${
                          checked
                            ? "bg-primary-600 border-primary-600"
                            : "bg-white border-surface-300 hover:border-primary-400"
                        }`}
                      >
                        {checked && <Check size={11} className="text-white" strokeWidth={3} />}
                      </button>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RolesPage() {
  const [roles, setRoles] = useState(ROLES_DEFAULT);
  const [selectedKey, setSelectedKey] = useState("super_admin");
  const [showModal, setShowModal] = useState(false);
  const [saved, setSaved] = useState(false);

  const selectedRole = roles.find(r => r.key === selectedKey);

  const updatePermission = (module, action, value) => {
    setRoles(prev => prev.map(r =>
      r.key === selectedKey
        ? { ...r, permissions: { ...r.permissions, [module]: { ...r.permissions[module], [action]: value } } }
        : r
    ));
    setSaved(false);
  };

  const addRole = (role) => {
    setRoles(prev => [...prev, role]);
    setSelectedKey(role.key);
  };

  const savePermissions = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Roles & Permissions"
        subtitle="Configure admin access levels"
        actions={
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors cursor-pointer border-none">
            <Plus size={14} /> Add Role
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex gap-6 h-full min-h-0">
          {/* Roles sidebar */}
          <div className="w-64 flex-shrink-0 space-y-2">
            {roles.map(role => (
              <button
                key={role.key}
                onClick={() => setSelectedKey(role.key)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedKey === role.key
                    ? "bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-200"
                    : "bg-white border-surface-200 hover:border-primary-200 hover:bg-primary-50/40"
                }`}
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    selectedKey === role.key ? "bg-white/60" : role.color
                  }`} />
                  <span className={`text-sm font-semibold truncate ${selectedKey === role.key ? "text-white" : "text-surface-800"}`}>
                    {role.name}
                  </span>
                  {role.locked && (
                    <Lock size={11} className={selectedKey === role.key ? "text-white/60 ml-auto" : "text-surface-300 ml-auto"} />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs truncate ${selectedKey === role.key ? "text-white/70" : "text-surface-400"}`}>
                    {role.description.slice(0, 36)}{role.description.length > 36 ? "…" : ""}
                  </span>
                </div>
                <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${selectedKey === role.key ? "text-white/80" : "text-surface-400"}`}>
                  <Users size={11} />
                  {role.userCount} user{role.userCount !== 1 ? "s" : ""}
                </div>
              </button>
            ))}
          </div>

          {/* Permissions panel */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {selectedRole && (
              <>
                {/* Role header */}
                <div className="bg-white rounded-xl border border-surface-200 px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${selectedRole.color} flex items-center justify-center`}>
                      <Shield size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-surface-900">{selectedRole.name}</h2>
                        {selectedRole.locked && (
                          <span className="flex items-center gap-1 text-xs text-surface-400 bg-surface-100 px-2 py-0.5 rounded-full">
                            <Lock size={9} /> Locked
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-surface-400 mt-0.5">{selectedRole.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-surface-500">
                      <Users size={13} className="text-surface-400" />
                      {selectedRole.userCount} user{selectedRole.userCount !== 1 ? "s" : ""}
                    </div>
                    {!selectedRole.locked && (
                      <button
                        onClick={savePermissions}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer border-none ${
                          saved
                            ? "bg-success-600 text-white"
                            : "bg-primary-600 hover:bg-primary-700 text-white"
                        }`}
                      >
                        {saved ? <><Check size={13} /> Saved!</> : "Save Permissions"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Permissions grid */}
                <div className="bg-white rounded-xl border border-surface-200 overflow-hidden flex-1">
                  {selectedRole.locked && (
                    <div className="px-5 py-3 bg-primary-50 border-b border-primary-100 flex items-center gap-2">
                      <Lock size={13} className="text-primary-500" />
                      <p className="text-xs font-medium text-primary-700">Super Admin has all permissions and cannot be edited.</p>
                    </div>
                  )}
                  <PermissionsGrid role={selectedRole} onChange={updatePermission} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showModal && <AddRoleModal roles={roles} onClose={() => setShowModal(false)} onAdd={addRole} />}
    </div>
  );
}
