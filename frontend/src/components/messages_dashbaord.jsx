import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../lib/api";
import { MessageSquare, Lock } from "lucide-react";
import "../styles/messages_dashboard.css";
import {
  initializeKeys,
  encryptMessage,
  decryptMessage,
  isE2ESupported,
} from "../lib/crypto";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function MessagesDashboard() {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMsg, setSendingMsg] = useState(false);
  const threadRef = useRef(null);
  const pollRef = useRef(null);

  // ─── E2E Encryption state ──────────────────────────────────
  const [e2eReady, setE2eReady] = useState(false);
  const privateKeyRef = useRef(null);
  const publicKeyJwkRef = useRef(null);
  const userIdRef = useRef(null);
  // Cache of recipient public keys: { recipientId: publicKeyJwk }
  const recipientKeysCache = useRef({});

  // If navigated here with a specific conversationId (e.g. from "Contact Seller"), pre-select it
  const incomingConvId = location.state?.conversationId;

  // ─── E2E Key Initialization ──────────────────────────────────
  useEffect(() => {
    async function setupE2E() {
      if (!isE2ESupported()) {
        console.warn("[E2E] Browser does not support Web Crypto / IndexedDB");
        return;
      }
      try {
        // Get current user ID from a lightweight endpoint
        const meData = await api.get("/api/auth/me");
        const userId = meData.user?.id || meData.user?._id;
        if (!userId) {
          console.warn("[E2E] Could not determine current user ID");
          return;
        }
        userIdRef.current = userId;

        // Initialize (load or generate) RSA key pair
        const { privateKey, publicKeyJwk, isNew } = await initializeKeys();
        privateKeyRef.current = privateKey;
        publicKeyJwkRef.current = publicKeyJwk;

        // If keys are newly generated, upload the public key to the server
        if (isNew) {
          await api.put("/api/keys/public", { publicKey: publicKeyJwk });
          console.log("[E2E] New key pair generated and public key uploaded");
        }

        setE2eReady(true);
        console.log("[E2E] Encryption ready");
      } catch (err) {
        console.error("[E2E] Initialization failed:", err);
      }
    }
    setupE2E();
  }, []);

  // Fetch conversations
  const fetchConversations = useCallback(async (selectFirst = false) => {
    try {
      const data = await api.get("/api/messages/conversations");
      setConversations(data.conversations || []);

      // If we have an incoming conversationId from navigation, select it
      if (incomingConvId && data.conversations?.some((c) => c._id === incomingConvId)) {
        setActiveId(incomingConvId);
      } else if (selectFirst && data.conversations?.length > 0 && !activeId) {
        setActiveId(data.conversations[0]._id);
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [activeId, incomingConvId]);

  // Fetch messages for active conversation (and decrypt if E2E)
  const fetchMessages = useCallback(async () => {
    if (!activeId) return;
    try {
      const data = await api.get(`/api/messages/conversations/${activeId}/messages`);
      const rawMessages = data.messages || [];

      // Decrypt encrypted messages if E2E is ready
      if (e2eReady && privateKeyRef.current && userIdRef.current) {
        const decrypted = await Promise.all(
          rawMessages.map(async (m) => {
            if (m.encrypted && m.encrypted.ciphertext) {
              const plaintext = await decryptMessage(
                m.encrypted,
                privateKeyRef.current,
                userIdRef.current
              );
              return { ...m, text: plaintext, _isEncrypted: true };
            }
            return { ...m, _isEncrypted: false };
          })
        );
        setMessages(decrypted);
      } else {
        setMessages(rawMessages);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  }, [activeId, e2eReady]);

  // Initial load
  useEffect(() => {
    fetchConversations(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When active conversation changes, load its messages
  useEffect(() => {
    if (activeId) {
      fetchMessages();
    }
  }, [activeId, fetchMessages]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!activeId) return;
    pollRef.current = setInterval(() => {
      fetchMessages();
      fetchConversations();
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [activeId, fetchMessages, fetchConversations]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]);

  const activeConv = conversations.find((c) => c._id === activeId);

  const filtered = conversations.filter((c) =>
    c.otherUser?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Helper: get the other participant's public key for a conversation
  const getRecipientPublicKeys = useCallback(async (conv) => {
    if (!conv || !userIdRef.current) return {};
    const otherId = conv.otherUser?.id;
    if (!otherId) return {};

    // Check cache first
    if (recipientKeysCache.current[otherId]) {
      return { [otherId]: recipientKeysCache.current[otherId] };
    }

    try {
      const data = await api.get(`/api/keys/public/${otherId}`);
      if (data.publicKey) {
        recipientKeysCache.current[otherId] = data.publicKey;
        return { [otherId]: data.publicKey };
      }
    } catch {
      // Recipient has no public key — fall back to plaintext
    }
    return {};
  }, []);

  const sendMessage = async () => {
    if (!draft.trim() || !activeId || sendingMsg) return;
    const text = draft.trim();
    setDraft("");
    setSendingMsg(true);

    // Optimistic update
    const optimisticMsg = {
      _id: `temp-${Date.now()}`,
      from: "me",
      text,
      _isEncrypted: e2eReady,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      let payload;

      // Attempt E2E encryption if ready
      if (e2eReady && activeConv) {
        const recipientKeys = await getRecipientPublicKeys(activeConv);
        const hasRecipientKey = Object.keys(recipientKeys).length > 0;

        if (hasRecipientKey && publicKeyJwkRef.current && userIdRef.current) {
          const encrypted = await encryptMessage(
            text,
            recipientKeys,
            publicKeyJwkRef.current,
            userIdRef.current
          );
          payload = { encrypted };
        } else {
          // Recipient hasn't set up E2E yet — send plaintext
          payload = { text };
        }
      } else {
        payload = { text };
      }

      const data = await api.post(
        `/api/messages/conversations/${activeId}/messages`,
        payload
      );

      // Replace optimistic message with real one (decrypt it for display)
      let displayMsg = data.message;
      if (displayMsg.encrypted && e2eReady && privateKeyRef.current && userIdRef.current) {
        const plaintext = await decryptMessage(
          displayMsg.encrypted,
          privateKeyRef.current,
          userIdRef.current
        );
        displayMsg = { ...displayMsg, text: plaintext, _isEncrypted: true };
      }

      setMessages((prev) =>
        prev.map((m) => (m._id === optimisticMsg._id ? displayMsg : m))
      );

      // Update conversation list preview
      setConversations((prev) =>
        prev.map((c) =>
          c._id === activeId
            ? { ...c, last_message: payload.encrypted ? "🔒 Encrypted message" : text, last_message_at: new Date().toISOString() }
            : c
        )
      );
    } catch (err) {
      console.error("Failed to send message:", err);
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m._id !== optimisticMsg._id));
      setDraft(text); // restore draft
    } finally {
      setSendingMsg(false);
    }
  };

  // ─── Empty state ──────────────────────────────────────────
  if (!loading && conversations.length === 0) {
    return (
      <div className="dz-with-shell">
        <main className="dz-main dz-shell-main-padding">
          <div className="dz-headerband">
            <h1>Messages</h1>
            <p className="dz-breadcrumb">Dashboard &gt; Messages</p>
          </div>
          <div className="mg-empty-state">
            <MessageSquare size={48} strokeWidth={1.5} />
            <h3>No conversations yet</h3>
            <p>
              Conversations are created automatically when a client accepts a
              proposal. Check back later!
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dz-with-shell">
      <main className="dz-main dz-shell-main-padding">
        {/* Title */}
        <div className="dz-headerband">
          <h1>Messages</h1>
          <p className="dz-breadcrumb">Dashboard &gt; Messages</p>
        </div>

        <div className="mg-layout">
          {/* LEFT – conversations list */}
          <aside className="mg-list">
            <div className="mg-search">
              <input
                type="text"
                placeholder="Search User"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <ul className="mg-items">
              {filtered.map((c) => (
                <li
                  key={c._id}
                  className={`mg-item ${c._id === activeId ? "mg-item--active" : ""}`}
                  onClick={() => setActiveId(c._id)}
                >
                  <div className="mg-avatar-placeholder">
                    {c.otherUser?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="mg-item-body">
                    <div className="mg-row">
                      <span className="mg-name">{c.otherUser?.name || "User"}</span>
                      <span className="mg-when">{timeAgo(c.last_message_at)}</span>
                    </div>
                    <div className="mg-last">
                      {c.last_message || (
                        <em style={{ opacity: 0.5 }}>No messages yet</em>
                      )}
                    </div>
                    {c.job_title && (
                      <div className="mg-job-tag">{c.job_title}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          {/* RIGHT – chat area */}
          <section className="mg-chat">
            {activeConv ? (
              <>
                <header className="mg-chat-head">
                  <div className="mg-chat-user">
                    <div className="mg-avatar-placeholder mg-avatar-lg">
                      {activeConv.otherUser?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="mg-chat-name">
                        {activeConv.otherUser?.name || "User"}
                      </div>
                      {activeConv.job_title && (
                        <div className="mg-chat-sub">
                          {activeConv.job_title}
                        </div>
                      )}
                    </div>
                  </div>
                  {e2eReady && (
                    <div className="mg-e2e-badge" title="Messages are end-to-end encrypted">
                      <Lock size={14} />
                      <span>Encrypted</span>
                    </div>
                  )}
                </header>

                <div className="mg-thread" ref={threadRef}>
                  {messages.length === 0 ? (
                    <div className="mg-no-messages">
                      <p>No messages yet. Say hi! 👋</p>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m._id}
                        className={`mg-msg ${
                          m.from === "me" ? "mg-msg--me" : "mg-msg--them"
                        }`}
                      >
                        <div className="mg-bubble">
                          {m.text}
                          {m._isEncrypted && (
                            <Lock size={12} className="mg-lock-icon" title="End-to-end encrypted" />
                          )}
                        </div>
                        <div className="mg-time">{timeAgo(m.created_at)}</div>
                      </div>
                    ))
                  )}
                </div>

                <footer className="mg-compose">
                  <input
                    type="text"
                    placeholder="Write a message…"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <button
                    className="mg-send"
                    onClick={sendMessage}
                    disabled={sendingMsg}
                  >
                    Send
                  </button>
                </footer>
              </>
            ) : (
              <div className="mg-select-chat">
                <MessageSquare size={36} strokeWidth={1.5} />
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
