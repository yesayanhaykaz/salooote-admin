"use client";
import { useState } from "react";
import { Search, Send, Phone, Video, MoreHorizontal } from "lucide-react";
import TopBar from "@/components/TopBar";
import { MESSAGES } from "@/lib/data";

const SAMPLE_CHATS = {
  1: [
    { id: 1, text: "Hi, is the wedding cake available for April 12?",              sent: false, time: "10:32 AM" },
    { id: 2, text: "Yes, it's available! Would you like to customize it?",         sent: true,  time: "10:34 AM" },
    { id: 3, text: "That would be great. Can I add extra tiers?",                  sent: false, time: "10:35 AM" },
    { id: 4, text: "Absolutely. We offer 2, 3 and 4-tier options. I'll send you the catalog now.", sent: true, time: "10:37 AM" },
  ],
  2: [
    { id: 1, text: "I just received my order. Everything looks amazing!",          sent: false, time: "9:15 AM" },
    { id: 2, text: "Thank you so much! We're glad you love it. 💜",                sent: true,  time: "9:18 AM" },
    { id: 3, text: "The delivery was super quick too, thank you!",                 sent: false, time: "9:20 AM" },
    { id: 4, text: "Our pleasure. Let us know if you need anything else.",          sent: true,  time: "9:21 AM" },
  ],
  3: [
    { id: 1, text: "Hi, can I change my balloon order to Saturday delivery?",     sent: false, time: "8:45 AM" },
    { id: 2, text: "Let me check availability with the vendor...",                 sent: true,  time: "8:47 AM" },
    { id: 3, text: "Good news — Saturday works! I've updated your order.",        sent: true,  time: "8:52 AM" },
  ],
  4: [
    { id: 1, text: "I need a custom balloon arrangement for 100 guests at my venue.", sent: false, time: "Yesterday" },
    { id: 2, text: "That sounds wonderful! Can you share your venue size?",           sent: true,  time: "Yesterday" },
    { id: 3, text: "It's a 500sqm ballroom.",                                         sent: false, time: "Yesterday" },
  ],
  5: [
    { id: 1, text: "Please confirm my order #ORD-1039 is still on track.",        sent: false, time: "Mon" },
    { id: 2, text: "Yes, #ORD-1039 is confirmed and on track for delivery.",      sent: true,  time: "Mon" },
  ],
};

export default function MessagesPage() {
  const [selectedId, setSelectedId]   = useState(1);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const selected     = MESSAGES.find(m => m.id === selectedId);
  const conversation = SAMPLE_CHATS[selectedId] || [];

  const filteredMessages = MESSAGES.filter(m =>
    m.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = () => {
    if (!messageInput.trim()) return;
    setMessageInput("");
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar title="Messages" />

      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List */}
        <div className="w-[260px] flex-shrink-0 border-r border-surface-200 bg-white flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-surface-100">
            <div className="flex items-center bg-surface-50 rounded-lg px-3 py-2 border border-surface-200 gap-2 focus-within:border-primary-400 transition-colors">
              <Search size={13} className="text-surface-400 flex-shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages…"
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-surface-400"
              />
            </div>
          </div>

          {/* Conversation Items */}
          <div className="flex-1 overflow-y-auto">
            {filteredMessages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => setSelectedId(msg.id)}
                className={`w-full flex items-start gap-3 px-4 py-3.5 border-b border-surface-50 text-left transition-colors cursor-pointer border-0 ${
                  selectedId === msg.id
                    ? "bg-primary-50 border-l-2 border-l-primary-600"
                    : "hover:bg-surface-50 bg-white border-l-2 border-l-transparent"
                }`}
              >
                <div className={`w-9 h-9 rounded-full ${msg.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <span className="text-xs font-bold text-white">{msg.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold text-surface-800 truncate">{msg.from}</span>
                    <span className="text-[10px] text-surface-400 flex-shrink-0 ml-1">{msg.time}</span>
                  </div>
                  <p className="text-xs text-surface-500 truncate">{msg.preview}</p>
                </div>
                {msg.unread > 0 && (
                  <div className="w-4.5 h-4.5 min-w-[18px] h-[18px] rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-white">{msg.unread}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-surface-50 overflow-hidden">
          {selected ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-surface-200 px-6 py-4 flex items-center gap-3 flex-shrink-0">
                <div className={`w-9 h-9 rounded-full ${selected.color} flex items-center justify-center`}>
                  <span className="text-sm font-bold text-white">{selected.avatar}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-surface-900">{selected.from}</p>
                  <p className="text-xs text-success-600 font-medium">Online</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-500 hover:bg-surface-100 transition-colors cursor-pointer border-0 bg-transparent">
                    <Phone size={15} />
                  </button>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-500 hover:bg-surface-100 transition-colors cursor-pointer border-0 bg-transparent">
                    <Video size={15} />
                  </button>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-500 hover:bg-surface-100 transition-colors cursor-pointer border-0 bg-transparent">
                    <MoreHorizontal size={15} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {conversation.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}>
                    {!msg.sent && (
                      <div className={`w-7 h-7 rounded-full ${selected.color} flex items-center justify-center flex-shrink-0 mr-2 mt-0.5`}>
                        <span className="text-xs font-bold text-white">{selected.avatar}</span>
                      </div>
                    )}
                    <div className={`max-w-[68%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.sent
                        ? "bg-primary-600 text-white rounded-br-sm"
                        : "bg-white text-surface-800 border border-surface-200 rounded-bl-sm"
                    }`}>
                      <p>{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${msg.sent ? "text-primary-200" : "text-surface-400"}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-surface-200 px-5 py-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center bg-surface-50 rounded-xl px-4 py-2.5 border border-surface-200 focus-within:border-primary-400 transition-colors gap-2">
                    <input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Type a message…"
                      className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-surface-400"
                    />
                  </div>
                  <button
                    onClick={handleSend}
                    className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white hover:bg-primary-700 transition-colors cursor-pointer border-0 flex-shrink-0"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-surface-400 text-sm">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
