"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, AlertCircle, Sparkles, Check } from "lucide-react";
import { authAPI } from "@/lib/api";
import { saveTokens, saveUser } from "@/lib/auth";

export default function UserRegisterPage() {
  const router = useRouter();
  const [show,        setShow]        = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", password: "", confirm_password: "",
  });

  const set = (k) => (e) => { setForm(p => ({ ...p, [k]: e.target.value })); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.first_name.trim())        { setError("First name is required."); return; }
    if (!form.last_name.trim())         { setError("Last name is required."); return; }
    if (!form.email.trim())             { setError("Email is required."); return; }
    if (form.password.length < 8)       { setError("Password must be at least 8 characters."); return; }
    if (form.password !== form.confirm_password) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      const res = await authAPI.register({
        first_name: form.first_name.trim(),
        last_name:  form.last_name.trim(),
        email:      form.email.trim(),
        password:   form.password,
      });
      const data = res?.data || res;
      if (data?.access_token) {
        saveTokens(data.access_token, data.refresh_token);
        if (data.user) saveUser(data.user);
      }
      router.push("/user");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    "Browse 850+ vendors & services",
    "Order products & book services",
    "Save favourites & plan events",
    "Chat directly with vendors",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[900px] flex gap-10 items-center">

        {/* Left — perks (hidden on mobile) */}
        <div className="hidden lg:flex flex-col gap-6 flex-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-md">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-surface-900">Salooote</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-surface-900 leading-tight">
              Your one-stop<br />event marketplace
            </h2>
            <p className="text-surface-400 text-sm mt-3 leading-relaxed">
              Join thousands of people who plan their events, weddings, and celebrations with Salooote.
            </p>
          </div>
          <div className="space-y-3">
            {perks.map(p => (
              <div key={p} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Check size={11} className="text-primary-600" />
                </div>
                <span className="text-sm text-surface-600">{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div className="flex-1 max-w-[420px] w-full">

          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2.5 mb-6 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-md">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-surface-900">Salooote</span>
          </div>

          <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-surface-900">Create account</h1>
              <p className="text-surface-400 text-sm mt-1">Free forever — no credit card needed</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-5">
                <AlertCircle size={15} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1.5">First Name</label>
                  <input
                    value={form.first_name}
                    onChange={set("first_name")}
                    placeholder="Anna"
                    autoFocus
                    className="w-full px-3 py-2.5 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1.5">Last Name</label>
                  <input
                    value={form.last_name}
                    onChange={set("last_name")}
                    placeholder="Smith"
                    className="w-full px-3 py-2.5 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    value={form.password}
                    onChange={set("password")}
                    placeholder="Min. 8 characters"
                    className="w-full px-4 py-2.5 pr-11 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                  <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer text-surface-400 hover:text-surface-600">
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={form.confirm_password}
                    onChange={set("confirm_password")}
                    placeholder="Repeat password"
                    className="w-full px-4 py-2.5 pr-11 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer text-surface-400 hover:text-surface-600">
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white border-none rounded-xl py-3 text-sm font-semibold cursor-pointer hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-1"
              >
                {loading ? "Creating account…" : <><span>Create Account</span><ArrowRight size={15} /></>}
              </button>

              <p className="text-[11px] text-surface-400 text-center">
                By registering you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </div>

          <p className="text-center text-sm text-surface-400 mt-5">
            Already have an account?{" "}
            <Link href="/user/login" className="text-primary-600 font-semibold hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
