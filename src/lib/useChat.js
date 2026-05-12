"use client";
import { useEffect, useRef, useCallback, useState } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
// Derive WebSocket URL: http→ws, https→wss
const WS_ENDPOINT = BASE_URL.replace(/^http/, "ws") + "/ws";

/**
 * useChat — WebSocket hook for real-time chat.
 *
 * Connects automatically on mount, reconnects with exponential back-off on
 * disconnect, and exposes helpers to send WS frames.
 *
 * Callbacks (onNewMessage, onTyping, onRead) are kept in a ref so callers can
 * pass fresh closure values each render without restarting the socket.
 *
 * @param {object} opts
 * @param {(msg: WSOutgoingMsg) => void} [opts.onNewMessage]
 * @param {(msg: WSOutgoingMsg) => void} [opts.onTyping]
 * @param {(msg: WSOutgoingMsg) => void} [opts.onRead]
 */
export function useChat({ onNewMessage, onTyping, onRead } = {}) {
  const wsRef     = useRef(null);
  const timerRef  = useRef(null);
  const retryRef  = useRef(0);
  const activeRef = useRef(true); // false after unmount → stop reconnecting
  const [connected, setConnected] = useState(false);

  // Keep callbacks current without restarting the socket
  const cbRef = useRef({ onNewMessage, onTyping, onRead });
  useEffect(() => {
    cbRef.current = { onNewMessage, onTyping, onRead };
  });

  const connect = useCallback(() => {
    if (typeof window === "undefined" || !activeRef.current) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    const ws = new WebSocket(`${WS_ENDPOINT}?token=${encodeURIComponent(token)}`);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!activeRef.current) { ws.close(); return; }
      setConnected(true);
      retryRef.current = 0;
    };

    ws.onmessage = ({ data }) => {
      try {
        const msg = JSON.parse(data);
        switch (msg.type) {
          case "new_message": cbRef.current.onNewMessage?.(msg); break;
          case "typing":      cbRef.current.onTyping?.(msg);      break;
          case "read":        cbRef.current.onRead?.(msg);         break;
        }
      } catch {}
    };

    ws.onclose = () => {
      setConnected(false);
      if (!activeRef.current) return;
      // Exponential back-off: 500ms, 1s, 2s, 4s … capped at 30s
      const delay = Math.min(500 * 2 ** retryRef.current, 30000);
      retryRef.current += 1;
      timerRef.current = setTimeout(connect, delay);
    };

    ws.onerror = () => ws.close();
  }, []); // intentionally stable — no deps

  useEffect(() => {
    activeRef.current = true;
    connect();
    return () => {
      activeRef.current = false;
      clearTimeout(timerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  // ── Senders ────────────────────────────────────────────────────────────────

  const _send = useCallback((payload) => {
    const ws = wsRef.current;
    if (ws?.readyState !== WebSocket.OPEN) return false;
    ws.send(JSON.stringify(payload));
    return true;
  }, []);

  /** Send a chat message via WS. Returns false if disconnected (caller should fall back to REST). */
  const sendMessage = useCallback((conversationId, body) =>
    _send({ type: "message", conversation_id: conversationId, body }),
  [_send]);

  /** Emit a typing indicator. */
  const sendTyping = useCallback((conversationId) =>
    _send({ type: "typing", conversation_id: conversationId }),
  [_send]);

  /** Mark a conversation as read. */
  const sendRead = useCallback((conversationId) =>
    _send({ type: "read", conversation_id: conversationId }),
  [_send]);

  return { connected, sendMessage, sendTyping, sendRead };
}
