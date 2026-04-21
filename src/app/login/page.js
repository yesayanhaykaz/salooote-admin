"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { authAPI } from "@/lib/api";
import { saveTokens, saveUser } from "@/lib/auth";
import { useLocale, LANGUAGES } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useLocale();

  const [show, setShow]         = useState(false);
  const [email, setEmail]       = useState("admin@salooote.am");
  const [password, setPassword] = useState("Admin@123");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authAPI.login(email, password);
      saveTokens(res.data.access_token, res.data.refresh_token);
      saveUser(res.data.user);
      const role = res.data.user.role;
      if (role === "admin") router.push("/admin");
      else if (role === "vendor") router.push("/vendor");
      else router.push("/user");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-primary-900">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-700 to-violet-900" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-white font-bold text-lg">{t("brand.name")}</span>
          </div>

          {/* Hero copy */}
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              {t("hero.title")}
            </h2>
            <p className="text-white/60 text-base leading-relaxed max-w-[320px]">
              {t("hero.subtitle")}
            </p>
            <div className="flex gap-6 mt-10">
              {[
                { n: "850+", key: "stats.vendors" },
                { n: "15K+", key: "stats.orders" },
                { n: "4.9",  key: "stats.rating" },
              ].map(s => (
                <div key={s.key}>
                  <p className="text-white font-bold text-xl">{s.n}</p>
                  <p className="text-white/40 text-xs">{t(s.key)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">

        {/* Language switcher — top right */}
        <div className="absolute top-6 right-6 flex gap-1">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => setLocale(lang.code)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                locale === lang.code
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-white text-surface-500 border-surface-200 hover:border-primary-300 hover:text-primary-600"
              }`}
            >
              {lang.flag} {lang.label}
            </button>
          ))}
        </div>

        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-surface-900 mb-1">{t("auth.welcome")}</h1>
            <p className="text-surface-400 text-sm">{t("auth.signin_title")}</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-4">
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-surface-700 mb-1.5">
                {t("auth.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-surface-200 rounded-xl text-sm bg-white text-surface-800 placeholder:text-surface-400 transition-all outline-none focus:border-primary-400"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-surface-700">
                  {t("auth.password")}
                </label>
                <a href="#" className="text-xs text-primary-600 hover:text-primary-700 no-underline">
                  {t("auth.forgot_password")}
                </a>
              </div>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-surface-200 rounded-xl text-sm bg-white text-surface-800 placeholder:text-surface-400 transition-all pr-11 outline-none focus:border-primary-400"
                  placeholder="••••••••"
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
              {loading
                ? "…"
                : <><span>{t("auth.signin_button")}</span><ArrowRight size={15} /></>
              }
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 px-4 py-3 rounded-xl bg-surface-50 border border-surface-200 text-xs text-surface-500">
            <p className="font-semibold text-surface-700 mb-1">{t("demo.title")}</p>
            <p>{t("demo.admin")}: admin@salooote.am / Admin@123</p>
            <p>{t("demo.vendor")}: vendor@salooote.am / Vendor@123</p>
          </div>

          {/* Client portal link */}
          <p className="text-center text-xs text-surface-400 mt-4">
            Regular user?{" "}
            <a href="/user/login" className="text-primary-600 font-semibold hover:text-primary-700">
              Go to client login →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
