"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Send, Paperclip, MessageSquare, Users, Wifi, WifiOff } from "lucide-react";
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
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VendorMessages() {
  const myId = getUser()?.id;

  const [conversations, setConversations] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selectedId,    setSelectedId]    = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [msgLoading,    setMsgLoading]    = useState(false);
  const [input,         setInput]         = useState("");
  const [search,        setSearch]        = useState("");
  const [typing,        setTyping]        = useState(false);
  const typingTimer = useRef(null);
  const bottomRef   = useRef(null);

  // ── WebSocket ─────────────────────────────────────────────────────────────

  const handleNewMessage = useCallback((ws) => {
    const msg = ws.message;
    if (!msg) return;

    setConversations(prev => prev.map(c =>
      c.id === ws.conversation_id
        ? { ...c, last_message: msg.body, last_message_at: msg.created_at,
            unread_count: c.id === selectedIdRef.current ? 0 : (c.unread_count || 0) + 1 }
        : c
    ));

    if (ws.conversation_id === selectedIdRef.current) {
      setMessages(prev => [...prev, msg]);
    }

    // Refresh TopBar notification bell
    window.dispatchEvent(new Event("notif-refresh"));
  }, []);

  const handleTyping = useCallback((ws) => {
    if (ws.conversation_id !== selectedIdRef.current || ws.user_id === myId) return;
    setTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(false), 3000);
  }, [myId]);

  const { connected, sendMessage: wsSend, sendTyping, sendRead } = useChat({
    onNewMessage: handleNewMessage,
    onTyping:     handleTyping,
  });

  const selectedIdRef = useRef(selectedId);
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);

  // ── Load conversations ────────────────────────────────────────────────────

  useEffect(() => {
    chatAPI.conversations()
      .then(res => setConversations(res?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Load messages ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!selectedId) { setMessages([]); return; }
    setMsgLoading(true);
    setTyping(false);

    chatAPI.messages(selectedId, { limit: 50 })
      .then(res => setMessages((res?.data || []).slice().reverse()))
      .catch(() => setMessages([]))
      .finally(() => setMsgLoading(false));

    sendRead(selectedId);
    setConversations(prev => prev.map(c =>
      c.id === selectedId ? { ...c, unread_count: 0 } : c
    ));
  }, [selectedId, sendRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const selected = conversations.find(c => c.id === selectedId);

  // Client conversations only (backend already enforces this for vendor JWT,
  // but we guard on the frontend too so admin-initiated convs are excluded)
  const clientConvs = conversations.filter(conv => {
    const other = conv.other_user;
    if (!other) return true; // unknown — show it
    // Exclude if the other party is an admin (role field if present)
    return other.role !== "admin";
  });

  const totalUnread = clientConvs.reduce((s, c) => s + (c.unread_count || 0), 0);

  const filtered = clientConvs.filter(c => {
    if (!search.trim()) return true;
    const name = [c.other_user?.first_name, c.other_user?.last_name].filter(Boolean).join(" ").toLowerCase();
    const last = (c.last_message || "").toLowerCase();
    return name.includes(search.toLowerCase()) || last.includes(search.toLowerCase());
  });

  // ── Send ──────────────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || !selectedId) return;
    setInput("");

    const optimistic = {
      id:              `tmp_${Date.now()}`,
      conversation_id: selectedId,
      sender_id:       myId,
      body:            text,
      created_at:      new Date().toISOString(),
      sender:          { id: myId, first_name: "Me" },
    };
    setMessages(prev => [...prev, optimistic]);
    setConversations(prev => prev.map(c =>
      c.id === selectedId ? { ...c, last_message: text } : c
    ));

    const sentViaWS = wsSend(selectedId, text);
    if (!sentViaWS) {
      try { await chatAPI.sendMessage(selectedId, text); } catch {}
    }
  }, [input, selectedId, myId, wsSend]);

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
    if (selectedId) sendTyping(selectedId);
  }, [selectedId, sendTyping]);

  // ─── UI ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar
        title="Messages"
        subtitle={totalUnread > 0 ? `${totalUnread} unread` : "Client conversations"}
        actions={
          <span className={`flex items-center gap-1 text-[11px] font-medium ${connected ? "text-success-600" : "text-surface-400"}`}>
            {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
            {connected ? "Live" : "Reconnecting…"}
          </span>
        }
      />

      <div className="flex flex-1 overflow-hidden m-6 bg-white rounded-xl border border-surface-200">
        {/* ── Conversation List ──────────────────────────────────────────── */}
        <div className="w-72 border-r border-surface-100 flex flex-col flex-shrink-0">

          <div className="p-4 border-b border-surface-100 space-y-3">
            <div className="flex items-center gap-1.5">
              <Users size={12} className="text-blue-500" />
              <span className="text-[11px] font-semibold text-blue-600">Client Messages Only</span>
            </div>
            <div className="flex items-center bg-surface-50 rounded-lg px-3 py-2 border border-surface-200 gap-2 focus-within:border-primary-400 transition-colors">
              <Search size={13} className="text-surface-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search clients…"
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
                <p className="text-sm text-surface-400">No client messages yet</p>
              </div>
            ) : filtered.map(conv => {
              const name   = [conv.other_user?.first_name, conv.other_user?.last_name].filter(Boolean).join(" ") || "Client";
              const color  = colorFor(name);
              const active = selectedId === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full px-4 py-3.5 flex items-start gap-3 border-b border-surface-50 text-left transition-colors cursor-pointer border-none ${
                    active ? "bg-primary-50" : "hover:bg-surface-50 bg-transparent"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-sm font-bold">{initials(name)}</span>
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
                    <p className="text-xs text-surface-400 truncate">{conv.last_message || "No messages yet"}</p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="min-w-[18px] h-[18px] bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 px-1">
                      {conv.unread_count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Chat Area ─────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {selected ? (
            <>
              {/* Header */}
              {(() => {
                const name  = [selected.other_user?.first_name, selected.other_user?.last_name].filter(Boolean).join(" ") || "Client";
                const color = colorFor(name);
                return (
                  <div className="px-5 py-3.5 border-b border-surface-100 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center`}>
                      <span className="text-white text-sm font-bold">{initials(name)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-surface-900">{name}</p>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          Client
                        </span>
                      </div>
                      {selected.other_user?.email && (
                        <p className="text-xs text-surface-400">{selected.other_user.email}</p>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {msgLoading ? (
                  <div className="flex justify-center py-10 text-sm text-surface-400">Loading…</div>
                ) : messages.length === 0 ? (
                  <div className="flex justify-center py-10 text-sm text-surface-400">No messages yet</div>
                ) : messages.map((msg, i) => {
                  const isMine = msg.sender_id === myId;
                  const color  = colorFor(msg.sender?.first_name || "");
                  return (
                    <div key={msg.id || i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      {!isMine && (
                        <div className={`w-7 h-7 rounded-full ${color} flex items-center justify-center flex-shrink-0 mr-2 mt-0.5`}>
                          <span className="text-[10px] font-bold text-white">{initials(msg.sender?.first_name || "")}</span>
                        </div>
                      )}
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMine
                          ? "bg-primary-600 text-white rounded-br-sm"
                          : "bg-surface-100 text-surface-800 rounded-bl-sm"
                      }`}>
                        <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? "text-primary-200" : "text-surface-400"}`}>
                          {timeAgo(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Typing */}
                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-surface-100 rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1">
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
              <div className="px-5 py-4 border-t border-surface-100">
                <div className="flex items-center gap-3 bg-surface-50 rounded-xl border border-surface-200 px-4 py-2.5 focus-within:border-primary-400 transition-colors">
                  <button className="text-surface-400 hover:text-surface-600 cursor-pointer border-none bg-transparent flex-shrink-0">
                    <Paperclip size={16} />
                  </button>
                  <input
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    placeholder="Reply to client…"
                    className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-surface-400"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors cursor-pointer border-none flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <MessageSquare size={28} className="text-blue-300" />
              </div>
              <p className="text-sm font-semibold text-surface-600">Select a conversation</p>
              <p className="text-xs text-surface-400">
                Messages from your clients appear here in real time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
