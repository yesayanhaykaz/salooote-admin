"use client";
import { Sparkles } from "lucide-react";
import TopBar from "@/components/TopBar";
import { ChatInterface } from "@/components/AiChat";
import { useLocale } from "@/lib/i18n";

const TIP_KEYS = [
  { icon: "📦", key: "ai_assistant.example_product" },
  { icon: "🖼️", key: "ai_assistant.example_photos" },
  { icon: "🌐", key: "ai_assistant.example_languages" },
  { icon: "🔧", key: "ai_assistant.example_service" },
  { icon: "👤", key: "ai_assistant.example_business_update" },
  { icon: "✏️", key: "ai_assistant.example_after_creation" },
];

export default function AIAssistantPage() {
  const { t } = useLocale();

  return (
    <div className="flex flex-col min-h-screen bg-surface-50">
      <TopBar
        title={t("ai_assistant.title")}
        subtitle={t("ai_assistant.subtitle")}
      />

      <div className="flex-1 flex gap-5 p-6" style={{ height: "calc(100vh - 72px)" }}>

        {/* Left — tips only */}
        <div className="w-56 flex-shrink-0 flex flex-col gap-4">
          {/* Header pill */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-primary-600 rounded-2xl px-4 py-3">
            <Sparkles size={15} className="text-white flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">GPT-4o</p>
              <p className="text-[10px] text-white/70">EN · ՀՅ · RU</p>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white rounded-2xl border border-surface-200 p-4 flex-1">
            <p className="text-[11px] font-bold text-surface-500 uppercase tracking-wide mb-3">
              {t("ai_assistant.example_prompts")}
            </p>
            <div className="space-y-3">
              {TIP_KEYS.map(({ icon, key }, i) => (
                <div key={i} className="flex gap-2.5">
                  <span className="text-base flex-shrink-0 leading-tight mt-0.5">{icon}</span>
                  <p className="text-[11px] text-surface-600 leading-relaxed">{t(key)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main chat */}
        <div className="flex-1 bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden flex flex-col min-h-0">
          <ChatInterface role="vendor" compact={false} />
        </div>

      </div>
    </div>
  );
}
