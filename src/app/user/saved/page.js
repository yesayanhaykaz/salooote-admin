"use client";
import { useState } from "react";
import {
  Heart, Star, MapPin, Package, ShoppingBag, X, Check, Scale
} from "lucide-react";
import TopBar from "@/components/TopBar";

const TABS = ["All", "Vendors", "Products", "Services"];

const VENDORS = [
  { id: 1, name: "Elite Photography Yerevan", category: "Photography", city: "Yerevan", rating: 5.0, reviews: 143, plan: "Premium", planCls: "badge badge-purple", initials: "EP", bg: "bg-blue-100 text-blue-600" },
  { id: 2, name: "Sweet Dreams Bakery",       category: "Bakery & Cakes", city: "Yerevan", rating: 4.9, reviews: 208, plan: "Pro",     planCls: "badge badge-info",   initials: "SB", bg: "bg-pink-100 text-pink-600" },
  { id: 3, name: "Artisan Flowers Yerevan",   category: "Florist",       city: "Yerevan", rating: 4.8, reviews: 87,  plan: "Pro",     planCls: "badge badge-info",   initials: "AF", bg: "bg-green-100 text-green-600" },
  { id: 4, name: "DJ Arman Music Studio",     category: "Entertainment", city: "Yerevan", rating: 4.7, reviews: 64,  plan: "Premium", planCls: "badge badge-purple", initials: "DA", bg: "bg-violet-100 text-violet-600" },
  { id: 5, name: "Grand Decor Studio",        category: "Decoration",    city: "Yerevan", rating: 4.6, reviews: 92,  plan: "Pro",     planCls: "badge badge-info",   initials: "GD", bg: "bg-yellow-100 text-yellow-700" },
  { id: 6, name: "Golden Hour Catering",      category: "Catering",      city: "Yerevan", rating: 4.8, reviews: 112, plan: "Premium", planCls: "badge badge-purple", initials: "GH", bg: "bg-orange-100 text-orange-600" },
];

const PRODUCTS = [
  { id: 1, name: "3-Tier Wedding Cake",      vendor: "Sweet Dreams Bakery",       price: "$520", category: "Bakery" },
  { id: 2, name: "Bridal Bouquet – Rose Mix",vendor: "Artisan Flowers Yerevan",   price: "$180", category: "Florist" },
  { id: 3, name: "Wedding Photo Album",       vendor: "Elite Photography Yerevan", price: "$150", category: "Photography" },
  { id: 4, name: "DJ Equipment Package",      vendor: "DJ Arman Music Studio",     price: "$580", category: "Entertainment" },
  { id: 5, name: "Venue Centerpiece Set (10)",vendor: "Grand Decor Studio",        price: "$240", category: "Decoration" },
];

const COMPARE_FEATURES = [
  { label: "Category",     key: "category" },
  { label: "City",         key: "city" },
  { label: "Rating",       key: "rating" },
  { label: "Plan",         key: "plan" },
];

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [savedVendors, setSavedVendors] = useState(VENDORS.map(v => v.id));
  const [savedProducts, setSavedProducts] = useState(PRODUCTS.map(p => p.id));
  const [compareIds, setCompareIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  function removeVendor(id) { setSavedVendors(prev => prev.filter(v => v !== id)); }
  function removeProduct(id) { setSavedProducts(prev => prev.filter(v => v !== id)); }

  function toggleCompare(id) {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(v => v !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  const visibleVendors = VENDORS.filter(v => savedVendors.includes(v.id));
  const visibleProducts = PRODUCTS.filter(p => savedProducts.includes(p.id));
  const compareVendors = VENDORS.filter(v => compareIds.includes(v.id));

  const showVendors = activeTab === "All" || activeTab === "Vendors";
  const showProducts = activeTab === "All" || activeTab === "Products" || activeTab === "Services";

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar
        title="Saved"
        subtitle="Your favorites"
        actions={
          compareIds.length > 0 && (
            <button
              onClick={() => setShowCompare(true)}
              className="flex items-center gap-1.5 text-xs font-semibold bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Scale size={13} /> Compare ({compareIds.length})
            </button>
          )
        }
      />

      <main className="flex-1 p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Saved Vendors",  value: savedVendors.length,  icon: Heart,      bg: "bg-pink-50",   color: "text-pink-500" },
            { label: "Saved Products", value: savedProducts.length, icon: Package,    bg: "bg-violet-50", color: "text-violet-500" },
            { label: "Saved Services", value: 5,                    icon: ShoppingBag, bg: "bg-blue-50",  color: "text-blue-500" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-surface-200 p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900">{s.value}</p>
                <p className="text-xs text-surface-400 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-xl px-2 py-1.5 w-fit">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === tab ? "bg-primary-600 text-white" : "text-surface-500 hover:bg-surface-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Saved Vendors */}
        {showVendors && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-surface-900">Saved Vendors</h2>
              <p className="text-xs text-surface-400">Select up to 3 to compare</p>
            </div>

            {visibleVendors.length === 0 ? (
              <div className="bg-white rounded-xl border border-surface-200 flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center mb-3">
                  <Heart size={24} className="text-pink-300" />
                </div>
                <p className="text-sm font-semibold text-surface-600">No saved vendors yet</p>
                <p className="text-xs text-surface-400 mt-1">Browse vendors and tap the heart icon to save them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleVendors.map(v => {
                  const inCompare = compareIds.includes(v.id);
                  return (
                    <div key={v.id} className={`bg-white rounded-xl border overflow-hidden transition-all ${inCompare ? "border-primary-400 ring-2 ring-primary-100" : "border-surface-200"}`}>
                      {/* Cover placeholder */}
                      <div className="h-24 bg-gradient-to-br from-surface-100 to-surface-200 relative">
                        <button
                          onClick={() => removeVendor(v.id)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                        >
                          <Heart size={14} className="fill-red-500 text-red-500" />
                        </button>
                        <button
                          onClick={() => toggleCompare(v.id)}
                          className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center transition-colors shadow-sm ${inCompare ? "bg-primary-600" : "bg-white/90 hover:bg-white"}`}
                        >
                          {inCompare ? <Check size={13} className="text-white" /> : <Scale size={13} className="text-surface-500" />}
                        </button>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-3 -mt-6 relative z-10">
                          <div className={`w-10 h-10 rounded-xl ${v.bg} flex items-center justify-center text-xs font-bold border-2 border-white`}>
                            {v.initials}
                          </div>
                          <div className="flex-1 min-w-0 pt-5">
                            <p className="text-sm font-semibold text-surface-900 truncate">{v.name}</p>
                          </div>
                        </div>

                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-center gap-1.5 text-xs text-surface-500">
                            <Package size={11} className="text-surface-400" />
                            {v.category}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-surface-500">
                            <MapPin size={11} className="text-surface-400" />
                            {v.city}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-surface-500">
                            <Star size={11} className="text-yellow-400 fill-yellow-400" />
                            <span className="font-semibold text-surface-700">{v.rating}</span>
                            <span className="text-surface-400">({v.reviews} reviews)</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={v.planCls}>{v.plan}</span>
                          <button className="text-xs font-semibold bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors">
                            Inquire
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Saved Products */}
        {showProducts && (
          <div>
            <h2 className="text-sm font-semibold text-surface-900 mb-3">
              {activeTab === "Services" ? "Saved Services" : "Saved Products & Services"}
            </h2>

            {visibleProducts.length === 0 ? (
              <div className="bg-white rounded-xl border border-surface-200 flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mb-3">
                  <Package size={24} className="text-violet-300" />
                </div>
                <p className="text-sm font-semibold text-surface-600">No saved products yet</p>
                <p className="text-xs text-surface-400 mt-1">Browse vendor products and save them here for easy access.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {visibleProducts.map(p => (
                  <div key={p.id} className="bg-white rounded-xl border border-surface-200 overflow-hidden">
                    <div className="h-28 bg-gradient-to-br from-surface-100 to-surface-200 relative flex items-center justify-center">
                      <Package size={28} className="text-surface-300" />
                      <button
                        onClick={() => removeProduct(p.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                      >
                        <Heart size={14} className="fill-red-500 text-red-500" />
                      </button>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-surface-900 truncate mb-0.5">{p.name}</p>
                      <p className="text-[11px] text-surface-400 truncate mb-2">{p.vendor}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-surface-900">{p.price}</span>
                        <button className="text-[11px] font-semibold bg-primary-600 text-white px-2.5 py-1 rounded-lg hover:bg-primary-700 transition-colors">
                          Add to Event
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Compare Modal */}
      {showCompare && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-surface-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-sm font-bold text-surface-900">Vendor Comparison</h2>
              <button onClick={() => setShowCompare(false)} className="w-7 h-7 rounded-full hover:bg-surface-100 flex items-center justify-center transition-colors">
                <X size={15} className="text-surface-500" />
              </button>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left text-xs text-surface-400 font-medium pb-3 w-28">Feature</th>
                    {compareVendors.map(v => (
                      <th key={v.id} className="text-left text-xs font-semibold text-surface-900 pb-3 px-3">
                        <div className={`w-8 h-8 rounded-lg ${v.bg} flex items-center justify-center text-xs font-bold mb-1`}>{v.initials}</div>
                        {v.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-50">
                  {COMPARE_FEATURES.map(feat => (
                    <tr key={feat.key}>
                      <td className="py-3 text-xs text-surface-400 font-medium">{feat.label}</td>
                      {compareVendors.map(v => (
                        <td key={v.id} className="py-3 px-3 text-xs text-surface-700 font-medium">
                          {feat.key === "rating" ? (
                            <span className="flex items-center gap-1">
                              <Star size={11} className="text-yellow-400 fill-yellow-400" /> {v[feat.key]}
                            </span>
                          ) : feat.key === "plan" ? (
                            <span className={v.planCls}>{v[feat.key]}</span>
                          ) : v[feat.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="py-3 text-xs text-surface-400 font-medium">Action</td>
                    {compareVendors.map(v => (
                      <td key={v.id} className="py-3 px-3">
                        <button className="text-xs font-semibold bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors">
                          Inquire
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
