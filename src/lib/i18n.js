"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

/* ─── Translation data ──────────────────────────────────────────────────── */
const translations = {
  en: {
    brand: { name: "Salooote" },
    hero: {
      title: "Manage your events platform",
      subtitle: "Full control over vendors, orders, events, and customers — all in one place.",
    },
    stats: {
      vendors: "Vendors",
      orders: "Orders",
      rating: "Rating",
    },
    auth: {
      welcome: "Welcome back",
      signin_title: "Sign in to your account",
      email: "Email",
      password: "Password",
      forgot_password: "Forgot password?",
      signin_button: "Sign In",
    },
    demo: {
      title: "Demo credentials",
      admin: "Admin",
      vendor: "Vendor",
      user: "User",
    },
  },

  hy: {
    brand: { name: "Salooote" },
    hero: {
      title: "Կառավարեք ձեր միջոցառումների հարթակը",
      subtitle: "Ամբողջական վերահսկողություն գործընկերների, պատվերների, միջոցառումների և հաճախորդների նկատմամբ՝ մեկ հարթակում։",
    },
    stats: {
      vendors: "Գործընկերներ",
      orders: "Պատվերներ",
      rating: "Գնահատական",
    },
    auth: {
      welcome: "Բարի վերադարձ",
      signin_title: "Մուտք գործեք ձեր հաշիվ",
      email: "Էլ․ փոստ",
      password: "Գաղտնաբառ",
      forgot_password: "Մոռացե՞լ եք գաղտնաբառը",
      signin_button: "Մուտք",
    },
    demo: {
      title: "Դեմո մուտքային տվյալներ",
      admin: "Ադմին",
      vendor: "Գործընկեր",
      user: "Օգտատեր",
    },
  },

  ru: {
    brand: { name: "Salooote" },
    hero: {
      title: "Управляйте вашей платформой мероприятий",
      subtitle: "Полный контроль над партнёрами, заказами, мероприятиями и клиентами — всё в одном месте.",
    },
    stats: {
      vendors: "Партнёры",
      orders: "Заказы",
      rating: "Рейтинг",
    },
    auth: {
      welcome: "С возвращением",
      signin_title: "Войдите в свой аккаунт",
      email: "Эл. почта",
      password: "Пароль",
      forgot_password: "Забыли пароль?",
      signin_button: "Войти",
    },
    demo: {
      title: "Демо данные для входа",
      admin: "Администратор",
      vendor: "Партнёр",
      user: "Пользователь",
    },
  },
};

/* ─── Context ───────────────────────────────────────────────────────────── */
const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState("en");

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("locale");
    if (saved && translations[saved]) setLocaleState(saved);
  }, []);

  const setLocale = useCallback((lang) => {
    if (!translations[lang]) return;
    setLocaleState(lang);
    if (typeof window !== "undefined") localStorage.setItem("locale", lang);
  }, []);

  // Dot-notation translator: t("auth.welcome")
  const t = useCallback((key) => {
    const parts = key.split(".");
    let node = translations[locale];
    for (const part of parts) {
      if (node == null) break;
      node = node[part];
    }
    // Fallback to EN if missing
    if (node == null) {
      let fb = translations.en;
      for (const part of parts) { if (fb == null) break; fb = fb[part]; }
      return fb ?? key;
    }
    return node;
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

/* ─── Hook ──────────────────────────────────────────────────────────────── */
export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  return ctx;
}

/* ─── Language metadata (for switcher UI) ──────────────────────────────── */
export const LANGUAGES = [
  { code: "en", flag: "🇺🇸", label: "EN" },
  { code: "hy", flag: "🇦🇲", label: "HY" },
  { code: "ru", flag: "🇷🇺", label: "RU" },
];
