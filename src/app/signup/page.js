"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const [show, setShow] = useState(false);
  const [role, setRole] = useState("user");

  return (
    <div className="min-h-screen bg-surface-50 flex">
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
              Join Salooote<br />today
            </h2>
            <p className="text-white/60 text-base leading-relaxed max-w-[320px]">
              Create an account to start planning events, shopping, or listing your services.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-surface-900 mb-1">Create account</h1>
            <p className="text-surface-400 text-sm">Get started for free</p>
          </div>

          <div className="flex gap-2 p-1 bg-surface-100 rounded-xl mb-6">
            {[{ key: "user", label: "User" }, { key: "vendor", label: "Vendor" }].map(r => (
              <button
                key={r.key}
                onClick={() => setRole(r.key)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold border-none cursor-pointer transition-all ${
                  role === r.key ? "bg-white text-primary-600 shadow-card" : "bg-transparent text-surface-500 hover:text-surface-800"
                }`}
              >{r.label}</button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {["First Name", "Last Name"].map(ph => (
                <div key={ph}>
                  <label className="block text-xs font-semibold text-surface-700 mb-1.5">{ph}</label>
                  <input placeholder={ph} className="w-full px-4 py-3 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 transition-all" />
                </div>
              ))}
            </div>
            {role === "vendor" && (
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1.5">Business Name</label>
                <input placeholder="Your business name" className="w-full px-4 py-3 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 transition-all" />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">Email</label>
              <input type="email" placeholder="your@email.com" className="w-full px-4 py-3 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={show ? "text" : "password"} placeholder="Min. 8 characters" className="w-full px-4 py-3 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 transition-all pr-11" />
                <button onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer text-surface-400">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <Link href="/login" className="no-underline block">
              <button className="w-full bg-primary-600 text-white border-none rounded-xl py-3 text-sm font-semibold cursor-pointer hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 mt-2">
                Create Account <ArrowRight size={15} />
              </button>
            </Link>
          </div>
          <p className="text-center text-sm text-surface-400 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary-600 font-semibold no-underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
