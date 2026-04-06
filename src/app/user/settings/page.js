"use client";
import { useState, useRef } from "react";
import { Camera, Save, Plus, Pencil, Trash2, Eye, EyeOff, AlertTriangle, Upload, X } from "lucide-react";
import TopBar from "@/components/TopBar";

function InputField({ label, type = "text", defaultValue = "", placeholder = "" }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-surface-700 mb-1.5">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg bg-white text-surface-800 placeholder:text-surface-400 focus:border-primary-600 transition-colors outline-none"
      />
    </div>
  );
}

const ADDRESSES = [
  { id: 1, label: "Home",   address: "12 Abovyan St, Yerevan, Armenia", default: true  },
  { id: 2, label: "Work",   address: "45 Tigranyan St, Yerevan, Armenia", default: false },
];

function AvatarUpload({ image, onImage }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    onImage(URL.createObjectURL(file));
  };

  return (
    <div className="flex items-center gap-5">
      {/* Avatar preview */}
      <div
        className="relative flex-shrink-0 cursor-pointer group"
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
      >
        <div className={`w-20 h-20 rounded-full overflow-hidden border-2 transition-all ${dragging ? "border-primary-400 scale-105" : "border-surface-200"}`}>
          {image ? (
            <img src={image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-primary-600 flex items-center justify-center">
              <span className="text-white text-xl font-bold">A</span>
            </div>
          )}
        </div>
        <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
          <Camera size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {image && (
          <button
            onClick={(e) => { e.stopPropagation(); onImage(null); }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-white border border-surface-200 rounded-full flex items-center justify-center text-surface-500 hover:bg-red-50 hover:text-red-500 cursor-pointer"
          >
            <X size={10} />
          </button>
        )}
      </div>

      {/* Upload info */}
      <div>
        <p className="text-sm font-semibold text-surface-800 mb-0.5">Anna Hovhannisyan</p>
        <p className="text-xs text-surface-400 mb-2">JPG, PNG or GIF. Max 2MB.</p>
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-surface-200 rounded-lg text-surface-600 hover:bg-surface-50 cursor-pointer bg-white"
        >
          <Upload size={12} /> Upload Photo
        </button>
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
    </div>
  );
}

export default function UserSettings() {
  const [avatarImage, setAvatarImage] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [notifications, setNotifications] = useState({
    orders: true, messages: true, events: true, promotions: false, newsletter: false,
  });
  const [addresses, setAddresses] = useState(ADDRESSES);
  const [addingAddr, setAddingAddr] = useState(false);
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("usd");

  const toggleNotif = key => setNotifications(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title="Settings" />

      <main className="flex-1 p-6 max-w-3xl space-y-6">

        {/* Profile Section */}
        <div className="bg-white rounded-xl border border-surface-200 p-6">
          <h2 className="text-sm font-bold text-surface-900 mb-5">Profile</h2>

          {/* Avatar */}
          <div className="mb-6">
            <AvatarUpload image={avatarImage} onImage={setAvatarImage} />
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <InputField label="Full Name"    defaultValue="Anna Hovhannisyan" />
            <InputField label="Email"        type="email" defaultValue="anna@example.com" />
            <InputField label="Phone Number" type="tel"   defaultValue="+374 91 234 567" />
            <InputField label="Date of Birth" type="date" defaultValue="1995-05-20" />
          </div>

          {/* Change Password */}
          <div className="border-t border-surface-100 pt-4">
            <h3 className="text-xs font-semibold text-surface-700 mb-3">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["Current Password", "New Password", "Confirm Password"].map((label, i) => (
                <div key={i}>
                  <label className="block text-xs font-semibold text-surface-700 mb-1.5">{label}</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 pr-9 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 transition-colors"
                    />
                    {i === 1 && (
                      <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 cursor-pointer border-none bg-transparent">
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <button className="flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none">
              <Save size={14} /> Save Profile
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl border border-surface-200 p-6">
          <h2 className="text-sm font-bold text-surface-900 mb-5">Preferences</h2>

          {/* Notification Toggles */}
          <h3 className="text-xs font-semibold text-surface-600 uppercase tracking-wide mb-3">Notifications</h3>
          <div className="space-y-3 mb-6">
            {[
              { key: "orders",     label: "Order Updates",       desc: "Status changes and confirmations" },
              { key: "messages",   label: "New Messages",         desc: "Messages from vendors" },
              { key: "events",     label: "Event Reminders",      desc: "Upcoming event alerts" },
              { key: "promotions", label: "Promotions & Deals",   desc: "Special offers and discounts" },
              { key: "newsletter", label: "Newsletter",           desc: "Monthly platform updates" },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-2 border-b border-surface-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-surface-800">{item.label}</p>
                  <p className="text-xs text-surface-400">{item.desc}</p>
                </div>
                <div
                  onClick={() => toggleNotif(item.key)}
                  className="relative cursor-pointer flex-shrink-0"
                  style={{ width: 40, height: 22 }}
                >
                  <div className={`w-full h-full rounded-full transition-colors ${notifications[item.key] ? "bg-primary-600" : "bg-surface-200"}`} />
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifications[item.key] ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Language & Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 bg-white"
              >
                <option value="en">English</option>
                <option value="hy">Armenian (Հայերեն)</option>
                <option value="ru">Russian (Русский)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600 bg-white"
              >
                <option value="usd">USD ($)</option>
                <option value="amd">AMD (֏)</option>
                <option value="eur">EUR (€)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <button className="flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none">
              <Save size={14} /> Save Preferences
            </button>
          </div>
        </div>

        {/* Addresses */}
        <div className="bg-white rounded-xl border border-surface-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-surface-900">Saved Addresses</h2>
            <button
              onClick={() => setAddingAddr(!addingAddr)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer border-none"
            >
              <Plus size={13} /> Add Address
            </button>
          </div>

          <div className="space-y-3">
            {addresses.map(addr => (
              <div key={addr.id} className="flex items-start justify-between p-4 rounded-lg border border-surface-100 hover:border-surface-200 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-surface-800">{addr.label}</span>
                    {addr.default && <span className="badge badge-purple">Default</span>}
                  </div>
                  <p className="text-xs text-surface-500">{addr.address}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button className="w-7 h-7 flex items-center justify-center text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent">
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setAddresses(prev => prev.filter(a => a.id !== addr.id))}
                    className="w-7 h-7 flex items-center justify-center text-surface-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}

            {addingAddr && (
              <div className="p-4 rounded-lg border border-primary-200 bg-primary-50/30 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Label" placeholder="Home, Work…" />
                  <InputField label="City"  placeholder="Yerevan" />
                </div>
                <InputField label="Full Address" placeholder="Street, district…" />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setAddingAddr(false)} className="px-3 py-1.5 text-xs font-medium text-surface-600 border border-surface-200 rounded-lg hover:bg-surface-50 cursor-pointer bg-white">
                    Cancel
                  </button>
                  <button onClick={() => setAddingAddr(false)} className="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 cursor-pointer border-none">
                    Save Address
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

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
