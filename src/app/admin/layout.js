"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import AiChat from "@/components/AiChat";
import { ADMIN_NAV } from "@/lib/data";
import { isLoggedIn, getRole, getUser } from "@/lib/auth";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    const role = getRole();
    if (role !== "admin") {
      if (role === "vendor") router.replace("/vendor");
      else router.replace("/login");
      return;
    }
    setUser(getUser());
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-50">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface-50">
      <Sidebar
        nav={ADMIN_NAV}
        role="admin"
        userName={user ? (user.first_name + " " + user.last_name).trim() || user.email : "Admin"}
        userEmail={user?.email || ""}
      />
      <div className="flex-1 ml-[228px] flex flex-col min-h-screen">
        {children}
      </div>
      <AiChat role="admin" />
    </div>
  );
}
