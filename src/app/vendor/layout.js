"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import AiChat from "@/components/AiChat";
import { VENDOR_NAV } from "@/lib/data";
import { isLoggedIn, getRole, getUser } from "@/lib/auth";
import { useChat } from "@/lib/useChat";

// Fires "notif-refresh" whenever any new message arrives — keeps the bell
// updated on every vendor page, not just when the messages page is open.
function VendorNotifSync() {
  const handleNewMessage = useCallback(() => {
    window.dispatchEvent(new Event("notif-refresh"));
  }, []);
  useChat({ onNewMessage: handleNewMessage });
  return null;
}

export default function VendorLayout({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    const role = getRole();
    if (role !== "vendor") {
      if (role === "admin") router.replace("/admin");
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
        nav={VENDOR_NAV}
        role="vendor"
        userName={user?.vendor_name || user?.first_name + " " + user?.last_name || "Vendor"}
        userEmail={user?.email || ""}
      />
      <div className="flex-1 ml-[228px] flex flex-col min-h-screen">
        {children}
      </div>
      <AiChat role="vendor" />
      <VendorNotifSync />
    </div>
  );
}
