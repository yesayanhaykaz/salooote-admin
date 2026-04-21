"use client";
import { useState, useEffect } from "react";
import { MessageSquare, Plus, X, Clock, Send } from "lucide-react";
import TopBar from "@/components/TopBar";
import { userAPI } from "@/lib/api";

const STATUS_MAP = {
  new:       { label: "New",       cls: "badge badge-info" },
  replied:   { label: "Replied",   cls: "badge badge-purple" },
  confirmed: { label: "Confirmed", cls: "badge badge-success" },
  cancelled: { label: "Cancelled", cls: "badge badge-danger" },
  closed:    { label: "Closed",    cls: "badge badge-gray" },
};

const TABS = ["All", "New", "Replied", "Confirmed", "Cancelled", "Closed"];

function formatDate(iso) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const hours = diff / 3600000;
  if (hours < 1)  return `${Math.floor(diff / 60000)}m ago`;
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  if (hours < 48) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function NewInquiryModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    vendor_id: "", subject: "", message: "",
    event_type: "", event_date: "", guest_count: "", budget: "", currency: "USD",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.vendor_id.trim()) { setError("Vendor ID is required."); return; }
    if (!form.subject.trim())   { setError("Subject is required."); return; }
    if (!form.message.trim())   { setError("Message is required."); return; }

    setSaving(true);
    try {
      const payload = {
        vendor_id: form.vendor_id.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      };
      if (form.event_type)  payload.event_type  = form.event_type;
      if (form.event_date)  payload.event_date  = form.event_date;
      if (form.guest_count) payload.guest_count = parseInt(form.guest_count);
      if (form.budget)      payload.budget       = parseFloat(form.budget);
      if (form.budget)      payload.currency     = form.currency;

      const res = await userAPI.createInquiry(payload);
      onCreated(res?.data || res);
    } catch (err) {
      setError(err.message || "Failed to send inquiry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-surface-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-sm font-bold text-surface-900">New Inquiry</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-surface-100 flex items-center justify-center transition-colors cursor-pointer border-none bg-transparent">
            <X size={15} className="text-surface-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">Vendor ID *</label>
            <input name="vendor_id" value={form.vendor_id} onChange={handleChange} placeholder="Paste vendor UUID" className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">Subject *</label>
            <input name="subject" value={form.subject} onChange={handleChange} placeholder="What is this about?" className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1.5">Message *</label>
            <textarea name="message" value={form.message} onChange={handleChange} rows={3} placeholder="Describe what you need…" className="w-full resize-none px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">Event Type</label>
              <input name="event_type" value={form.event_type} onChange={handleChange} placeholder="Wedding, Birthday…" className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">Event Date</label>
              <input type="date" name="event_date" value={form.event_date} onChange={handleChange} className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">Guest Count</label>
              <input type="number" name="guest_count" value={form.guest_count} onChange={handleChange} placeholder="e.g. 100" className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">Budget</label>
              <div className="flex gap-2">
                <input type="number" name="budget" value={form.budget} onChange={handleChange} placeholder="500" className="flex-1 px-3 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 transition-colors" />
                <select name="currency" value={form.currency} onChange={handleChange} className="px-2 py-2.5 text-sm border border-surface-200 rounded-lg outline-none bg-white focus:border-primary-600">
                  <option value="USD">USD</option>
                  <option value="AMD">AMD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-xs text-danger-600 bg-danger-50 border border-danger-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-surface-600 border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors cursor-pointer bg-white">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none disabled:opacity-60">
              <Send size={14} /> {saving ? "Sending…" : "Send Inquiry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    userAPI.inquiries({ limit: 50 })
      .then(res => setInquiries(res?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeTab === "All"
    ? inquiries
    : inquiries.filter(i => i.status?.toLowerCase() === activeTab.toLowerCase());

  function handleCreated(newInquiry) {
    if (newInquiry?.id) setInquiries(prev => [newInquiry, ...prev]);
    setShowModal(false);
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar
        title="My Inquiries"
        subtitle="Track your vendor conversations"
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none"
          >
            <Plus size={13} /> New Inquiry
          </button>
        }
      />

      <main className="flex-1 p-6 space-y-5">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-xl px-2 py-1.5 overflow-x-auto w-fit">
          {TABS.map(tab => {
            const count = tab === "All" ? inquiries.length : inquiries.filter(i => i.status?.toLowerCase() === tab.toLowerCase()).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer border-none ${
                  activeTab === tab ? "bg-primary-600 text-white" : "text-surface-500 hover:bg-surface-100 bg-transparent"
                }`}
              >
                {tab}
                {count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab ? "bg-white/20 text-white" : "bg-surface-100 text-surface-500"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20 text-sm text-surface-400">Loading…</div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-surface-200 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
              <MessageSquare size={24} className="text-blue-300" />
            </div>
            <p className="text-sm font-semibold text-surface-600">No inquiries yet</p>
            <p className="text-xs text-surface-400 mt-1 mb-4">
              {activeTab === "All" ? "Send an inquiry to a vendor to get started." : `No ${activeTab.toLowerCase()} inquiries.`}
            </p>
            {activeTab === "All" && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 text-xs font-semibold bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none"
              >
                <Plus size={13} /> Send First Inquiry
              </button>
            )}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map(inq => {
              const statusInfo = STATUS_MAP[inq.status?.toLowerCase()] || { label: inq.status || "—", cls: "badge badge-gray" };
              return (
                <div key={inq.id} className="bg-white rounded-xl border border-surface-200 p-4 hover:shadow-card transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 flex-shrink-0">
                        {inq.vendor_id?.slice(-4).toUpperCase() || "??"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-surface-900">{inq.subject || "(No subject)"}</p>
                        <p className="text-xs text-surface-400 mt-0.5">Vendor: {inq.vendor_id?.slice(-8) || "—"}</p>
                        {inq.message && (
                          <p className="text-xs text-surface-500 mt-1 line-clamp-2">{inq.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className={statusInfo.cls}>{statusInfo.label}</span>
                      <div className="flex items-center gap-1 text-[11px] text-surface-400">
                        <Clock size={10} />
                        {formatDate(inq.created_at)}
                      </div>
                    </div>
                  </div>

                  {(inq.event_type || inq.event_date || inq.budget) && (
                    <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-surface-50">
                      {inq.event_type && (
                        <span className="text-xs text-surface-500"><span className="font-medium text-surface-700">Event:</span> {inq.event_type}</span>
                      )}
                      {inq.event_date && (
                        <span className="text-xs text-surface-500"><span className="font-medium text-surface-700">Date:</span> {inq.event_date?.slice(0, 10)}</span>
                      )}
                      {inq.budget && (
                        <span className="text-xs text-surface-500"><span className="font-medium text-surface-700">Budget:</span> {inq.currency || ""} {inq.budget}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showModal && <NewInquiryModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}
    </div>
  );
}
