"use client";
import { useState } from "react";
import { Send, Paperclip, Search } from "lucide-react";
import TopBar from "@/components/TopBar";
import { MESSAGES } from "@/lib/data";

const CHAT_HISTORY = {
  1: [
    { from: "Anna Hovhannisyan", text: "Hi, is the wedding cake available for April 12?", time: "10:02 AM", mine: false },
    { from: "me", text: "Hello! Yes, we can do April 12. What size are you thinking?", time: "10:05 AM", mine: true },
    { from: "Anna Hovhannisyan", text: "We need a 3-tier cake for about 80 guests.", time: "10:07 AM", mine: false },
    { from: "me", text: "Perfect! Our 3-tier serves up to 100 guests. Price would be $350. Shall I send a design catalog?", time: "10:09 AM", mine: true },
    { from: "Anna Hovhannisyan", text: "Hi, is the cake available for April 12?", time: "10:12 AM", mine: false },
  ],
  2: [
    { from: "Tigran Avetisyan", text: "Thank you for the quick delivery!", time: "9:45 AM", mine: false },
    { from: "me", text: "You're welcome! Hope you enjoyed the cupcakes.", time: "9:48 AM", mine: true },
  ],
  3: [
    { from: "Sona Karapetyan", text: "Can I change my order to Saturday?", time: "8:30 AM", mine: false },
    { from: "me", text: "Of course! Saturday works fine. I'll update the order now.", time: "8:35 AM", mine: true },
    { from: "Sona Karapetyan", text: "Thank you so much!", time: "8:36 AM", mine: false },
  ],
  4: [
    { from: "Lilit Sargsyan", text: "I need a custom balloon arrangement for 100 guests.", time: "Yesterday", mine: false },
    { from: "me", text: "We can accommodate that! Let me put together a quote for you.", time: "Yesterday", mine: true },
  ],
  5: [
    { from: "Davit Hakobyan", text: "Please confirm my order #ORD-1039", time: "Yesterday", mine: false },
    { from: "me", text: "Your order is confirmed and will be ready by Thursday.", time: "Yesterday", mine: true },
  ],
};

export default function VendorMessages() {
  const [activeId, setActiveId] = useState(1);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState(CHAT_HISTORY);

  const active = MESSAGES.find(m => m.id === activeId);
  const messages = chats[activeId] || [];

  const sendMessage = () => {
    if (!input.trim()) return;
    setChats(prev => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), { from: "me", text: input, time: "Just now", mine: true }],
    }));
    setInput("");
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar title="Messages" />

      <div className="flex flex-1 overflow-hidden m-6 bg-white rounded-xl border border-surface-200">
        {/* Conversation List */}
        <div className="w-72 border-r border-surface-100 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-surface-100">
            <div className="flex items-center bg-surface-50 rounded-lg px-3 py-2 border border-surface-200 gap-2">
              <Search size={13} className="text-surface-400" />
              <input placeholder="Search messages…" className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-surface-400" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {MESSAGES.map(msg => (
              <button
                key={msg.id}
                onClick={() => setActiveId(msg.id)}
                className={`w-full px-4 py-3.5 flex items-start gap-3 border-b border-surface-50 text-left transition-colors cursor-pointer border-none ${
                  activeId === msg.id ? "bg-primary-50" : "hover:bg-surface-50 bg-transparent"
                }`}
              >
                <div className={`w-9 h-9 rounded-full ${msg.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-sm font-bold">{msg.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-sm font-semibold truncate ${activeId === msg.id ? "text-primary-700" : "text-surface-800"}`}>{msg.from}</span>
                    <span className="text-[10px] text-surface-400 flex-shrink-0 ml-1">{msg.time}</span>
                  </div>
                  <p className="text-xs text-surface-400 truncate">{msg.preview}</p>
                </div>
                {msg.unread > 0 && (
                  <span className="w-4 h-4 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">{msg.unread}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          {active && (
            <div className="px-5 py-3.5 border-b border-surface-100 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full ${active.color} flex items-center justify-center`}>
                <span className="text-white text-sm font-bold">{active.avatar}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-900">{active.from}</p>
                <p className="text-xs text-success-600">Online</p>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.mine
                      ? "bg-primary-600 text-white rounded-br-sm"
                      : "bg-surface-100 text-surface-800 rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                  <p className={`text-[10px] mt-1 ${msg.mine ? "text-primary-200" : "text-surface-400"}`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-surface-100">
            <div className="flex items-center gap-3 bg-surface-50 rounded-xl border border-surface-200 px-4 py-2.5">
              <button className="text-surface-400 hover:text-surface-600 cursor-pointer border-none bg-transparent">
                <Paperclip size={16} />
              </button>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Type a message…"
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-surface-400"
              />
              <button
                onClick={sendMessage}
                className="w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors cursor-pointer border-none flex-shrink-0"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
