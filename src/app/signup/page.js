"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { authAPI } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.first_name.trim()) { setError("First name is required."); return; }
    if (!form.last_name.trim())  { setError("Last name is required."); return; }
    if (!form.email.trim())      { setError("Email is required."); return; }
    if (form.password.length < 8){ setError("Password must be at least 8 characters."); return; }
    if (form.password !== form.confirm_password) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      const res = await authAPI.register({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      const data = res?.data || res;
      if (data?.access_token) {
        localStorage.setItem("access_token", data.access_token);
        if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
      }
      router.push("/user");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-primary-900">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-700 to-violet-900" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
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

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-surface-900 mb-1">Create account</h1>
            <p className="text-surface-400 text-sm">Get started for free</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1.5">First Name</label>
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="First name"
                  className="w-full px-4 py-3 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 focus:border-primary-600 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1.5">Last Name</label>
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Last name"
                  className="w-full px-4 py-3 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 focus:border-primary-600 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 focus:border-primary-600 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={show ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-3 pr-11 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 focus:border-primary-600 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer text-surface-400"
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  name="confirm_password"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className="w-full px-4 py-3 pr-11 border border-surface-200 rounded-xl text-sm bg-white placeholder:text-surface-400 focus:border-primary-600 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer text-surface-400"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-danger-600 bg-danger-50 border border-danger-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white border-none rounded-xl py-3 text-sm font-semibold cursor-pointer hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account…" : <><span>Create Account</span> <ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-surface-400 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary-600 font-semibold no-underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
