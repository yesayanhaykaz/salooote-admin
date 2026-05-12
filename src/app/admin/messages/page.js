"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Send, MessageSquare, Wifi, WifiOff } from "lucide-react";
import TopBar from "@/components/TopBar";
import { chatAPI } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { useChat } from "@/lib/useChat";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const COLORS = [
  "bg-pink-500", "bg-blue-500", "bg-purple-500",
  "bg-green-500", "bg-orange-500", "bg-teal-500", "bg-red-500", "bg-indigo-500",
];

function colorFor(str = "") {
  let h = 0;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return COLORS[h % COLORS.length];
}

function initials(name = "") {
  return name.split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminMessages() {
  const myId = getUser()?.id;

  const [conversations, setConversations] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selectedId,    setSelectedId]    = useState(null);
  const [messages,      setMessages]      = useState([]);  // stored oldest→newest
  const [msgLoading,    setMsgLoading]    = useState(false);
  const [input,         setInput]         = useState("");
  const [search,        setSearch]        = useState("");
  const [typing,        setTyping]        = useState(false); // other user typing
  const typingTimer = useRef(null);
  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);

  // ── WebSocket callbacks ───────────────────────────────────────────────────

  const handleNewMessage = useCallback((ws) => {
    const msg = ws.message;
    if (!msg) return;

    // Update conversation list's last_message + unread_count
    setConversations(prev => prev.map(c =>
      c.id === ws.conversation_id
        ? { ...c, last_message: msg.body, last_message_at: msg.created_at,
            unread_count: c.id === selectedIdRef.current ? 0 : (c.unread_count || 0) + 1 }
        : c
    ));

    // Append to open conversation
    if (ws.conversation_id === selectedIdRef.current) {
      setMessages(prev => [...prev, msg]);
    }

    window.dispatchEvent(new Event("notif-refresh"));
  }, []);

  const handleTyping = useCallback((ws) => {
    if (ws.conversation_id !== selectedIdRef.current) return;
    if (ws.user_id === myId) return;
    setTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(false), 3000);
  }, [myId]);

  const handleRead = useCallback((ws) => {
    if (ws.conversation_id !== selectedIdRef.current) return;
    if (ws.user_id === myId) return;
    // Could show read receipt — skip for now
  }, [myId]);

  const { connected, sendMessage: wsSend, sendTyping, sendRead } = useChat({
    onNewMessage: handleNewMessage,
    onTyping:     handleTyping,
    onRead:       handleRead,
  });

  // Keep selectedId in a ref for use inside WS callbacks (avoids stale closure)
  const selectedIdRef = useRef(selectedId);
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);

  // ── Load conversations ────────────────────────────────────────────────────

  useEffect(() => {
    chatAPI.conversations()
      .then(res => setConversations(res?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Load messages for selected conversation ───────────────────────────────

  useEffect(() => {
    if (!selectedId) { setMessages([]); return; }
    setMsgLoading(true);
    setTyping(false);

    chatAPI.messages(selectedId, { limit: 50 })
      .then(res => {
        // API returns newest-first; reverse for chronological display
        const list = (res?.data || []).slice().reverse();
        setMessages(list);
      })
      .catch(() => setMessages([]))
      .finally(() => setMsgLoading(false));

    // Send read receipt
    sendRead(selectedId);
    setConversations(prev => prev.map(c =>
      c.id === selectedId ? { ...c, unread_count: 0 } : c
    ));
  }, [selectedId, sendRead]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const selected = conversations.find(c => c.id === selectedId);

  const filtered = conversations.filter(c => {
    if (!search.trim()) return true;
    const name = [c.other_user?.first_name, c.other_user?.last_name].filter(Boolean).join(" ");
    const last = c.last_message || "";
    return name.toLowerCase().includes(search.toLowerCase())
        || last.toLowerCase().includes(search.toLowerCase());
  });

  // ── Send ──────────────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || !selectedId) return;
    setInput("");

    // Optimistic local message
    const optimistic = {
      id:              `tmp_${Date.now()}`,
      conversation_id: selectedId,
      sender_id:       myId,
      body:            text,
      created_at:      new Date().toISOString(),
      sender:          { id: myId, first_name: "Admin" },
    };
    setMessages(prev => [...prev, optimistic]);
    setConversations(prev => prev.map(c =>
      c.id === selectedId ? { ...c, last_message: text } : c
    ));

    // Try WS first, fall back to REST
    const sentViaWS = wsSend(selectedId, text);
    if (!sentViaWS) {
      try { await chatAPI.sendMessage(selectedId, text); } catch {}
    }
  }, [input, selectedId, myId, wsSend]);

  // Typing indicator while user types
  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
    if (selectedId) sendTyping(selectedId);
  }, [selectedId, sendTyping]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  // ─── UI ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar
        title="Messages"
        subtitle="Platform conversations"
        actions={
          <span className={`flex items-center gap-1 text-[11px] font-medium ${connected ? "text-success-600" : "text-surface-400"}`}>
            {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
            {connected ? "Live" : "Connecting…"}
          </span>
        }
      />

      <div className="flex-1 flex overflow-hidden">
        {/* ── Conversation List ──────────────────────────────────────────── */}
        <div className="w-[280px] flex-shrink-0 border-r border-surface-200 bg-white flex flex-col">

          <div className="p-4 border-b border-surface-100">
            <div className="flex items-center bg-surface-50 rounded-lg px-3 py-2 border border-surface-200 gap-2 focus-within:border-primary-400 transition-colors">
              <Search size={13} className="text-surface-400 flex-shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-surface-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="py-12 text-center text-sm text-surface-400">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <MessageSquare size={22} className="text-surface-300" />
                <p className="text-sm text-surface-400">No conversations</p>
              </div>
            ) : filtered.map(conv => {
              const other  = conv.other_user || {};
              const name   = [other.first_name, other.last_name].filter(Boolean).join(" ") || "Unknown";
              const color  = colorFor(name);
              const active = selectedId === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 border-b border-surface-50 text-left transition-colors cursor-pointer border-0 ${
                    active
                      ? "bg-primary-50 border-l-2 border-l-primary-600"
                      : "hover:bg-surface-50 bg-white border-l-2 border-l-transparent"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center flex-shrink-0 mt-0.5 relative`}>
                    <span className="text-xs font-bold text-white">{initials(name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-sm font-semibold truncate ${active ? "text-primary-700" : "text-surface-800"}`}>
                        {name}
                      </span>
                      <span className="text-[10px] text-surface-400 flex-shrink-0 ml-1">
                        {timeAgo(conv.last_message_at || conv.updated_at)}
                      </span>
                    </div>
                    <p className="text-xs text-surface-500 truncate">{conv.last_message || "No messages yet"}</p>
                  </div>
                  {conv.unread_count > 0 && (
                    <div className="min-w-[18px] h-[18px] rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 mt-0.5 px-1">
                      <span className="text-[10px] font-bold text-white">{conv.unread_count}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Chat Area ─────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col bg-surface-50 overflow-hidden">
          {selected ? (
            <>
              {/* Header */}
              <div className="bg-white border-b border-surface-200 px-6 py-4 flex items-center gap-3 flex-shrink-0">
                {(() => {
                  const other = selected.other_user || {};
                  const name  = [other.first_name, other.last_name].filter(Boolean).join(" ") || "Unknown";
                  const color = colorFor(name);
                  return (
                    <>
                      <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center`}>
                        <span className="text-sm font-bold text-white">{initials(name)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-surface-900">{name}</p>
                        {other.email && (
                          <p className="text-xs text-surface-400">{other.email}</p>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {msgLoading ? (
                  <div className="flex justify-center py-10 text-sm text-surface-400">Loading…</div>
                ) : messages.length === 0 ? (
                  <div className="flex justify-center py-10 text-sm text-surface-400">No messages yet</div>
                ) : messages.map((msg, i) => {
                  const isMine     = msg.sender_id === myId;
                  const senderName = msg.sender?.first_name || "";
                  const color      = colorFor(senderName);
                  return (
                    <div key={msg.id || i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      {!isMine && (
                        <div className={`w-7 h-7 rounded-full ${color} flex items-center justify-center flex-shrink-0 mr-2 mt-0.5`}>
                          <span className="text-[10px] font-bold text-white">{initials(senderName)}</span>
                        </div>
                      )}
                      <div className={`max-w-[68%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        isMine
                          ? "bg-primary-600 text-white rounded-br-sm"
                          : "bg-white text-surface-800 border border-surface-200 rounded-bl-sm"
                      }`}>
                        {!isMine && senderName && (
                          <p className="text-[10px] font-semibold mb-1 opacity-60">{senderName}</p>
                        )}
                        <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? "text-primary-200" : "text-surface-400"}`}>
                          {timeAgo(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-surface-200 rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1">
                      {[0, 1, 2].map(i => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 bg-surface-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="bg-white border-t border-surface-200 px-5 py-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center bg-surface-50 rounded-xl px-4 py-2.5 border border-surface-200 focus-within:border-primary-400 transition-colors">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message…"
                      className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-surface-400"
                    />
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white hover:bg-primary-700 transition-colors cursor-pointer border-0 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center">
                <MessageSquare size={28} className="text-surface-300" />
              </div>
              <p className="text-sm font-semibold text-surface-600">Select a conversation</p>
              <p className="text-xs text-surface-400">All platform conversations appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
