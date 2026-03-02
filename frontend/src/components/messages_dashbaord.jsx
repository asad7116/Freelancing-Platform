import React, { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../lib/api";
import { MessageSquare } from "lucide-react";
import "../styles/messages_dashboard.css";

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
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMsg, setSendingMsg] = useState(false);
  const threadRef = useRef(null);
  const pollRef = useRef(null);

  // Fetch conversations
  const fetchConversations = useCallback(async (selectFirst = false) => {
    try {
      const data = await api.get("/api/messages/conversations");
      setConversations(data.conversations || []);
      if (selectFirst && data.conversations?.length > 0 && !activeId) {
        setActiveId(data.conversations[0]._id);
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async () => {
    if (!activeId) return;
    try {
      const data = await api.get(`/api/messages/conversations/${activeId}/messages`);
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  }, [activeId]);

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
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const data = await api.post(`/api/messages/conversations/${activeId}/messages`, { text });

      // Replace optimistic message with real one
      setMessages((prev) =>
        prev.map((m) => (m._id === optimisticMsg._id ? data.message : m))
      );

      // Update conversation list preview
      setConversations((prev) =>
        prev.map((c) =>
          c._id === activeId
            ? { ...c, last_message: text, last_message_at: new Date().toISOString() }
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
                        <div className="mg-bubble">{m.text}</div>
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
