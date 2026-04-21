"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { USER_NAV } from "@/lib/data";
import { authAPI } from "@/lib/api";

export default function UserLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    authAPI.me()
      .then(res => setUser(res?.data || res))
      .catch(() => router.push("/login"));
  }, []);

  const name = user
    ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email
    : "…";
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
