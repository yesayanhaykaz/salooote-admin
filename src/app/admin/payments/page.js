"use client";
import { useState } from "react";
import {
  DollarSign, TrendingUp, AlertCircle, Clock, Download, RefreshCw,
  CreditCard, Filter,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import TopBar from "@/components/TopBar";
import StatsCard from "@/components/StatsCard";
import DataTable from "@/components/DataTable";
import { REVENUE_DATA } from "@/lib/data";

// ─── Sample data ────────────────────────────────────────────────────────────
const PAYMENTS = [
  { invoice: "#INV-2042", vendor: "Salooote Flowers",    amount: "$79",  plan: "Premium", method: "Visa",       last4: "4242", date: "Apr 1, 2025",  status: "paid" },
  { invoice: "#INV-2041", vendor: "Sweet Dreams Bakery", amount: "$29",  plan: "Pro",     method: "MasterCard", last4: "8210", date: "Apr 2, 2025",  status: "paid" },
  { invoice: "#INV-2040", vendor: "Sound Wave DJ",       amount: "$29",  plan: "Pro",     method: "Visa",       last4: "1111", date: "Apr 3, 2025",  status: "paid" },
  { invoice: "#INV-2039", vendor: "Glamour Makeup",      amount: "$29",  plan: "Pro",     method: "Visa",       last4: "5678", date: "Apr 3, 2025",  status: "paid" },
  { invoice: "#INV-2038", vendor: "Cater King",          amount: "$29",  plan: "Pro",     method: "MasterCard", last4: "9900", date: "Mar 31, 2025", status: "failed" },
  { invoice: "#INV-2037", vendor: "Party Planet",        amount: "$0",   plan: "Basic",   method: "—",          last4: "",     date: "Apr 5, 2025",  status: "paid" },
  { invoice: "#INV-2036", vendor: "Bloom Studio",        amount: "$0",   plan: "Basic",   method: "—",          last4: "",     date: "Mar 28, 2025", status: "paid" },
  { invoice: "#INV-2035", vendor: "Lense & Light",       amount: "$29",  plan: "Pro",     method: "Visa",       last4: "3344", date: "Mar 25, 2025", status: "refunded" },
  { invoice: "#INV-2034", vendor: "Bloom Weddings",      amount: "$29",  plan: "Pro",     method: "MasterCard", last4: "7712", date: "Mar 20, 2025", status: "failed" },
  { invoice: "#INV-2033", vendor: "DJ Artak",            amount: "$29",  plan: "Pro",     method: "Visa",       last4: "2200", date: "Mar 15, 2025", status: "pending" },
];

const FAILED = [
  { vendor: "Cater King",     invoice: "#INV-2038", amount: "$29", date: "Mar 31, 2025", reason: "Insufficient funds",  attempts: 2 },
  { vendor: "Bloom Weddings", invoice: "#INV-2034", amount: "$29", date: "Mar 20, 2025", reason: "Card declined",        attempts: 3 },
  { vendor: "DJ Artak",       invoice: "#INV-2033", amount: "$29", date: "Mar 15, 2025", reason: "Expired card",         attempts: 1 },
];

const STATUS_BADGE = {
  paid:     "badge badge-success",
  failed:   "badge badge-danger",
  refunded: "badge badge-warning",
  pending:  "badge badge-info",
};

const METHOD_COLOR = {
  Visa:       "bg-blue-100 text-blue-700",
  MasterCard: "bg-orange-100 text-orange-700",
};

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-surface-200 rounded-xl shadow-lg px-4 py-3">
      <p className="text-xs font-bold text-surface-600 mb-1">{label}</p>
      <p className="text-sm font-bold text-primary-600">${payload[0].value.toLocaleString()}</p>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function PaymentsPage() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");

  const filteredPayments = PAYMENTS.filter(p => {
    const statusOk = statusFilter === "All" || p.status === statusFilter.toLowerCase();
    const methodOk = methodFilter === "All" || p.method === methodFilter;
    return statusOk && methodOk;
  });

  const columns = [
    { key: "invoice", label: "Invoice", sortable: true,
      render: (val) => <span className="font-mono text-xs font-semibold text-surface-700">{val}</span> },
    { key: "vendor", label: "Vendor / Payer", sortable: true,
      render: (val) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary-600">{val.charAt(0)}</span>
          </div>
          <span className="text-sm font-medium text-surface-800">{val}</span>
        </div>
      ),
    },
    { key: "amount", label: "Amount", sortable: true,
      render: (val) => <span className="font-semibold text-surface-900">{val}</span> },
    { key: "plan", label: "Plan",
      render: (val) => {
        const cls = { Premium: "badge badge-purple", Pro: "badge badge-info", Basic: "badge badge-gray" };
        return <span className={cls[val] || "badge badge-gray"}>{val}</span>;
      },
    },
    { key: "method", label: "Method",
      render: (val, row) => val === "—" ? (
        <span className="text-xs text-surface-300">—</span>
      ) : (
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${METHOD_COLOR[val] || "bg-surface-100 text-surface-600"}`}>{val}</span>
          {row.last4 && <span className="text-xs text-surface-400">···{row.last4}</span>}
        </div>
      ),
    },
    { key: "date", label: "Date", sortable: true },
    { key: "status", label: "Status",
      render: (val) => <span className={STATUS_BADGE[val] || "badge badge-gray"}>{val.charAt(0).toUpperCase() + val.slice(1)}</span> },
    { key: "invoice", label: "Actions",
      render: (val, row) => (
        <div className="flex items-center gap-1.5">
          <button className="flex items-center gap-1 text-xs font-medium text-surface-600 hover:text-surface-800 bg-surface-50 hover:bg-surface-100 px-2.5 py-1 rounded-lg cursor-pointer border-none transition-colors">
            <Download size={11} /> Download
          </button>
          {row.status === "paid" && (
            <button className="text-xs font-medium text-warning-600 hover:text-warning-700 bg-warning-50 hover:bg-warning-100 px-2.5 py-1 rounded-lg cursor-pointer border-none transition-colors">Refund</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Payments"
        subtitle="Track revenue, invoices and refunds"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors cursor-pointer border-none">
            <Download size={14} /> Export
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard label="Total Revenue"    value="$78,400" change={12.4} changeLabel="all time"       icon={DollarSign}  iconBg="bg-success-50"  iconColor="text-success-600" />
          <StatsCard label="This Month"       value="$29,700" change={8.7}  changeLabel="vs last month"  icon={TrendingUp}  iconBg="bg-primary-50"  iconColor="text-primary-600" />
          <StatsCard label="Failed Payments"  value="3"       change={-25}  changeLabel="vs last month"  icon={AlertCircle} iconBg="bg-danger-50"   iconColor="text-danger-600" />
          <StatsCard label="Pending Refunds"  value="1"       changeLabel="awaiting review"              icon={Clock}       iconBg="bg-warning-50"  iconColor="text-warning-600" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-surface-200 px-5 py-4 flex flex-wrap items-center gap-3">
          <Filter size={15} className="text-surface-400" />
          <span className="text-xs font-semibold text-surface-500">Filters:</span>

          <div className="flex items-center gap-1.5">
            <label className="text-xs text-surface-500">Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="border border-surface-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary-400 bg-white cursor-pointer">
              {["All", "Paid", "Failed", "Refunded", "Pending"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-xs text-surface-500">Method</label>
            <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)}
              className="border border-surface-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-primary-400 bg-white cursor-pointer">
              {["All", "Visa", "MasterCard"].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-xs text-surface-400">{filteredPayments.length} results</span>
          </div>
        </div>

        {/* Payments Table */}
        <DataTable
          columns={columns}
          data={filteredPayments}
          pageSize={8}
          searchable
          searchKeys={["invoice", "vendor", "status", "plan"]}
        />

        {/* Failed Payments Panel */}
        <div className="bg-white rounded-xl border border-danger-200 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 bg-danger-50 border-b border-danger-100">
            <AlertCircle size={16} className="text-danger-600" />
            <h2 className="text-sm font-bold text-danger-700">Failed Payment Attempts</h2>
            <span className="badge badge-danger ml-1">{FAILED.length}</span>
          </div>
          <div className="divide-y divide-surface-100">
            {FAILED.map((f, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-danger-100 flex items-center justify-center">
                    <CreditCard size={15} className="text-danger-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-800">{f.vendor}</p>
                    <p className="text-xs text-surface-400">{f.invoice} · {f.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-surface-900">{f.amount}</p>
                    <p className="text-xs text-surface-400">{f.date} · {f.attempts} attempt{f.attempts > 1 ? "s" : ""}</p>
                  </div>
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-danger-600 hover:bg-danger-700 px-3 py-1.5 rounded-lg cursor-pointer border-none transition-colors">
                    <RefreshCw size={12} /> Retry
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-surface-900">Monthly Revenue</h2>
              <p className="text-xs text-surface-400 mt-0.5">Last 7 months</p>
            </div>
            <span className="badge badge-success">+8.7% vs last month</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={REVENUE_DATA} barSize={32} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="revenue" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
