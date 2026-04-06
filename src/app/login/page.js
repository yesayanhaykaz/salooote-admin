"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [show, setShow] = useState(false);
  const [role, setRole] = useState("admin");

  const redirects = { admin: "/admin", vendor: "/vendor", user: "/user/orders" };

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Left — image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-primary-900">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-700 to-violet-900" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }} />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-white font-bold text-lg">Salooote</span>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Manage your<br />events platform
            </h2>
            <p className="text-white/60 text-base leading-relaxed max-w-[320px]">
              Full control over vendors, orders, events, and customers — all in one place.
            </p>
            <div className="flex gap-6 mt-10">
              {[{ n: "850+", l: "Vendors" }, { n: "15K+", l: "Orders" }, { n: "4.9", l: "Rating" }].map((s, i) => (
                <div key={i}>
                  <p className="text-white font-bold text-xl">{s.n}</p>
                  <p className="text-white/40 text-xs">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-surface-900 mb-1">Welcome back</h1>
            <p className="text-surface-400 text-sm">Sign in to your account</p>
          </div>

          {/* Role selector */}
          <div className="flex gap-2 p-1 bg-surface-100 rounded-xl mb-6">
            {[
              { key: "admin",  label: "Admin" },
              { key: "vendor", label: "Vendor" },
              { key: "user",   label: "User" },
            ].map(r => (
              <button
                key={r.key}
                onClick={() => setRole(r.key)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold border-none cursor-pointer transition-all ${
                  role === r.key
                    ? "bg-white text-primary-600 shadow-card"
                    : "bg-transparent text-surface-500 hover:text-surface-800"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">Email</label>
              <input
                type="email"
                defaultValue={role === "admin" ? "haykaz@salooote.am" : role === "vendor" ? "vendor@salooote.am" : "anna@example.com"}
                className="w-full px-4 py-3 border border-surface-200 rounded-xl text-sm bg-white text-surface-800 placeholder:text-surface-400 transition-all"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-surface-700">Password</label>
                <a href="#" className="text-xs text-primary-600 hover:text-primary-700 no-underline">Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  defaultValue="password123"
                  className="w-full px-4 py-3 border border-surface-200 rounded-xl text-sm bg-white text-surface-800 placeholder:text-surface-400 transition-all pr-11"
                  placeholder="••••••••"
                />
                <button
                  onClick={() => setShow(!show)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer text-surface-400 hover:text-surface-600"
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <Link href={redirects[role]} className="no-underline block">
              <button className="w-full bg-primary-600 text-white border-none rounded-xl py-3 text-sm font-semibold cursor-pointer hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 mt-2">
                Sign In <ArrowRight size={15} />
              </button>
            </Link>
          </div>

          <p className="text-center text-sm text-surface-400 mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary-600 font-semibold no-underline hover:text-primary-700">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
