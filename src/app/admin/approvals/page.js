"use client";
import { useState, useEffect } from "react";
import {
  CheckCircle, XCircle, Clock, RefreshCw,
  MapPin, Tag, Calendar, X, AlertTriangle,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import { adminApprovalsAPI } from "@/lib/api";

function PlanBadge({ plan }) {
  const map = { Basic: "badge badge-gray", Pro: "badge badge-info", Premium: "badge badge-purple" };
  return <span className={map[plan] || "badge badge-gray"}>{plan || "Basic"}</span>;
}

function StatusBadge({ status }) {
  const map = { approved: "badge badge-success", rejected: "badge badge-danger", pending: "badge badge-warning", changes: "badge badge-info" };
  const labels = { approved: "Approved", rejected: "Rejected", pending: "Pending", changes: "Changes Requested" };
  return <span className={map[status] || "badge badge-gray"}>{labels[status] || status}</span>;
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-surface-900">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-100 text-surface-400 transition-colors">
            <X size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function ApprovalsPage() {
  const [pending, setPending] = useState([]);
  const [processed, setProcessed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    adminApprovalsAPI.list({ limit: 50 })
      .then(res => {
        setPending(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const approve = async (id) => {
    setActionLoading(id);
    try {
      await adminApprovalsAPI.approve(id);
      const v = pending.find(p => p.id === id);
      setProcessed(prev => [{ ...v, decision: "approved", decidedAt: new Date().toLocaleDateString() }, ...prev]);
      setPending(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const reject = async (id) => {
    setActionLoading(id);
    try {
      await adminApprovalsAPI.reject(id, rejectReason);
      const v = pending.find(p => p.id === id);
      setProcessed(prev => [{ ...v, decision: "rejected", reason: rejectReason, decidedAt: new Date().toLocaleDateString() }, ...prev]);
      setPending(prev => prev.filter(p => p.id !== id));
      setRejectModal(null);
      setRejectReason("");
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Vendor Approvals" subtitle="Review and approve vendor applications" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Pending",             value: pending.length,                            color: "text-amber-600" },
            { label: "Approved This Month", value: processed.filter(p => p.decision === "approved").length, color: "text-green-600" },
            { label: "Rejected",            value: processed.filter(p => p.decision === "rejected").length, color: "text-red-600" },
            { label: "Total Processed",     value: processed.length,                          color: "text-blue-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-surface-200 px-5 py-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-surface-400 font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-sm font-bold text-surface-900 mb-3">
            Pending Applications
            {pending.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">{pending.length}</span>
            )}
          </h2>

          {loading ? (
            <div className="bg-white rounded-xl border border-surface-200 py-16 text-center text-sm text-surface-400">Loading…</div>
          ) : pending.length === 0 ? (
            <div className="bg-white rounded-xl border border-surface-200 py-16 text-center">
              <CheckCircle size={32} className="text-green-400 mx-auto mb-3" />
              <p className="text-sm text-surface-500 font-medium">All applications have been processed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map(v => (
                <div key={v.id} className="bg-white rounded-xl border border-surface-200 p-6">
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-primary-600">{(v.business_name || v.name || "?").charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-surface-900">{v.business_name || v.name}</h3>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-surface-500">
                        {v.category_name && <span className="flex items-center gap-1"><Tag size={11} />{v.category_name}</span>}
                        {v.city && <span className="flex items-center gap-1"><MapPin size={11} />{v.city}</span>}
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />Submitted {v.created_at ? new Date(v.created_at).toLocaleDateString() : "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => approve(v.id)}
                      disabled={actionLoading === v.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button
                      onClick={() => { setRejectModal(v.id); setRejectReason(""); }}
                      disabled={actionLoading === v.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-600 text-sm font-semibold transition-colors">
                      <Clock size={14} /> Keep Pending
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {processed.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-surface-900 mb-3">Recently Processed</h2>
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="divide-y divide-surface-50">
                {processed.map((v, i) => (
                  <div key={`${v.id}-${i}`} className="px-6 py-4 flex items-start gap-4 flex-wrap hover:bg-surface-50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary-600">{(v.business_name || v.name || "?").charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-surface-800">{v.business_name || v.name}</p>
                        <StatusBadge status={v.decision} />
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-surface-400 flex-wrap">
                        <span className="flex items-center gap-1"><Calendar size={10} />Decided {v.decidedAt}</span>
                      </div>
                      {v.decision === "rejected" && v.reason && (
                        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                          <AlertTriangle size={10} /> Reason: {v.reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {rejectModal !== null && (
        <Modal title="Reject Application" onClose={() => setRejectModal(null)}>
          <p className="text-sm text-surface-500 mb-3">Please provide a reason for rejecting this vendor application.</p>
          <textarea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="e.g. Incomplete documentation, business not verified…"
            rows={4}
            className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm text-surface-700 placeholder:text-surface-400 outline-none focus:border-primary-400 resize-none mb-4"
          />
          <div className="flex gap-2">
            <button onClick={() => setRejectModal(null)} className="flex-1 py-2 rounded-xl border border-surface-200 text-surface-600 text-sm font-semibold hover:bg-surface-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => reject(rejectModal)}
              disabled={!rejectReason.trim() || actionLoading === rejectModal}
              className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              Confirm Rejection
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
