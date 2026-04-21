"use client";
import { Sparkles } from "lucide-react";
import TopBar from "@/components/TopBar";
import { ChatInterface } from "@/components/AiChat";

const TIPS = [
  { icon: "📦", text: "\"I want to add a three-tier chocolate wedding cake, price 25,000 AMD\"" },
  { icon: "🖼️", text: "Attach photos first, then describe — they'll be added to the product automatically" },
  { icon: "🌐", text: "Write in Armenian, Russian, or English — all 3 languages are generated" },
  { icon: "🔧", text: "\"Create a flower decoration service, quote-based pricing\"" },
  { icon: "👤", text: "\"Update my address to Yerevan, Abovyan 12\"" },
  { icon: "✏️", text: "After creation, click the card to add more details, more photos, and publish" },
];

export default function AIAssistantPage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface-50">
      <TopBar
        title="AI Assistant"
        subtitle="Create products & services in any language"
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
            <p className="text-[11px] font-bold text-surface-500 uppercase tracking-wide mb-3">Example prompts</p>
            <div className="space-y-3">
              {TIPS.map(({ icon, text }, i) => (
                <div key={i} className="flex gap-2.5">
                  <span className="text-base flex-shrink-0 leading-tight mt-0.5">{icon}</span>
                  <p className="text-[11px] text-surface-600 leading-relaxed">{text}</p>
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
