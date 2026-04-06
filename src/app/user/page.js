"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UserHome() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/user/orders");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-surface-400">Redirecting…</p>
      </div>
    </div>
  );
}
