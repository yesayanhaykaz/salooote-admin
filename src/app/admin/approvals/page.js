"use client";
import { useState } from "react";
import {
  CheckCircle, XCircle, Clock, RefreshCw,
  MapPin, Tag, Calendar, X, AlertTriangle,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import { SAMPLE_VENDORS } from "@/lib/data";

// Pull pending from SAMPLE_VENDORS + 2 extra inline entries
const PENDING_FROM_DATA = SAMPLE_VENDORS.filter(v => v.status === "pending").map(v => ({
  id: v.id,
  name: v.name,
  category: v.category,
  city: v.city,
  plan: v.plan,
  submitted: "Apr 2, 2025",
  docs: {
    businessName: true,
    category: true,
    description: false,
    logo: false,
    coverImage: true,
    contactInfo: true,
    location: true,
  },
}));

const EXTRA_PENDING = [
  {
    id: 101,
    name: "Elegant Events",
    category: "Event Planning",
    city: "Yerevan",
    plan: "Pro",
    submitted: "Apr 4, 2025",
    docs: {
      businessName: true,
      category: true,
      description: true,
      logo: true,
      coverImage: false,
      contactInfo: true,
      location: true,
    },
  },
  {
    id: 102,
    name: "Velvet Catering",
    category: "Catering",
    city: "Gyumri",
    plan: "Basic",
    submitted: "Apr 5, 2025",
    docs: {
      businessName: true,
      category: true,
      description: false,
      logo: false,
      coverImage: false,
      contactInfo: true,
      location: false,
    },
  },
];

const ALL_PENDING = [...PENDING_FROM_DATA, ...EXTRA_PENDING];

const DOC_LABELS = {
  businessName: "Business Name",
  category:     "Category",
  description:  "Description",
  logo:         "Logo",
  coverImage:   "Cover Image",
  contactInfo:  "Contact Info",
  location:     "Location",
};

function PlanBadge({ plan }) {
  const map = {
    Basic:   "badge badge-gray",
    Pro:     "badge badge-info",
    Premium: "badge badge-purple",
  };
  return <span className={map[plan] || "badge badge-gray"}>{plan}</span>;
}

function StatusBadge({ status }) {
  const map = {
    approved: "badge badge-success",
    rejected: "badge badge-danger",
    pending:  "badge badge-warning",
    changes:  "badge badge-info",
  };
  const labels = { approved: "Approved", rejected: "Rejected", pending: "Pending", changes: "Changes Requested" };
  return <span className={map[status] || "badge badge-gray"}>{labels[status] || status}</span>;
}

function DocChecklist({ docs }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
      {Object.entries(docs).map(([key, ok]) => (
        <div
          key={key}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
            ok ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-600"
          }`}
        >
          {ok
            ? <CheckCircle size={11} className="flex-shrink-0" />
            : <Clock size={11} className="flex-shrink-0" />
          }
          <span className="truncate">{DOC_LABELS[key]}</span>
        </div>
      ))}
    </div>
  );
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
  const [pending, setPending] = useState(ALL_PENDING);
  const [processed, setProcessed] = useState([]);

  const [rejectModal, setRejectModal] = useState(null);   // vendor id
  const [changesModal, setChangesModal] = useState(null); // vendor id
  const [rejectReason, setRejectReason] = useState("");
  const [changesNote, setChangesNote] = useState("");

  const approve = (id) => {
    const v = pending.find(p => p.id === id);
    setProcessed(prev => [{ ...v, decision: "approved", decidedAt: "Apr 7, 2025" }, ...prev]);
    setPending(prev => prev.filter(p => p.id !== id));
  };

  const reject = (id) => {
    const v = pending.find(p => p.id === id);
    setProcessed(prev => [{ ...v, decision: "rejected", reason: rejectReason, decidedAt: "Apr 7, 2025" }, ...prev]);
    setPending(prev => prev.filter(p => p.id !== id));
    setRejectModal(null);
    setRejectReason("");
  };

  const requestChanges = (id) => {
    const v = pending.find(p => p.id === id);
    setProcessed(prev => [{ ...v, decision: "changes", note: changesNote, decidedAt: "Apr 7, 2025" }, ...prev]);
    setPending(prev => prev.filter(p => p.id !== id));
    setChangesModal(null);
    setChangesNote("");
  };

  const keepPending = () => {
    // no-op — vendor stays in pending, just show a toast conceptually
  };

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        title="Vendor Approvals"
        subtitle="Review and approve vendor applications"
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Pending",             value: pending.length,       color: "text-amber-600" },
            { label: "Approved This Month", value: "5",                  color: "text-green-600" },
            { label: "Rejected",            value: "1",                  color: "text-red-600" },
            { label: "Awaiting Changes",    value: "1",                  color: "text-blue-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-surface-200 px-5 py-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-surface-400 font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Pending Applications */}
        <div>
          <h2 className="text-sm font-bold text-surface-900 mb-3">
            Pending Applications
            {pending.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                {pending.length}
              </span>
            )}
          </h2>

          {pending.length === 0 ? (
            <div className="bg-white rounded-xl border border-surface-200 py-16 text-center">
              <CheckCircle size={32} className="text-green-400 mx-auto mb-3" />
              <p className="text-sm text-surface-500 font-medium">All applications have been processed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map(v => {
                const docsComplete = Object.values(v.docs).filter(Boolean).length;
                const docsTotal = Object.keys(v.docs).length;
                return (
                  <div key={v.id} className="bg-white rounded-xl border border-surface-200 p-6">
                    {/* Header row */}
                    <div className="flex items-start gap-4 flex-wrap">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-primary-600">{v.name.charAt(0)}</span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-surface-900">{v.name}</h3>
                          <PlanBadge plan={v.plan} />
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-surface-500">
                          <span className="flex items-center gap-1"><Tag size={11} />{v.category}</span>
                          <span className="flex items-center gap-1"><MapPin size={11} />{v.city}</span>
                          <span className="flex items-center gap-1"><Calendar size={11} />Submitted {v.submitted}</span>
                        </div>
                      </div>

                      {/* Doc progress */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-semibold text-surface-600">
                          <span className={docsComplete === docsTotal ? "text-green-600" : "text-amber-600"}>
                            {docsComplete}/{docsTotal}
                          </span> docs submitted
                        </p>
                        <div className="w-24 h-1.5 bg-surface-100 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${docsComplete === docsTotal ? "bg-green-500" : "bg-amber-400"}`}
                            style={{ width: `${(docsComplete / docsTotal) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Document Checklist */}
                    <DocChecklist docs={v.docs} />

                    {/* Actions */}
                    <div className="mt-5 flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => approve(v.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors"
                      >
                        <CheckCircle size={14} /> Approve
                      </button>
                      <button
                        onClick={() => { setRejectModal(v.id); setRejectReason(""); }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                      <button
                        onClick={() => { setChangesModal(v.id); setChangesNote(""); }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-white text-sm font-semibold transition-colors"
                      >
                        <RefreshCw size={14} /> Request Changes
                      </button>
                      <button
                        onClick={() => keepPending(v.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 text-surface-600 text-sm font-semibold transition-colors"
                      >
                        <Clock size={14} /> Keep Pending
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recently Processed */}
        {processed.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-surface-900 mb-3">Recently Processed</h2>
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="divide-y divide-surface-50">
                {processed.map((v, i) => (
                  <div key={`${v.id}-${i}`} className="px-6 py-4 flex items-start gap-4 flex-wrap hover:bg-surface-50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary-600">{v.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-surface-800">{v.name}</p>
                        <StatusBadge status={v.decision} />
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-surface-400 flex-wrap">
                        <span className="flex items-center gap-1"><Tag size={10} />{v.category}</span>
                        <span className="flex items-center gap-1"><MapPin size={10} />{v.city}</span>
                        <span className="flex items-center gap-1"><Calendar size={10} />Decided {v.decidedAt}</span>
                      </div>
                      {v.decision === "rejected" && v.reason && (
                        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                          <AlertTriangle size={10} /> Reason: {v.reason}
                        </p>
                      )}
                      {v.decision === "changes" && v.note && (
                        <p className="mt-1.5 text-xs text-blue-500 flex items-center gap-1">
                          <RefreshCw size={10} /> Changes: {v.note}
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

      {/* Reject Modal */}
      {rejectModal !== null && (
        <Modal title="Reject Application" onClose={() => setRejectModal(null)}>
          <p className="text-sm text-surface-500 mb-3">
            Please provide a reason for rejecting this vendor application.
          </p>
          <textarea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="e.g. Incomplete documentation, business not verified…"
            rows={4}
            className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm text-surface-700 placeholder:text-surface-400 outline-none focus:border-primary-400 resize-none mb-4"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setRejectModal(null)}
              className="flex-1 py-2 rounded-xl border border-surface-200 text-surface-600 text-sm font-semibold hover:bg-surface-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => reject(rejectModal)}
              disabled={!rejectReason.trim()}
              className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              Confirm Rejection
            </button>
          </div>
        </Modal>
      )}

      {/* Request Changes Modal */}
      {changesModal !== null && (
        <Modal title="Request Changes" onClose={() => setChangesModal(null)}>
          <p className="text-sm text-surface-500 mb-3">
            Describe what the vendor needs to update or provide before approval.
          </p>
          <textarea
            value={changesNote}
            onChange={e => setChangesNote(e.target.value)}
            placeholder="e.g. Please upload a logo and add a detailed business description…"
            rows={4}
            className="w-full border border-surface-200 rounded-xl px-3 py-2.5 text-sm text-surface-700 placeholder:text-surface-400 outline-none focus:border-primary-400 resize-none mb-4"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setChangesModal(null)}
              className="flex-1 py-2 rounded-xl border border-surface-200 text-surface-600 text-sm font-semibold hover:bg-surface-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => requestChanges(changesModal)}
              disabled={!changesNote.trim()}
              className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              Send Request
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
