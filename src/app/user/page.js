"use client";
import { useState } from "react";
import {
  Calendar, MapPin, Users, Heart, MessageSquare, CheckCircle,
  Star, Bell, ChevronRight, Clock, Package, Sparkles, ArrowRight
} from "lucide-react";
import TopBar from "@/components/TopBar";
import StatsCard from "@/components/StatsCard";
import Link from "next/link";

const EVENTS = [
  {
    id: 1,
    emoji: "💍",
    title: "Anna & Aram's Wedding",
    type: "Wedding",
    date: "Jun 15, 2025",
    daysLeft: 69,
    location: "Yerevan, Armenia",
    guests: 120,
    completion: 62,
    color: "from-violet-500 to-purple-600",
    lightBg: "bg-violet-50",
    lightText: "text-violet-700",
  },
  {
    id: 2,
    emoji: "🎂",
    title: "Lilit's Birthday Party",
    type: "Birthday",
    date: "May 3, 2025",
    daysLeft: 26,
    location: "Home, Yerevan",
    guests: 30,
    completion: 40,
    color: "from-pink-500 to-rose-500",
    lightBg: "bg-pink-50",
    lightText: "text-pink-700",
  },
];

const ACTIVITY = [
  { id: 1, icon: MessageSquare, iconBg: "bg-blue-50", iconColor: "text-blue-500", text: "You sent an inquiry to", highlight: "Artisan Flowers Yerevan", time: "2 hours ago" },
  { id: 2, icon: MessageSquare, iconBg: "bg-violet-50", iconColor: "text-violet-500", text: "Vendor replied:", highlight: "DJ Arman Music Studio", time: "5 hours ago" },
  { id: 3, icon: CheckCircle, iconBg: "bg-green-50", iconColor: "text-green-500", text: "Booking confirmed with", highlight: "Elite Photography Yerevan", time: "Yesterday" },
  { id: 4, icon: Star, iconBg: "bg-yellow-50", iconColor: "text-yellow-500", text: "You left a review for", highlight: "Sweet Dreams Bakery", time: "2 days ago" },
  { id: 5, icon: Sparkles, iconBg: "bg-pink-50", iconColor: "text-pink-500", text: "New vendor recommendation based on your wedding", highlight: "", time: "3 days ago" },
];

const RECOMMENDED = [
  { id: 1, name: "Nairi Bridal Flowers", category: "Florist", rating: 4.9, reviews: 87, price: "$300–$800", badge: "Top Rated", badgeClass: "badge badge-success" },
  { id: 2, name: "DJ Arman Music Studio", category: "Entertainment", rating: 4.7, reviews: 64, price: "$400–$600", badge: "Popular", badgeClass: "badge badge-purple" },
  { id: 3, name: "Golden Hour Catering", category: "Catering", rating: 4.8, reviews: 112, price: "$1,200–$3,000", badge: "New", badgeClass: "badge badge-info" },
];

const CHECKLIST = [
  { id: 1, text: "Book wedding photographer", done: true },
  { id: 2, text: "Choose catering service", done: false },
  { id: 3, text: "Order wedding flowers", done: false },
];

export default function UserDashboard() {
  const [saved, setSaved] = useState({});

  function toggleSave(id) {
    setSaved(prev => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title="My Dashboard" subtitle="Welcome back, Anna!" />

      <main className="flex-1 p-6 space-y-6">

        {/* Wedding Countdown Banner */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 p-6 text-white">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 70% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-violet-200 text-sm font-medium mb-1">Upcoming Milestone</p>
              <h2 className="text-2xl font-bold mb-1">Your Wedding is in <span className="text-yellow-300">69 days!</span> 🎉</h2>
              <p className="text-violet-100 text-sm">June 15, 2025 · Yerevan, Armenia · 120 guests</p>
            </div>
            <div className="hidden sm:flex flex-col items-center bg-white/20 backdrop-blur rounded-xl px-6 py-4 text-center">
              <span className="text-4xl font-black">69</span>
              <span className="text-xs text-violet-100 font-medium uppercase tracking-wider mt-1">Days Left</span>
            </div>
          </div>
          <div className="relative mt-4 flex items-center gap-3">
            <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-300 rounded-full" style={{ width: "62%" }} />
            </div>
            <span className="text-sm font-semibold text-white">62% planned</span>
            <Link href="/user/planner" className="ml-2 text-xs font-semibold bg-white text-violet-700 px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors flex items-center gap-1">
              Open Planner <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard label="My Events"         value="2"  icon={Calendar}       iconBg="bg-violet-50"  iconColor="text-violet-500" />
          <StatsCard label="Saved Vendors"      value="8"  icon={Heart}          iconBg="bg-pink-50"    iconColor="text-pink-500" />
          <StatsCard label="Active Inquiries"   value="3"  icon={MessageSquare}  iconBg="bg-blue-50"    iconColor="text-blue-500" />
          <StatsCard label="Completed Bookings" value="5"  icon={CheckCircle}    iconBg="bg-green-50"   iconColor="text-green-500" />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left column - Events + Activity */}
          <div className="xl:col-span-2 space-y-6">

            {/* My Upcoming Events */}
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-surface-900">My Upcoming Events</h2>
                <Link href="/user/events" className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
                  View all <ChevronRight size={12} />
                </Link>
              </div>
              <div className="p-5 space-y-4">
                {EVENTS.map(ev => (
                  <div key={ev.id} className="border border-surface-200 rounded-xl overflow-hidden">
                    <div className={`bg-gradient-to-r ${ev.color} px-4 py-3 flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{ev.emoji}</span>
                        <div>
                          <p className="text-white font-semibold text-sm leading-none">{ev.title}</p>
                          <p className="text-white/70 text-xs mt-0.5">{ev.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-lg leading-none">{ev.daysLeft}</p>
                        <p className="text-white/70 text-xs">days away</p>
                      </div>
                    </div>
                    <div className="px-4 py-3 flex flex-wrap gap-4 items-center">
                      <div className="flex items-center gap-1.5 text-xs text-surface-500">
                        <Calendar size={13} className="text-surface-400" />
                        {ev.date}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-surface-500">
                        <MapPin size={13} className="text-surface-400" />
                        {ev.location}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-surface-500">
                        <Users size={13} className="text-surface-400" />
                        {ev.guests} guests
                      </div>
                      <div className="flex-1 min-w-[120px]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-surface-400">Planning</span>
                          <span className={`text-xs font-semibold ${ev.lightText}`}>{ev.completion}%</span>
                        </div>
                        <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${ev.color}`} style={{ width: `${ev.completion}%` }} />
                        </div>
                      </div>
                      <Link href="/user/planner" className="text-xs font-semibold text-primary-600 border border-primary-200 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors whitespace-nowrap">
                        View &amp; Plan
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-surface-100">
                <h2 className="text-sm font-semibold text-surface-900">Recent Activity</h2>
              </div>
              <div className="divide-y divide-surface-50">
                {ACTIVITY.map(item => (
                  <div key={item.id} className="px-5 py-3.5 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <item.icon size={15} className={item.iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-surface-700">
                        {item.text}{" "}
                        {item.highlight && <span className="font-semibold text-surface-900">{item.highlight}</span>}
                      </p>
                    </div>
                    <span className="text-xs text-surface-400 flex-shrink-0">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Recommendations + Checklist */}
          <div className="space-y-6">

            {/* Recommended Vendors */}
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-surface-100">
                <h2 className="text-sm font-semibold text-surface-900">Recommended For You</h2>
                <p className="text-xs text-surface-400 mt-0.5">Based on your upcoming wedding</p>
              </div>
              <div className="divide-y divide-surface-50">
                {RECOMMENDED.map(v => (
                  <div key={v.id} className="px-5 py-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-surface-100 to-surface-200 flex items-center justify-center flex-shrink-0">
                        <Package size={16} className="text-surface-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-surface-900">{v.name}</p>
                          <span className={v.badgeClass}>{v.badge}</span>
                        </div>
                        <p className="text-xs text-surface-400">{v.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-semibold text-surface-700">{v.rating}</span>
                        <span className="text-xs text-surface-400">({v.reviews})</span>
                      </div>
                      <span className="text-xs text-surface-500">{v.price}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleSave(v.id)}
                        className={`flex-1 text-xs font-medium py-1.5 rounded-lg border transition-colors ${saved[v.id] ? "border-pink-300 bg-pink-50 text-pink-600" : "border-surface-200 text-surface-600 hover:bg-surface-50"}`}
                      >
                        <Heart size={12} className={`inline mr-1 ${saved[v.id] ? "fill-pink-500 text-pink-500" : ""}`} />
                        {saved[v.id] ? "Saved" : "Save"}
                      </button>
                      <button className="flex-1 text-xs font-medium py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors">
                        Inquire
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Planning Checklist Preview */}
            <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-surface-900">Planning Checklist</h2>
                <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">62%</span>
              </div>
              <div className="px-5 py-3 space-y-3">
                {CHECKLIST.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${item.done ? "bg-green-500 border-green-500" : "border-surface-300"}`}>
                      {item.done && <CheckCircle size={12} className="text-white" />}
                    </div>
                    <span className={`text-sm ${item.done ? "line-through text-surface-400" : "text-surface-700"}`}>{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 pb-4">
                <Link href="/user/planner" className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors mt-1">
                  View Full Checklist <ChevronRight size={13} />
                </Link>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
