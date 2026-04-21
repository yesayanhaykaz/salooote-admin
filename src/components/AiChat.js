"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles, X, Send, Loader2, Package, Wrench,
  Building2, Tag, ChevronRight, RotateCcw, User,
  ImagePlus, Maximize2, XCircle,
} from "lucide-react";
import { aiAPI, uploadAPI } from "@/lib/api";
import { useLocale } from "@/lib/i18n";

// ─── Action result cards ──────────────────────────────────────────────────────

function ProductCard({ data, router, t }) {
  return (
    <div
      onClick={() => router.push(`/vendor/products?edit=${data.id}`)}
      className="mt-3 bg-white border border-surface-200 rounded-xl p-4 cursor-pointer hover:border-primary-400 hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0">
          <Package size={18} className="text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-0.5">{t("ai_assistant.product_created")}</p>
          <p className="text-sm font-bold text-surface-900 truncate">{data.name}</p>
          <p className="text-xs text-surface-400">/{data.slug}</p>
        </div>
        <ChevronRight size={16} className="text-surface-300 group-hover:text-primary-500 transition-colors flex-shrink-0" />
      </div>
      {data.photoCount > 0 && (
        <div className="mt-2 flex items-center gap-1.5">
          <ImagePlus size={12} className="text-primary-400" />
          <p className="text-xs text-primary-500 font-medium">{data.photoCount} {t("ai_assistant.photos_uploaded")}</p>
        </div>
      )}
      {data.photoFailed > 0 && (
        <div className="mt-1 flex items-center gap-1.5">
          <XCircle size={12} className="text-red-400" />
          <p className="text-xs text-red-500">{data.photoFailed} {t("ai_assistant.photos_failed")}</p>
        </div>
      )}
      <p className="text-xs text-surface-500 mt-1.5">{t("ai_assistant.click_to_open_editor")}</p>
    </div>
  );
}

function ServiceCard({ data, router, t }) {
  return (
    <div
      onClick={() => router.push(`/vendor/services?edit=${data.id}`)}
      className="mt-3 bg-white border border-surface-200 rounded-xl p-4 cursor-pointer hover:border-brand-400 hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center flex-shrink-0">
          <Wrench size={18} className="text-brand-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-0.5">{t("ai_assistant.service_created")}</p>
          <p className="text-sm font-bold text-surface-900 truncate">{data.name}</p>
          <p className="text-xs text-surface-400">/{data.slug}</p>
        </div>
        <ChevronRight size={16} className="text-surface-300 group-hover:text-brand-500 transition-colors flex-shrink-0" />
      </div>
      {data.photoCount > 0 && (
        <div className="mt-2 flex items-center gap-1.5">
          <ImagePlus size={12} className="text-brand-400" />
          <p className="text-xs text-brand-500 font-medium">{data.photoCount} {t("ai_assistant.photos_uploaded")}</p>
        </div>
      )}
      {data.photoFailed > 0 && (
        <div className="mt-1 flex items-center gap-1.5">
          <XCircle size={12} className="text-red-400" />
          <p className="text-xs text-red-500">{data.photoFailed} {t("ai_assistant.photos_failed")}</p>
        </div>
      )}
      <p className="text-xs text-surface-500 mt-1.5">{t("ai_assistant.click_to_open_editor")}</p>
    </div>
  );
}

function VendorCard({ data, router, t }) {
  return (
    <div
      onClick={() => router.push(`/admin/vendors`)}
      className="mt-3 bg-white border border-surface-200 rounded-xl p-4 cursor-pointer hover:border-sage-400 hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-sage-50 border border-sage-100 flex items-center justify-center flex-shrink-0">
          <Building2 size={18} className="text-sage-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-sage-700 uppercase tracking-wide mb-0.5">{t("ai_assistant.vendor_created")}</p>
          <p className="text-sm font-bold text-surface-900 truncate">{data.business_name}</p>
          <p className="text-xs text-surface-400">{data.email}</p>
        </div>
        <ChevronRight size={16} className="text-surface-300 group-hover:text-sage-600 transition-colors flex-shrink-0" />
      </div>
      {data.password && (
        <div className="mt-2 bg-surface-50 rounded-lg px-3 py-2 border border-surface-100">
          <p className="text-xs text-surface-500">{t("ai_assistant.temp_password")} <span className="font-mono font-bold text-surface-800">{data.password}</span></p>
        </div>
      )}
      <p className="text-xs text-surface-500 mt-2">{t("ai_assistant.click_to_view_vendors")}</p>
    </div>
  );
}

function CategoryCard({ data, router, t }) {
  return (
    <div
      onClick={() => router.push(`/admin/categories`)}
      className="mt-3 bg-white border border-surface-200 rounded-xl p-4 cursor-pointer hover:border-warm-400 hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-warm-50 border border-warm-100 flex items-center justify-center flex-shrink-0 text-xl">
          {data.emoji || <Tag size={18} className="text-warm-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-warm-700 uppercase tracking-wide mb-0.5">{t("ai_assistant.category_created")}</p>
          <p className="text-sm font-bold text-surface-900 truncate">{data.name}</p>
          <p className="text-xs text-surface-400">/{data.slug}</p>
        </div>
        <ChevronRight size={16} className="text-surface-300 group-hover:text-warm-600 transition-colors flex-shrink-0" />
      </div>
      <p className="text-xs text-surface-500 mt-2">{t("ai_assistant.click_to_manage_categories")}</p>
    </div>
  );
}

function ProfileCard({ data, t }) {
  return (
    <div className="mt-3 bg-white border border-surface-200 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0">
          <User size={18} className="text-primary-600" />
        </div>
        <div>
          <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-0.5">{t("ai_assistant.profile_updated")}</p>
          <p className="text-sm font-bold text-surface-900">{data.business_name}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg, router, t }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-white ${
        isUser ? "bg-primary-600" : "bg-gradient-to-br from-violet-500 to-primary-600"
      }`}>
        {isUser ? <span className="text-[9px] font-bold">You</span> : <Sparkles size={12} />}
      </div>
      <div className={`max-w-[82%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        {/* Text bubble */}
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-primary-600 text-white rounded-tr-sm"
            : "bg-white border border-surface-200 text-surface-800 rounded-tl-sm shadow-sm"
        }`}>
          {msg.content}
        </div>
        {/* Image previews in user message */}
        {msg.images?.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap justify-end">
            {msg.images.map((src, i) => (
              <img key={i} src={src} alt="" className="w-16 h-16 rounded-lg object-cover border border-white/30 shadow" />
            ))}
          </div>
        )}
        {/* Action card */}
        {msg.action && (
          <>
            {msg.action.type === "product_created"  && <ProductCard  data={msg.action.data} router={router} t={t} />}
            {msg.action.type === "service_created"  && <ServiceCard  data={msg.action.data} router={router} t={t} />}
            {msg.action.type === "vendor_created"   && <VendorCard   data={msg.action.data} router={router} t={t} />}
            {msg.action.type === "category_created" && <CategoryCard data={msg.action.data} router={router} t={t} />}
            {msg.action.type === "profile_updated"  && <ProfileCard  data={msg.action.data} t={t} />}
          </>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-primary-600 flex items-center justify-center flex-shrink-0">
        <Sparkles size={12} className="text-white" />
      </div>
      <div className="bg-white border border-surface-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Shared ChatInterface ─────────────────────────────────────────────────────

export function ChatInterface({ role = "vendor", compact = true, onClose }) {
  const router = useRouter();
  const { t } = useLocale();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingImages, setPendingImages] = useState([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Suggestions: display label (translated) + value sent to AI (always English)
  const suggestions = role === "vendor"
    ? [
        { label: t("ai_assistant.quick_action_product"), value: "I want to add a new product" },
        { label: t("ai_assistant.quick_action_service"), value: "Create a new service for me" },
        { label: t("ai_assistant.quick_action_business"), value: "Update my business info" },
      ]
    : [
        { label: t("ai_assistant.quick_action_vendor"),   value: "Create a new vendor" },
        { label: t("ai_assistant.quick_action_category"), value: "Add a new category" },
      ];

  const welcomeTitle = role === "vendor" ? t("ai_assistant.greeting")        : t("ai_assistant.admin_greeting");
  const welcomeSub   = role === "vendor" ? t("ai_assistant.description")     : t("ai_assistant.admin_description");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const addImages = (files) => {
    const newItems = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPendingImages(prev => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (i) => {
    setPendingImages(prev => {
      URL.revokeObjectURL(prev[i].preview);
      return prev.filter((_, j) => j !== i);
    });
  };

  const send = useCallback(async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    const captured = [...pendingImages];
    const imagePreviews = captured.map(p => p.preview);

    const userMsg = { role: "user", content, images: imagePreviews.length ? imagePreviews : undefined };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setPendingImages([]);
    setLoading(true);

    try {
      const history = newMessages.map(m => ({ role: m.role, content: m.content }));
      const chatFn = role === "vendor" ? aiAPI.vendorChat : aiAPI.adminChat;
      const res = await chatFn(history);
      const { message, action } = res?.data || {};

      let finalAction = action ? { ...action, data: { ...action.data } } : null;

      if (finalAction && captured.length > 0) {
        const id = finalAction.data?.id;
        const uploadFn = finalAction.type === "product_created"
          ? (f) => uploadAPI.productImage(id, f)
          : finalAction.type === "service_created"
          ? (f) => uploadAPI.serviceImage(id, f)
          : null;

        if (uploadFn && id) {
          const results = await Promise.allSettled(
            captured.map(p => uploadFn(p.file))
          );
          const uploaded = results.filter(r => r.status === "fulfilled").length;
          const failed   = results.filter(r => r.status === "rejected").length;
          if (uploaded > 0) finalAction.data.photoCount = uploaded;
          if (failed > 0)   finalAction.data.photoFailed = failed;
        }
      }

      setMessages(prev => [...prev, {
        role: "assistant",
        content: message || "Something went wrong. Please try again.",
        action: finalAction,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I couldn't process that. Please check your connection and try again.",
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, role, pendingImages]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-full">

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center text-center px-4 py-6 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-primary-600 flex items-center justify-center shadow-lg">
              <Sparkles size={28} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-surface-900 text-sm mb-1">{welcomeTitle}</p>
              <p className="text-xs text-surface-500 leading-relaxed max-w-[260px]">{welcomeSub}</p>
            </div>
            {role === "vendor" && (
              <div className="flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-xl px-3 py-2">
                <ImagePlus size={13} className="text-primary-500 flex-shrink-0" />
                <p className="text-xs text-primary-600">{t("ai_assistant.attach_hint")}</p>
              </div>
            )}
            <div className="flex flex-col gap-2 w-full mt-1">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(s.value)}
                  className="text-left px-3 py-2.5 bg-white border border-surface-200 rounded-xl text-xs text-surface-700 font-medium hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 transition-all cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} router={router} t={t} />
        ))}

        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Pending image previews */}
      {pendingImages.length > 0 && (
        <div className="flex gap-2 flex-wrap px-4 py-2 border-t border-surface-100 bg-white">
          {pendingImages.map((item, i) => (
            <div key={i} className="relative group">
              <img
                src={item.preview}
                alt=""
                className="w-14 h-14 object-cover rounded-lg border border-surface-200"
              />
              <button
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-surface-800 text-white rounded-full flex items-center justify-center border-none cursor-pointer hover:bg-red-500 transition-colors"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          <p className="w-full text-[10px] text-surface-400 mt-0.5">
            {pendingImages.length} {t("ai_assistant.photos_ready")}
          </p>
        </div>
      )}

      {/* Input bar */}
      <div className={`flex-shrink-0 bg-white border-t border-surface-100 ${compact ? "px-3 pb-3 pt-2" : "px-4 pb-4 pt-3"}`}>
        <div className="flex items-end gap-2 bg-surface-50 border border-surface-200 rounded-xl px-3 py-2.5 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
          {/* Image attach */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            title={t("ai_assistant.attach_hint")}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border-none bg-transparent cursor-pointer text-surface-400 hover:text-primary-600 hover:bg-primary-50 transition-all disabled:opacity-40"
          >
            <ImagePlus size={17} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={e => addImages(e.target.files)}
          />

          {/* Text input */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("ai_assistant.input_placeholder")}
            rows={1}
            disabled={loading}
            className="flex-1 resize-none bg-transparent border-none outline-none text-sm text-surface-800 placeholder:text-surface-400 leading-relaxed disabled:opacity-50 py-0.5"
            style={{ maxHeight: 120, overflowY: "auto" }}
            onInput={e => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
          />

          {/* Send */}
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center border-none cursor-pointer hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
        <p className="text-[10px] text-surface-400 text-center mt-1.5">
          {t("ai_assistant.input_hint")}
        </p>
      </div>
    </div>
  );
}

// ─── Floating AiChat (used in layout) ────────────────────────────────────────

export default function AiChat({ role = "vendor" }) {
  const router = useRouter();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  const fullPagePath = role === "vendor" ? "/vendor/ai" : "/admin/ai";

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-xl text-white text-sm font-semibold border-none cursor-pointer transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-violet-600 to-primary-600 ${
          open ? "opacity-0 pointer-events-none scale-90" : "opacity-100"
        }`}
        style={{ boxShadow: "0 8px 32px rgba(109,40,217,0.35)" }}
      >
        <Sparkles size={16} />
        {t("ai_assistant.title")}
      </button>

      {/* Floating panel */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex flex-col transition-all duration-300 ${
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-6 pointer-events-none"
        }`}
        style={{ width: 390, height: 600 }}
      >
        <div
          className="flex flex-col h-full bg-surface-50 rounded-2xl border border-surface-200 overflow-hidden"
          style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-violet-600 to-primary-600 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles size={15} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white leading-tight">{t("ai_assistant.title")}</p>
              <p className="text-[11px] text-white/70">GPT-4o · EN / ՀՅ / RU</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setOpen(false); router.push(fullPagePath); }}
                title="Open full page"
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center border-none cursor-pointer transition-colors"
              >
                <Maximize2 size={12} className="text-white" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center border-none cursor-pointer transition-colors"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
          </div>

          {/* Chat content */}
          <ChatInterface role={role} compact={true} />
        </div>
      </div>
    </>
  );
}
