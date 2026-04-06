"use client";
import { useState, useRef } from "react";
import { Camera, Save, Plus, Upload, X, ImageIcon } from "lucide-react";
import TopBar from "@/components/TopBar";

const TABS = ["Profile", "Store", "Notifications", "Payout"];

const CATEGORIES = ["Cakes & Desserts", "Catering", "Flowers & Gifts", "Party & Decor", "DJ & Music", "Photography", "Venue Decoration"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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

function SaveButton() {
  return (
    <button className="flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none">
      <Save size={14} /> Save Changes
    </button>
  );
}

function UploadAvatarButton({ onFile }) {
  const inputRef = useRef(null);
  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-surface-200 rounded-lg text-surface-600 hover:bg-surface-50 cursor-pointer bg-white"
      >
        <Upload size={12} /> Upload Photo
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />
    </>
  );
}

function ImageUploadBox({ label, hint, aspectClass, image, onImage, shape = "square" }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    onImage(URL.createObjectURL(file));
  };

  return (
    <div>
      {label && <label className="block text-xs font-semibold text-surface-700 mb-2">{label}</label>}
      {hint && <p className="text-[11px] text-surface-400 mb-2">{hint}</p>}
      {image ? (
        <div className={`relative overflow-hidden border-2 border-surface-200 ${aspectClass} ${shape === "circle" ? "rounded-full" : "rounded-xl"}`}>
          <img src={image} alt="" className="w-full h-full object-cover" />
          <button
            onClick={() => onImage(null)}
            className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 cursor-pointer border-0"
          >
            <X size={11} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          className={`${aspectClass} border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${shape === "circle" ? "rounded-full" : "rounded-xl"} ${
            dragging ? "border-primary-400 bg-primary-50" : "border-surface-200 bg-surface-50 hover:border-primary-300 hover:bg-primary-50/30"
          }`}
        >
          <ImageIcon size={20} className="text-surface-300" />
          <p className="text-xs text-surface-400 text-center px-2">Click or drag to upload</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
    </div>
  );
}

function ProfileTab() {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [businessLogo, setBusinessLogo] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  return (
    <div className="space-y-6">
      {/* Cover / Banner Image */}
      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <h3 className="text-sm font-semibold text-surface-900 mb-1">Cover / Banner Image</h3>
        <p className="text-xs text-surface-400 mb-4">Displayed at the top of your store page. Recommended: 1200×400px.</p>
        <ImageUploadBox
          aspectClass="w-full h-36"
          image={coverImage}
          onImage={setCoverImage}
          shape="square"
        />
      </div>

      {/* Logo & Profile Photo side by side */}
      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <h3 className="text-sm font-semibold text-surface-900 mb-5">Brand Identity</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Business Logo */}
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1">Business Logo</label>
            <p className="text-[11px] text-surface-400 mb-3">Square image, min 200×200px. Shown in search results and receipts.</p>
            {businessLogo ? (
              <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-surface-200">
                <img src={businessLogo} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setBusinessLogo(null)} className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 cursor-pointer border-0">
                  <X size={10} />
                </button>
              </div>
            ) : (
              <ImageUploadBox
                aspectClass="w-24 h-24"
                image={businessLogo}
                onImage={setBusinessLogo}
                shape="square"
              />
            )}
          </div>

          {/* Profile / Owner Photo */}
          <div>
            <label className="block text-xs font-semibold text-surface-700 mb-1">Owner / Profile Photo</label>
            <p className="text-[11px] text-surface-400 mb-3">Your personal photo shown on the vendor profile page.</p>
            <div className="flex items-center gap-4">
              {profilePhoto ? (
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-surface-200 flex-shrink-0">
                  <img src={profilePhoto} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setProfilePhoto(null)} className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 cursor-pointer border-0">
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-2xl font-bold">S</span>
                </div>
              )}
              <div>
                <UploadAvatarButton onFile={(f) => setProfilePhoto(URL.createObjectURL(f))} />
                <p className="text-[11px] text-surface-400 mt-1.5">JPG, PNG. Max 2MB.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Info */}
      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <h3 className="text-sm font-semibold text-surface-900 mb-5">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Business Name"   defaultValue="Sweet Dreams Bakery" />
          <InputField label="Contact Email"   type="email" defaultValue="vendor@salooote.am" />
          <InputField label="Phone Number"    type="tel"   defaultValue="+374 77 123 456" />
          <InputField label="Website"         placeholder="https://..." />
        </div>
        <div className="mt-4">
          <InputField label="Address" defaultValue="12 Abovyan St, Yerevan, Armenia" />
        </div>
        <div className="mt-4">
          <label className="block text-xs font-semibold text-surface-700 mb-1.5">Business Bio</label>
          <textarea
            rows={4}
            defaultValue="We specialize in custom cakes and desserts for all occasions. Founded in 2020, Sweet Dreams Bakery has served over 1,000 happy customers across Armenia."
            className="w-full px-3.5 py-2.5 text-sm border border-surface-200 rounded-lg bg-white text-surface-800 focus:border-primary-600 transition-colors outline-none resize-none"
          />
        </div>
        <div className="flex justify-end mt-5">
          <SaveButton />
        </div>
      </div>
    </div>
  );
}

function StoreTab() {
  const [selectedCats, setSelectedCats] = useState(["Cakes & Desserts"]);
  const [delivery, setDelivery] = useState({ pickup: true, delivery: true, express: false });

  const toggleCat = cat => setSelectedCats(prev =>
    prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <h3 className="text-sm font-semibold text-surface-900 mb-5">Store Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Store Name"   defaultValue="Sweet Dreams Bakery" />
          <InputField label="Store Handle" defaultValue="sweetdreams" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <h3 className="text-sm font-semibold text-surface-900 mb-4">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCat(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                selectedCats.includes(cat)
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-white text-surface-600 border-surface-200 hover:border-primary-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <h3 className="text-sm font-semibold text-surface-900 mb-4">Delivery Options</h3>
        <div className="space-y-3">
          {[
            { key: "pickup",   label: "In-store Pickup",  desc: "Customers pick up at your location" },
            { key: "delivery", label: "Standard Delivery", desc: "2–3 business days" },
            { key: "express",  label: "Express Delivery",  desc: "Same day (additional fee)" },
          ].map(opt => (
            <label key={opt.key} className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setDelivery(prev => ({ ...prev, [opt.key]: !prev[opt.key] }))}
                className={`w-10 h-5.5 rounded-full relative transition-colors cursor-pointer ${delivery[opt.key] ? "bg-primary-600" : "bg-surface-200"}`}
                style={{ height: 22, width: 40 }}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${delivery[opt.key] ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-surface-800">{opt.label}</p>
                <p className="text-xs text-surface-400">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <h3 className="text-sm font-semibold text-surface-900 mb-4">Working Hours</h3>
        <div className="space-y-2">
          {DAYS.map(day => (
            <div key={day} className="flex items-center gap-3">
              <span className="text-sm text-surface-600 w-24">{day}</span>
              <input type="time" defaultValue="09:00" className="px-3 py-1.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600" />
              <span className="text-surface-400 text-xs">to</span>
              <input type="time" defaultValue="18:00" className="px-3 py-1.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-600" />
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-5">
          <SaveButton />
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const [notifs, setNotifs] = useState({
    newOrder: true, orderUpdate: true, newMessage: true,
    review: true, promo: false, report: true,
  });

  const toggle = key => setNotifs(prev => ({ ...prev, [key]: !prev[key] }));

  const items = [
    { key: "newOrder",    label: "New Orders",         desc: "When a customer places a new order" },
    { key: "orderUpdate", label: "Order Updates",       desc: "Status changes and cancellations" },
    { key: "newMessage",  label: "New Messages",        desc: "Customer messages and inquiries" },
    { key: "review",      label: "New Reviews",         desc: "Customer reviews and ratings" },
    { key: "promo",       label: "Promotions & Offers", desc: "Platform promotions and discounts" },
    { key: "report",      label: "Weekly Reports",      desc: "Sales and performance summaries" },
  ];

  return (
    <div className="bg-white rounded-xl border border-surface-200 p-6">
      <h3 className="text-sm font-semibold text-surface-900 mb-5">Notification Preferences</h3>
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.key} className="flex items-center justify-between py-2 border-b border-surface-50 last:border-0">
            <div>
              <p className="text-sm font-medium text-surface-800">{item.label}</p>
              <p className="text-xs text-surface-400 mt-0.5">{item.desc}</p>
            </div>
            <div
              onClick={() => toggle(item.key)}
              className="relative cursor-pointer flex-shrink-0"
              style={{ width: 40, height: 22 }}
            >
              <div className={`w-full h-full rounded-full transition-colors ${notifs[item.key] ? "bg-primary-600" : "bg-surface-200"}`} />
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifs[item.key] ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-5">
        <SaveButton />
      </div>
    </div>
  );
}

function PayoutTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <h3 className="text-sm font-semibold text-surface-900 mb-5">Bank Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Account Holder Name" defaultValue="Sweet Dreams Bakery LLC" />
          <InputField label="Bank Name"            defaultValue="HSBC Armenia" />
          <InputField label="Account Number"       defaultValue="****  ****  ****  4821" />
          <InputField label="SWIFT / BIC Code"     defaultValue="MIDLAM22" />
        </div>
        <div className="mt-4">
          <InputField label="IBAN" defaultValue="AM01 1234 5678 9012 3456 7890" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <h3 className="text-sm font-semibold text-surface-900 mb-4">Payout Schedule</h3>
        <div className="space-y-2">
          {["Weekly (every Monday)", "Bi-weekly", "Monthly (1st of month)"].map((opt, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-surface-100 hover:border-primary-200 transition-colors">
              <input type="radio" name="payout" defaultChecked={i === 0} className="accent-primary-600" />
              <span className="text-sm text-surface-800">{opt}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end mt-5">
          <SaveButton />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 p-6">
        <h3 className="text-sm font-semibold text-surface-900 mb-4">Payout History</h3>
        <div className="space-y-2">
          {[
            { date: "Apr 1, 2025",  amount: "$2,450", status: "completed" },
            { date: "Mar 24, 2025", amount: "$1,980", status: "completed" },
            { date: "Mar 17, 2025", amount: "$2,810", status: "completed" },
          ].map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-surface-50 last:border-0">
              <span className="text-sm text-surface-600">{p.date}</span>
              <span className="text-sm font-semibold text-surface-900">{p.amount}</span>
              <span className="badge badge-success">{p.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function VendorSettings() {
  const [activeTab, setActiveTab] = useState("Profile");

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title="Settings" />

      <main className="flex-1 p-6 max-w-4xl">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-xl p-1 w-fit mb-6">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none ${
                activeTab === tab ? "bg-primary-600 text-white" : "text-surface-600 hover:bg-surface-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Profile"       && <ProfileTab />}
        {activeTab === "Store"         && <StoreTab />}
        {activeTab === "Notifications" && <NotificationsTab />}
        {activeTab === "Payout"        && <PayoutTab />}
      </main>
    </div>
  );
}
