"use client";
import { useState } from "react";
import { Save, Globe, Lock, Bell, CreditCard, Eye, EyeOff } from "lucide-react";
import TopBar from "@/components/TopBar";

const TABS = [
  { key: "general",       label: "General",       icon: Globe       },
  { key: "security",      label: "Security",       icon: Lock        },
  { key: "notifications", label: "Notifications",  icon: Bell        },
  { key: "billing",       label: "Billing",        icon: CreditCard  },
];

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-surface-700 mb-1.5">{label}</label>
      {hint && <p className="text-xs text-surface-400 mb-2">{hint}</p>}
      {children}
    </div>
  );
}

function Input({ type = "text", defaultValue, placeholder, disabled }) {
  return (
    <input
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-800 bg-white placeholder:text-surface-400 focus:border-primary-500 focus:ring-0 outline-none transition-colors disabled:bg-surface-50 disabled:text-surface-400"
    />
  );
}

function Select({ options, defaultValue }) {
  return (
    <select
      defaultValue={defaultValue}
      className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-800 bg-white focus:border-primary-500 focus:ring-0 outline-none transition-colors cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

function Toggle({ label, description, defaultChecked = false }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-start justify-between py-4 border-b border-surface-100 last:border-0">
      <div className="flex-1 mr-4">
        <p className="text-sm font-semibold text-surface-800">{label}</p>
        {description && <p className="text-xs text-surface-400 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={`relative flex-shrink-0 w-10 h-5.5 rounded-full transition-colors cursor-pointer border-0 ${checked ? "bg-primary-600" : "bg-surface-200"}`}
        style={{ height: 22, width: 40 }}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
          style={{ transition: "transform 0.2s" }}
        />
      </button>
    </div>
  );
}

function SaveButton() {
  return (
    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700 transition-colors cursor-pointer border-0 mt-2">
      <Save size={14} />
      Save Changes
    </button>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab]     = useState("general");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col flex-1">
      <TopBar title="Settings" />

      <div className="flex-1 p-6">
        <div className="max-w-3xl space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-xl p-1.5 w-fit">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-0 ${
                    activeTab === tab.key
                      ? "bg-primary-600 text-white shadow-sm"
                      : "text-surface-500 hover:text-surface-800 hover:bg-surface-50 bg-transparent"
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* General Tab */}
          {activeTab === "general" && (
            <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-5">
              <div>
                <h2 className="text-sm font-bold text-surface-900">General Settings</h2>
                <p className="text-xs text-surface-400 mt-0.5">Manage your platform configuration</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Platform Name">
                  <Input defaultValue="Salooote" />
                </Field>
                <Field label="Support Email">
                  <Input type="email" defaultValue="support@salooote.am" />
                </Field>
                <Field label="Support Phone">
                  <Input defaultValue="+374 77 123 456" />
                </Field>
                <Field label="Currency">
                  <Select
                    defaultValue="USD"
                    options={[
                      { value: "USD", label: "USD — US Dollar" },
                      { value: "EUR", label: "EUR — Euro" },
                      { value: "AMD", label: "AMD — Armenian Dram" },
                    ]}
                  />
                </Field>
                <Field label="Language">
                  <Select
                    defaultValue="en"
                    options={[
                      { value: "en",  label: "English" },
                      { value: "hy",  label: "Armenian" },
                      { value: "ru",  label: "Russian" },
                    ]}
                  />
                </Field>
                <Field label="Timezone">
                  <Select
                    defaultValue="asia_yerevan"
                    options={[
                      { value: "asia_yerevan", label: "Asia/Yerevan (GMT+4)" },
                      { value: "utc",          label: "UTC" },
                      { value: "europe_moscow",label: "Europe/Moscow (GMT+3)" },
                    ]}
                  />
                </Field>
              </div>
              <Field label="Platform Address" hint="Physical address shown in emails and receipts">
                <textarea
                  defaultValue="123 Abovyan St, Yerevan, Armenia"
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-800 bg-white placeholder:text-surface-400 focus:border-primary-500 outline-none transition-colors resize-none"
                />
              </Field>
              <SaveButton />
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-5">
              <div>
                <h2 className="text-sm font-bold text-surface-900">Security Settings</h2>
                <p className="text-xs text-surface-400 mt-0.5">Manage passwords and authentication</p>
              </div>
              <div className="space-y-5">
                <Field label="Current Password">
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-800 bg-white placeholder:text-surface-400 focus:border-primary-500 outline-none transition-colors pr-10"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 cursor-pointer border-0 bg-transparent"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </Field>
                <Field label="New Password">
                  <Input type="password" placeholder="Enter new password" />
                </Field>
                <Field label="Confirm New Password">
                  <Input type="password" placeholder="Confirm new password" />
                </Field>

                <div className="pt-4 border-t border-surface-100">
                  <p className="text-sm font-bold text-surface-800 mb-3">Two-Factor Authentication</p>
                  <div className="flex items-center justify-between p-4 bg-surface-50 rounded-xl border border-surface-200">
                    <div>
                      <p className="text-sm font-semibold text-surface-700">Authenticator App</p>
                      <p className="text-xs text-surface-400 mt-0.5">Use an authenticator app for extra security</p>
                    </div>
                    <span className="badge badge-warning">Not set up</span>
                  </div>
                </div>
              </div>
              <SaveButton />
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-1">
              <div className="mb-4">
                <h2 className="text-sm font-bold text-surface-900">Notification Preferences</h2>
                <p className="text-xs text-surface-400 mt-0.5">Choose what you want to be notified about</p>
              </div>
              <Toggle label="New Orders"         description="Get notified when a new order is placed"             defaultChecked={true}  />
              <Toggle label="New Vendor Sign-ups" description="Get notified when a vendor registers"               defaultChecked={true}  />
              <Toggle label="User Reports"        description="Get notified when a user is reported"               defaultChecked={true}  />
              <Toggle label="Low Stock Alerts"    description="Notify when products fall below minimum stock"      defaultChecked={false} />
              <Toggle label="Revenue Milestones"  description="Get notified when revenue targets are hit"          defaultChecked={true}  />
              <Toggle label="System Updates"      description="Receive platform and security update notifications" defaultChecked={false} />
              <Toggle label="Weekly Summary"      description="Receive a weekly report every Monday morning"       defaultChecked={true}  />
              <div className="pt-4">
                <SaveButton />
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <div className="space-y-5">
              {/* Current Plan */}
              <div className="bg-white rounded-xl border border-surface-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-surface-900">Current Plan</h2>
                    <p className="text-xs text-surface-400 mt-0.5">Your active subscription</p>
                  </div>
                  <span className="badge badge-success">Active</span>
                </div>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-3xl font-bold text-surface-900">$79</span>
                  <span className="text-sm text-surface-400 mb-1">/month</span>
                </div>
                <p className="text-sm font-semibold text-primary-600">Pro Plan</p>
                <p className="text-xs text-surface-400 mt-1">Renews on May 7, 2026</p>
                <div className="mt-4 flex gap-3">
                  <button className="px-4 py-2 rounded-xl bg-primary-600 text-sm font-semibold text-white hover:bg-primary-700 transition-colors cursor-pointer border-0">Upgrade Plan</button>
                  <button className="px-4 py-2 rounded-xl border border-surface-200 text-sm font-semibold text-surface-600 hover:bg-surface-50 transition-colors cursor-pointer bg-white">Cancel Plan</button>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl border border-surface-200 p-6">
                <h2 className="text-sm font-bold text-surface-900 mb-4">Payment Method</h2>
                <div className="flex items-center gap-4 p-4 bg-surface-50 rounded-xl border border-surface-200">
                  <div className="w-10 h-7 rounded bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">VISA</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-surface-800">Visa ending in 4242</p>
                    <p className="text-xs text-surface-400">Expires 12/27</p>
                  </div>
                  <button className="text-xs font-semibold text-primary-600 hover:underline cursor-pointer border-0 bg-transparent">Update</button>
                </div>
              </div>

              {/* Billing History */}
              <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-surface-100">
                  <h2 className="text-sm font-bold text-surface-900">Billing History</h2>
                </div>
                <div className="divide-y divide-surface-50">
                  {[
                    { date: "Apr 7, 2026",  amount: "$79", status: "Paid" },
                    { date: "Mar 7, 2026",  amount: "$79", status: "Paid" },
                    { date: "Feb 7, 2026",  amount: "$79", status: "Paid" },
                    { date: "Jan 7, 2026",  amount: "$79", status: "Paid" },
                  ].map((invoice, i) => (
                    <div key={i} className="flex items-center px-6 py-3.5 hover:bg-surface-50 transition-colors">
                      <p className="text-sm text-surface-600 flex-1">Pro Plan — {invoice.date}</p>
                      <span className="font-bold text-surface-900 mr-4">{invoice.amount}</span>
                      <span className="badge badge-success mr-3">{invoice.status}</span>
                      <button className="text-xs text-primary-600 font-semibold hover:underline cursor-pointer border-0 bg-transparent">Download</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
