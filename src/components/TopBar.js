"use client";
import { Search, Bell, ChevronDown } from "lucide-react";

export default function TopBar({ title, subtitle, actions }) {
  return (
    <header className="h-14 bg-white border-b border-surface-200 flex items-center px-6 gap-4 flex-shrink-0">
      {/* Title */}
      <div className="flex-1">
        <h1 className="text-base font-bold text-surface-900 leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-surface-400 mt-0.5">{subtitle}</p>}
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center bg-surface-50 rounded-lg px-3 py-2 border border-surface-200 w-[220px] gap-2 focus-within:border-primary-400 transition-colors">
        <Search size={14} className="text-surface-400 flex-shrink-0" />
        <input
          placeholder="Search…"
          className="flex-1 bg-transparent border-none outline-none text-sm text-surface-700 placeholder:text-surface-400"
        />
      </div>

      {/* Actions */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}

      {/* Notifications */}
      <button className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-100 transition-colors border-none bg-transparent cursor-pointer">
        <Bell size={16} className="text-surface-500" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-danger-500 rounded-full" />
      </button>

      {/* Profile */}
      <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-50 transition-colors border-none bg-transparent cursor-pointer">
        <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">A</span>
        </div>
        <ChevronDown size={12} className="text-surface-400" />
      </button>
    </header>
  );
}
