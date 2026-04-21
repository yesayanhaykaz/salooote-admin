"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { USER_NAV } from "@/lib/data";
import { authAPI } from "@/lib/api";

// Paths inside /user/ that don't need auth or sidebar
const AUTH_PATHS = ["/user/login", "/user/register"];

export default function UserLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some(p => pathname === p);

  const [user,  setUser]  = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Auth pages (login/register) — no check needed, render immediately
    if (isAuthPage) {
      setReady(true);
      return;
    }

    // No token at all → go to client login immediately (avoids a 401 round-trip
    // that would trigger the api.js redirect before our catch fires)
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/user/login");
      return;
    }

    // We have a token — verify it and get user info
    authAPI.me()
      .then(res => {
        const u = res?.data || res;
        if (u?.role === "admin")  { router.replace("/admin");  return; }
        if (u?.role === "vendor") { router.replace("/vendor"); return; }
        setUser(u);
        setReady(true);
      })
      .catch(() => {
        router.replace("/user/login");
      });
  }, [pathname]); // re-run on every navigation so role check stays fresh

  // ── Auth pages: render with no chrome ───────────────────────────────────
  if (isAuthPage) {
    // Show children immediately (ready may still be false on first tick — that's fine)
    return <>{children}</>;
  }

  // ── Portal pages: wait until auth resolves ───────────────────────────────
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-50">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const name  = user ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email : "";
  const email = user?.email || "";

  return (
    <div className="flex min-h-screen bg-surface-50">
      <Sidebar nav={USER_NAV} role="user" userName={name} userEmail={email} />
      <div className="flex-1 ml-[228px] flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
