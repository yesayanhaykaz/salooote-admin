"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, Send, MessageSquare, Plus, X, Wifi, WifiOff,
} from "lucide-react";
import TopBar from "@/components/TopBar";
import { chatAPI, publicAPI } from "@/lib/api";
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

// ─── New Chat Modal ───────────────────────────────────────────────────────────

function NewChatModal({ onClose, onStarted }) {
  const [vendors,  setVendors]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [query,    setQuery]    = useState("");
  const [starting, setStarting] = useState(null); // vendor id being started
  const [error,    setError]    = useState("");

  useEffect(() => {
    publicAPI.vendors({ limit: 50 })
      .then(res => setVendors(res?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredVendors = vendors.filter(v => {
    if (!query.trim()) return true;
    const name = (v.business_name || v.name || "").toLowerCase();
    return name.includes(query.toLowerCase());
  });

  const handleStart = async (vendorId) => {
    setStarting(vendorId);
    setError("");
    try {
      const res = await chatAPI.startConversation(vendorId);
      const conv = res?.data || res;
      if (conv?.id) {
        onStarted(conv);
      }
    } catch (e) {
      setError(e.message || "Could not start conversation. Try again.");
    } finally {
      setStarting(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="px-5 py-4 border-b border-surface-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-surface-900">New Conversation</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-surface-100 flex items-center justify-center transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={14} className="text-surface-500" />
          </button>
        </div>

        <div className="p-4 border-b border-surface-100">
          <div className="flex items-center bg-surface-50 rounded-lg px-3 py-2 border border-surface-200 gap-2 focus-within:border-primary-400 transition-colors">
            <Search size={13} className="text-surface-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search vendors…"
              autoFocus
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-surface-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-sm text-surface-400">Loading vendors…</div>
          ) : filteredVendors.length === 0 ? (
            <div className="py-8 text-center text-sm text-surface-400">No vendors found</div>
          ) : filteredVendors.map(v => {
            const name  = v.business_name || v.name || "Vendor";
            const color = colorFor(name);
            const busy  = starting === v.id;
            return (
              <button
                key={v.id}
                onClick={() => handleStart(v.id)}
                disabled={!!starting}
                className="w-full flex items-center gap-3 px-4 py-3 border-b border-surface-50 hover:bg-surface-50 transition-colors cursor-pointer border-none bg-transparent text-left disabled:opacity-60"
              >
                {v.logo_url ? (
                  <img src={v.logo_url} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-sm font-bold">{initials(name)}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-800 truncate">{name}</p>
                  {v.category_name && (
                    <p className="text-xs text-surface-400 truncate">{v.category_name}</p>
                  )}
                </div>
                {busy ? (
                  <span className="text-xs text-primary-600 font-medium">Starting…</span>
                ) : (
                  <MessageSquare size={14} className="text-surface-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="px-4 py-2 border-t border-surface-100">
            <p className="text-xs text-danger-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserMessages() {
  const myId = getUser()?.id;

  const [conversations, setConversations] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selectedId,    setSelectedId]    = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [msgLoading,    setMsgLoading]    = useState(false);
  const [input,         setInput]         = useState("");
  const [search,        setSearch]        = useState("");
  const [typing,        setTyping]        = useState(false);
  const [showModal,     setShowModal]     = useState(false);
  const typingTimer = useRef(null);
  const bottomRef   = useRef(null);

  // ── WebSocket ─────────────────────────────────────────────────────────────

  const handleNewMessage = useCallback((ws) => {
    const msg = ws.message;
    if (!msg) return;

    setConversations(prev => {
      const exists = prev.find(c => c.id === ws.conversation_id);
      if (exists) {
        return prev.map(c =>
          c.id === ws.conversation_id
            ? { ...c, last_message: msg.body, last_message_at: msg.created_at,
                unread_count: c.id === selectedIdRef.current ? 0 : (c.unread_count || 0) + 1 }
            : c
        );
      }
      // New conversation arrived — re-fetch list
      chatAPI.conversations().then(res => setConversations(res?.data || [])).catch(() => {});
      return prev;
    });

    if (ws.conversation_id === selectedIdRef.current) {
      setMessages(prev => [...prev, msg]);
    }
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
  const totalUnread = conversations.reduce((s, c) => s + (c.unread_count || 0), 0);

  const filtered = conversations.filter(c => {
    if (!search.trim()) return true;
    const name = (c.other_user?.first_name || "").toLowerCase();
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

  // When a new conversation is started from modal
  const handleConversationStarted = useCallback((conv) => {
    setShowModal(false);
    setConversations(prev => {
      const exists = prev.find(c => c.id === conv.id);
      return exists ? prev : [conv, ...prev];
    });
    setSelectedId(conv.id);
  }, []);

  // ─── UI ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-surface-50">
      <TopBar
        title="Messages"
        subtitle={totalUnread > 0 ? `${totalUnread} unread` : "Your vendor conversations"}
        actions={
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1 text-[11px] font-medium ${connected ? "text-success-600" : "text-surface-400"}`}>
              {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
              {connected ? "Live" : "Connecting…"}
            </span>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 text-xs font-semibold bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none"
            >
              <Plus size={13} /> New Chat
            </button>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden m-6 bg-white rounded-xl border border-surface-200">
        {/* ── Conversation List ──────────────────────────────────────────── */}
        <div className="w-72 border-r border-surface-100 flex flex-col flex-shrink-0">

          <div className="p-4 border-b border-surface-100">
            <div className="flex items-center bg-surface-50 rounded-lg px-3 py-2 border border-surface-200 gap-2 focus-within:border-primary-400 transition-colors">
              <Search size={13} className="text-surface-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-surface-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="py-12 text-center text-sm text-surface-400">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 px-6 text-center">
                <MessageSquare size={24} className="text-surface-300" />
                <p className="text-sm text-surface-400">No conversations yet</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none"
                >
                  <Plus size={12} /> Start a Chat
                </button>
              </div>
            ) : filtered.map(conv => {
              const name   = conv.other_user?.first_name || "Vendor";
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
                const name  = selected.other_user?.first_name || "Vendor";
                const email = selected.other_user?.email || "";
                const color = colorFor(name);
                return (
                  <div className="px-5 py-3.5 border-b border-surface-100 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center`}>
                      <span className="text-white text-sm font-bold">{initials(name)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-surface-900">{name}</p>
                      {email && <p className="text-xs text-surface-400">{email}</p>}
                    </div>
                  </div>
                );
              })()}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {msgLoading ? (
                  <div className="flex justify-center py-10 text-sm text-surface-400">Loading messages…</div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <p className="text-sm text-surface-400">Say hello! 👋</p>
                  </div>
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

                {/* Typing indicator */}
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
                  <input
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                    placeholder="Type a message…"
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
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center">
                <MessageSquare size={28} className="text-primary-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-700">Chat with vendors</p>
                <p className="text-xs text-surface-400 mt-1">
                  Select a conversation or start a new one to message a vendor directly.
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 text-sm font-semibold bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors cursor-pointer border-none"
              >
                <Plus size={14} /> Start a Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <NewChatModal
          onClose={() => setShowModal(false)}
          onStarted={handleConversationStarted}
        />
      )}
    </div>
  );
}
