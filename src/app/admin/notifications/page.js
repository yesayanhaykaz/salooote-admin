"use client";
import { useState } from "react";
import {
  Bell, Send, Users, Store, User, BarChart2,
  Trash2, RotateCcw, Mail, MessageSquare, Smartphone,
  Calendar, CheckCircle2, Clock, Eye,
} from "lucide-react";
import TopBar from "@/components/TopBar";

const NOTIFICATION_HISTORY = [
  {
    id: 1,
    title: "Platform Maintenance Notice",
    message: "We will be undergoing scheduled maintenance on April 10, 2025 from 2:00–4:00 AM. Services may be unavailable.",
    target: "All Users",
    channels: ["in-app", "email"],
    sentDate: "Apr 6, 2025 — 9:00 AM",
    delivered: 3891,
    openRate: "68%",
    status: "delivered",
  },
  {
    id: 2,
    title: "New Vendor Approval: Lense & Light",
    message: "Your vendor account has been reviewed and approved. You can now list your services on Salooote.",
    target: "Specific Vendor",
    channels: ["in-app", "email"],
    sentDate: "Apr 5, 2025 — 11:30 AM",
    delivered: 1,
    openRate: "100%",
    status: "delivered",
  },
  {
    id: 3,
    title: "Pending Payment Reminder",
    message: "You have an outstanding balance of $250. Please complete your payment to avoid service interruption.",
    target: "All Vendors",
    channels: ["email", "sms"],
    sentDate: "Apr 4, 2025 — 10:00 AM",
    delivered: 48,
    openRate: "54%",
    status: "delivered",
  },
  {
    id: 4,
    title: "New Feature: Event Planner",
    message: "Check out our brand new Event Planner tool! Plan your perfect event with our smart checklist and budget tracker.",
    target: "All Users",
    channels: ["in-app"],
    sentDate: "Apr 2, 2025 — 3:00 PM",
    delivered: 3891,
    openRate: "42%",
    status: "delivered",
  },
  {
    id: 5,
    title: "Subscription Expiring Soon",
    message: "Your Pro subscription expires in 7 days. Renew now to keep your featured badge and priority placement.",
    target: "All Vendors",
    channels: ["email", "in-app"],
    sentDate: "Mar 30, 2025 — 8:00 AM",
    delivered: 36,
    openRate: "71%",
    status: "delivered",
  },
  {
    id: 6,
    title: "Spring Promo: 20% Off All Flower Vendors",
    message: "Celebrate spring with 20% off bookings at any flower vendor this week only! Use code: SPRING25.",
    target: "All Users",
    channels: ["in-app", "email", "sms"],
    sentDate: "Mar 25, 2025 — 12:00 PM",
    delivered: 3780,
    openRate: "61%",
    status: "delivered",
  },
];

const CHANNEL_BADGE = {
  "in-app": "badge badge-info",
  "email":  "badge badge-purple",
  "sms":    "badge badge-warning",
};

const CHANNEL_ICON = {
  "in-app": Bell,
  "email":  Mail,
  "sms":    Smartphone,
};

function ChannelBadge({ channel }) {
  const Icon = CHANNEL_ICON[channel];
  return (
    <span className={`${CHANNEL_BADGE[channel] || "badge badge-gray"} flex items-center gap-1`}>
      {Icon && <Icon size={10} />}
      {channel}
    </span>
  );
}

function NotificationPreview({ title, message, channels }) {
  return (
    <div className="bg-surface-50 rounded-xl border border-surface-200 p-4">
      <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wide mb-3">Preview</p>
      <div className="space-y-2">
        {/* In-App preview */}
        {(channels.includes("in-app") || channels.length === 0) && (
          <div className="bg-white rounded-lg border border-surface-200 p-3 shadow-sm">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                <Bell size={13} className="text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-surface-800 truncate">{title || "Notification Title"}</p>
                <p className="text-[11px] text-surface-500 mt-0.5 line-clamp-2">{message || "Notification message will appear here..."}</p>
                <p className="text-[10px] text-surface-300 mt-1">Just now</p>
              </div>
            </div>
          </div>
        )}
        {channels.includes("email") && (
          <div className="bg-white rounded-lg border border-surface-200 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Mail size={12} className="text-surface-400" />
              <span className="text-[10px] font-semibold text-surface-500">EMAIL PREVIEW</span>
            </div>
            <p className="text-xs font-bold text-surface-800">{title || "Subject line here"}</p>
            <p className="text-[11px] text-surface-400 mt-0.5 line-clamp-2">{message || "Email body preview..."}</p>
          </div>
        )}
        {channels.includes("sms") && (
          <div className="bg-white rounded-lg border border-surface-200 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Smartphone size={12} className="text-surface-400" />
              <span className="text-[10px] font-semibold text-surface-500">SMS PREVIEW</span>
            </div>
            <p className="text-[11px] text-surface-600 line-clamp-2">{message ? `Salooote: ${message}` : "Salooote: Message text here"}</p>
            <p className="text-[10px] text-surface-300 mt-1">{message ? `${message.length}/160 chars` : "0/160 chars"}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [history, setHistory] = useState(NOTIFICATION_HISTORY);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all_users");
  const [channels, setChannels] = useState(["in-app"]);
  const [schedule, setSchedule] = useState("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [sending, setSending] = useState(false);

  const toggleChannel = (ch) => {
    setChannels(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  const handleSend = () => {
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    setTimeout(() => {
      const targetLabels = {
        all_users:       "All Users",
        all_vendors:     "All Vendors",
        specific_user:   "Specific User",
        specific_vendor: "Specific Vendor",
        all:             "Everyone",
      };
      const newNotif = {
        id: Date.now(),
        title,
        message,
        target: targetLabels[target] || target,
        channels: [...channels],
        sentDate: schedule === "now" ? "Just now" : scheduleDate,
        delivered: 0,
        openRate: "—",
        status: schedule === "now" ? "delivered" : "scheduled",
      };
      setHistory(prev => [newNotif, ...prev]);
      setTitle("");
      setMessage("");
      setChannels(["in-app"]);
      setTarget("all_users");
      setSchedule("now");
      setScheduleDate("");
      setSending(false);
    }, 600);
  };

  const handleDelete = (id) => {
    setHistory(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Notifications & Broadcasts" />

      <div className="flex-1 p-6">
        <div className="flex gap-6 h-full">
          {/* LEFT — Send Notification Form (40%) */}
          <div className="w-[40%] flex-shrink-0 space-y-4">
            <div className="bg-white rounded-xl border border-surface-200 p-5 space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                  <Send size={14} className="text-primary-600" />
                </div>
                <h2 className="text-base font-bold text-surface-900">Send Notification</h2>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-surface-600">Title</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Notification title..."
                  className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm text-surface-700 focus:outline-none focus:border-primary-400 placeholder:text-surface-300"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-surface-600">Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Write your notification message..."
                  rows={4}
                  className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm text-surface-700 resize-none focus:outline-none focus:border-primary-400 placeholder:text-surface-300"
                />
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-surface-600">Target Audience</label>
                <div className="space-y-1.5">
                  {[
                    { key: "all_users",       label: "All Users",       Icon: Users },
                    { key: "all_vendors",     label: "All Vendors",     Icon: Store },
                    { key: "specific_user",   label: "Specific User",   Icon: User },
                    { key: "specific_vendor", label: "Specific Vendor", Icon: Store },
                    { key: "all",             label: "Everyone",        Icon: Bell },
                  ].map(({ key, label, Icon }) => (
                    <label
                      key={key}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        target === key
                          ? "border-primary-400 bg-primary-50"
                          : "border-surface-200 hover:bg-surface-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="target"
                        value={key}
                        checked={target === key}
                        onChange={() => setTarget(key)}
                        className="accent-primary-600 cursor-pointer"
                      />
                      <Icon size={14} className={target === key ? "text-primary-600" : "text-surface-400"} />
                      <span className={`text-sm font-medium ${target === key ? "text-primary-700" : "text-surface-600"}`}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Channels */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-surface-600">Delivery Channels</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { key: "in-app", label: "In-App",  Icon: Bell },
                    { key: "email",  label: "Email",   Icon: Mail },
                    { key: "sms",    label: "SMS",     Icon: Smartphone },
                  ].map(({ key, label, Icon }) => (
                    <label
                      key={key}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                        channels.includes(key)
                          ? "border-primary-400 bg-primary-50 text-primary-700"
                          : "border-surface-200 text-surface-500 hover:bg-surface-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={channels.includes(key)}
                        onChange={() => toggleChannel(key)}
                        className="accent-primary-600 cursor-pointer"
                      />
                      <Icon size={13} />
                      <span className="text-sm font-medium">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-surface-600">Schedule</label>
                <div className="flex items-center gap-3">
                  <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors flex-1 ${
                    schedule === "now" ? "border-primary-400 bg-primary-50" : "border-surface-200 hover:bg-surface-50"
                  }`}>
                    <input
                      type="radio"
                      name="schedule"
                      value="now"
                      checked={schedule === "now"}
                      onChange={() => setSchedule("now")}
                      className="accent-primary-600 cursor-pointer"
                    />
                    <Send size={12} className={schedule === "now" ? "text-primary-600" : "text-surface-400"} />
                    <span className={`text-sm font-medium ${schedule === "now" ? "text-primary-700" : "text-surface-600"}`}>Send Now</span>
                  </label>
                  <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors flex-1 ${
                    schedule === "later" ? "border-primary-400 bg-primary-50" : "border-surface-200 hover:bg-surface-50"
                  }`}>
                    <input
                      type="radio"
                      name="schedule"
                      value="later"
                      checked={schedule === "later"}
                      onChange={() => setSchedule("later")}
                      className="accent-primary-600 cursor-pointer"
                    />
                    <Calendar size={12} className={schedule === "later" ? "text-primary-600" : "text-surface-400"} />
                    <span className={`text-sm font-medium ${schedule === "later" ? "text-primary-700" : "text-surface-600"}`}>Schedule</span>
                  </label>
                </div>
                {schedule === "later" && (
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={e => setScheduleDate(e.target.value)}
                    className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm text-surface-600 bg-surface-50 focus:outline-none focus:border-primary-400 cursor-pointer mt-2"
                  />
                )}
              </div>

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={!title.trim() || !message.trim() || sending}
                className="w-full py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <Clock size={14} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    {schedule === "now" ? "Send Notification" : "Schedule Notification"}
                  </>
                )}
              </button>
            </div>

            {/* Preview */}
            <NotificationPreview title={title} message={message} channels={channels} />
          </div>

          {/* RIGHT — Notification History (60%) */}
          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-surface-900">Notification History</h2>
              <span className="text-xs text-surface-400">{history.length} notifications</span>
            </div>

            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-4 px-5 py-3 bg-surface-50 border-b border-surface-100 text-xs font-semibold text-surface-500 uppercase tracking-wide">
                <span>Title & Target</span>
                <span className="text-right">Channels</span>
                <span className="text-right">Sent</span>
                <span className="text-right">Delivered</span>
                <span className="text-right">Open Rate</span>
                <span className="text-right">Actions</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-surface-50">
                {history.length === 0 ? (
                  <div className="py-16 text-center">
                    <Bell size={28} className="text-surface-200 mx-auto mb-3" />
                    <p className="text-sm text-surface-400">No notifications yet</p>
                  </div>
                ) : history.map(notif => (
                  <div key={notif.id} className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-4 px-5 py-3.5 items-center hover:bg-surface-50 transition-colors">
                    {/* Title + Target */}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-surface-800 truncate">{notif.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {notif.target === "All Users" || notif.target === "Everyone" ? (
                          <Users size={10} className="text-surface-400" />
                        ) : notif.target === "All Vendors" ? (
                          <Store size={10} className="text-surface-400" />
                        ) : (
                          <User size={10} className="text-surface-400" />
                        )}
                        <span className="text-xs text-surface-400">{notif.target}</span>
                        {notif.status === "scheduled" && (
                          <span className="badge badge-warning">Scheduled</span>
                        )}
                      </div>
                    </div>

                    {/* Channels */}
                    <div className="flex items-center gap-1 flex-wrap justify-end">
                      {notif.channels.map(ch => (
                        <ChannelBadge key={ch} channel={ch} />
                      ))}
                    </div>

                    {/* Sent Date */}
                    <span className="text-xs text-surface-400 text-right whitespace-nowrap">{notif.sentDate}</span>

                    {/* Delivered */}
                    <div className="text-right">
                      <span className="text-sm font-bold text-surface-800">{notif.delivered.toLocaleString()}</span>
                    </div>

                    {/* Open Rate */}
                    <div className="text-right">
                      <span className={`text-sm font-semibold ${
                        notif.openRate === "—" ? "text-surface-400" :
                        parseInt(notif.openRate) >= 60 ? "text-green-600" :
                        parseInt(notif.openRate) >= 40 ? "text-amber-600" : "text-red-500"
                      }`}>{notif.openRate}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        title="Resend"
                        className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 transition-colors cursor-pointer bg-white"
                      >
                        <RotateCcw size={12} />
                      </button>
                      <button
                        title="View Stats"
                        className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer bg-white"
                      >
                        <BarChart2 size={12} />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => handleDelete(notif.id)}
                        className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors cursor-pointer bg-white"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
