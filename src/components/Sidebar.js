"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Store, ShoppingBag, Calendar,
  Package, Tag, BarChart2, MessageSquare, FileText,
  Settings, Sparkles, CreditCard, Bell, LogOut,
  ClipboardCheck, CalendarCheck, CalendarDays, DollarSign,
  Star, Headphones, Megaphone, Shield, Inbox, Heart,
  ClipboardList, Briefcase,
} from "lucide-react";
import { clearTokens } from "@/lib/auth";
import { authAPI } from "@/lib/api";
import { useLocale } from "@/lib/i18n";

const ICONS = {
  LayoutDashboard, Users, Store, ShoppingBag, Calendar,
  Package, Tag, BarChart2, MessageSquare, FileText,
  Settings, Sparkles, CreditCard, Bell, Briefcase,
  ClipboardCheck, CalendarCheck, CalendarDays, DollarSign,
  Star, Headphones, Megaphone, Shield, Inbox, Heart,
  ClipboardList,
};

export default function Sidebar({ nav, role, userName = "Admin User", userEmail = "admin@salooote.am" }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { t }    = useLocale();

  const roleConfig = {
    admin:  { labelKey: "brand.admin_title",  color: "bg-primary-600" },
    vendor: { labelKey: "brand.vendor_portal", color: "bg-violet-600" },
    user:   { labelKey: "brand.name",          color: "bg-blue-600" },
  };
  const config = roleConfig[role] || roleConfig.admin;

  const handleLogout = async () => {
    await authAPI.logout().catch(() => {});
    clearTokens();
    router.replace("/login");
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[228px] bg-white border-r border-surface-200 flex flex-col z-40">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-surface-100">
        <Link href="/" className="no-underline flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <div>
            <p className="text-sm font-bold text-surface-900 leading-none">{t("brand.name")}</p>
            <p className="text-[10px] text-surface-400 mt-0.5">{t(config.labelKey)}</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {nav.map((item) => {
          const Icon = ICONS[item.icon] || Package;
          const isActive = pathname === item.href || (item.href !== "/admin" && item.href !== "/vendor" && item.href !== "/user" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? "active" : ""}`}
            >
              <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{item.key ? t(item.key) : item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-primary-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-surface-100 space-y-1">
        <div className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-surface-50 transition-colors">
          <div className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center flex-shrink-0`}>
            <span className="text-white text-xs font-bold">{userName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-surface-800 truncate">{userName}</p>
            <p className="text-[10px] text-surface-400 truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-2 py-2.5 rounded-lg text-danger-600 hover:bg-danger-50 transition-colors cursor-pointer border-none bg-transparent text-left"
        >
          <LogOut size={15} />
          <span className="text-xs font-semibold">{t("sidebar.sign_out")}</span>
        </button>
      </div>
    </aside>
  );
}
