"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { authAPI } from "@/lib/api";
import { saveTokens, saveUser } from "@/lib/auth";

export default function UserLoginPage() {
  const router = useRouter();
  const [show,     setShow]     = useState(false);
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  // If already logged in, skip login page
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) router.replace("/user");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authAPI.login(email, password);
      saveTokens(res.data.access_token, res.data.refresh_token);
      saveUser(res.data.user);
      const role = res.data.user?.role;
      if (role === "admin")  { router.push("/admin");  return; }
      if (role === "vendor") { router.push("/vendor"); return; }
      router.push("/user");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 flex items-center justify-center px-4 py-12">

      {/* Card */}
      <div className="w-full max-w-[420px]">

        {/* Logo / brand */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-md">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-surface-900">Salooote</span>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-surface-900">Welcome back</h1>
            <p className="text-surface-400 text-sm mt-1">Sign in to your account</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-5">
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-surface-200 rounded-xl text-sm bg-white text-surface-800 placeholder:text-surface-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-surface-700">Password</label>
                <a href="#" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 border border-surface-200 rounded-xl text-sm bg-white text-surface-800 placeholder:text-surface-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer text-surface-400 hover:text-surface-600"
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white border-none rounded-xl py-3 text-sm font-semibold cursor-pointer hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? "Signing in…" : <><span>Sign In</span><ArrowRight size={15} /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-surface-400 mt-5">
          Don&apos;t have an account?{" "}
          <Link href="/user/register" className="text-primary-600 font-semibold hover:text-primary-700">
            Create one free
          </Link>
        </p>

        {/* Vendor / Admin link */}
        <p className="text-center text-xs text-surface-300 mt-3">
          Are you a vendor or admin?{" "}
          <Link href="/login" className="text-surface-400 hover:text-surface-600 underline">
            Staff login
          </Link>
        </p>
      </div>
    </div>
  );
}
