"use client";
import { useState, useEffect } from "react";
import { Save, Eye, EyeOff, AlertTriangle, User, Lock } from "lucide-react";
import TopBar from "@/components/TopBar";
import { userAPI } from "@/lib/api";
import { useLocale } from "@/lib/i18n";

function InputField({ label, name, type = "text", value, onChange, placeholder = "", disabled = false }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-surface-700 mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg bg-white text-surface-800 placeholder:text-surface-400 focus:border-primary-600 transition-colors outline-none disabled:bg-surface-50 disabled:text-surface-400"
      />
    </div>
  );
}

function Toast({ msg, type }) {
  if (!msg) return null;
  const cls = type === "success"
    ? "bg-success-50 border-success-200 text-success-700"
    : "bg-danger-50 border-danger-200 text-danger-700";
  return (
    <div className={`border rounded-lg px-4 py-2.5 text-sm font-medium ${cls}`}>{msg}</div>
  );
}

export default function UserSettings() {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile
  const [profile, setProfile] = useState({ first_name: "", last_name: "", phone: "", email: "" });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ msg: "", type: "" });

  // Password
  const [passwords, setPasswords] = useState({ current_password: "", new_password: "", confirm_new_password: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [passMsg, setPassMsg] = useState({ msg: "", type: "" });

  useEffect(() => {
    userAPI.getProfile()
      .then(res => {
        const d = res?.data || res;
        setProfile({
          first_name: d?.first_name || "",
          last_name: d?.last_name || "",
          phone: d?.phone || "",
          email: d?.email || "",
        });
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, []);

  function handleProfileChange(e) {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function saveProfile(e) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg({ msg: "", type: "" });
    try {
      await userAPI.updateProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
      });
      setProfileMsg({ msg: t("settings.saved") || "Profile saved successfully.", type: "success" });
    } catch (err) {
      setProfileMsg({ msg: err.message || "Failed to save profile.", type: "error" });
    } finally {
      setProfileSaving(false);
    }
  }

  function handlePasswordChange(e) {
    setPasswords(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function savePassword(e) {
    e.preventDefault();
    setPassMsg({ msg: "", type: "" });
    if (passwords.new_password !== passwords.confirm_new_password) {
      setPassMsg({ msg: "New passwords do not match.", type: "error" });
      return;
    }
    if (passwords.new_password.length < 8) {
      setPassMsg({ msg: "New password must be at least 8 characters.", type: "error" });
      return;
    }
    setPassSaving(true);
    try {
      await userAPI.changePassword({
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      });
      setPassMsg({ msg: "Password changed successfully.", type: "success" });
      setPasswords({ current_password: "", new_password: "", confirm_new_password: "" });
    } catch (err) {
      setPassMsg({ msg: err.message || "Failed to change password.", type: "error" });
    } finally {
      setPassSaving(false);
    }
  }

  const TABS = [
    { key: "profile", label: t("settings.profile") || "Profile", icon: User },
    { key: "password", label: t("settings.password") || "Password", icon: Lock },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title={t("settings.title") || "Settings"} />

      <main className="flex-1 p-6 max-w-2xl space-y-5">

        {/* Tab bar */}
        <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-xl px-2 py-1.5 w-fit">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border-none ${
                activeTab === tab.key ? "bg-primary-600 text-white" : "text-surface-500 hover:bg-surface-100 bg-transparent"
              }`}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-xl border border-surface-200 p-6">
            <h2 className="text-sm font-bold text-surface-900 mb-5">{t("settings.profile") || "Profile"}</h2>
            {profileLoading ? (
              <p className="text-sm text-surface-400 text-center py-8">Loading…</p>
            ) : (
              <form onSubmit={saveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label={t("settings.first_name") || "First Name"}
                    name="first_name"
                    value={profile.first_name}
                    onChange={handleProfileChange}
                    placeholder="First name"
                  />
                  <InputField
                    label={t("settings.last_name") || "Last Name"}
                    name="last_name"
                    value={profile.last_name}
                    onChange={handleProfileChange}
                    placeholder="Last name"
                  />
                  <InputField
                    label={t("settings.phone") || "Phone"}
                    name="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    placeholder="+1 555 000 0000"
                  />
                  <InputField
                    label={t("settings.email") || "Email"}
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={() => {}}
                    disabled
                  />
                </div>

                {profileMsg.msg && <Toast msg={profileMsg.msg} type={profileMsg.type} />}

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none disabled:opacity-60"
                  >
                    <Save size={14} /> {profileSaving ? "Saving…" : (t("settings.save") || "Save Changes")}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="bg-white rounded-xl border border-surface-200 p-6">
            <h2 className="text-sm font-bold text-surface-900 mb-5">{t("settings.password") || "Change Password"}</h2>
            <form onSubmit={savePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                  {t("settings.current_password") || "Current Password"}
                </label>
                <div className="relative">
                  <input
                    name="current_password"
                    type={showCurrent ? "text" : "password"}
                    value={passwords.current_password}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pr-10 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 cursor-pointer border-none bg-transparent"
                  >
                    {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                  {t("settings.new_password") || "New Password"}
                </label>
                <div className="relative">
                  <input
                    name="new_password"
                    type={showNew ? "text" : "password"}
                    value={passwords.new_password}
                    onChange={handlePasswordChange}
                    placeholder="Min. 8 characters"
                    className="w-full px-3.5 py-2.5 pr-10 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 cursor-pointer border-none bg-transparent"
                  >
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                  {t("settings.confirm_password") || "Confirm New Password"}
                </label>
                <input
                  name="confirm_new_password"
                  type="password"
                  value={passwords.confirm_new_password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 transition-colors"
                />
              </div>

              {passMsg.msg && <Toast msg={passMsg.msg} type={passMsg.type} />}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={passSaving}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none disabled:opacity-60"
                >
                  <Save size={14} /> {passSaving ? "Saving…" : (t("settings.save") || "Change Password")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Danger Zone */}
        <div className="bg-white rounded-xl border border-danger-200 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 bg-danger-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={16} className="text-danger-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-surface-900">Danger Zone</h2>
              <p className="text-xs text-surface-400 mt-0.5">These actions are permanent and cannot be undone.</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-danger-50 border border-danger-100">
            <div>
              <p className="text-sm font-medium text-surface-800">Delete Account</p>
              <p className="text-xs text-surface-400 mt-0.5">Permanently remove your account and all data</p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-danger-600 border border-danger-200 rounded-lg hover:bg-danger-100 transition-colors cursor-pointer bg-white">
              Delete Account
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
