import React, { useState } from "react";
import DashboardSidebar from "../components/Dashboard_sidebar";
import "../styles/messages_dashboard.css";

const THREADS = [
  {
    id: "u1",
    name: "William Miller",
    avatar: "/assets/homepage/user1.jpg",
    last: "Hi",
    when: "3 weeks ago",
    messages: [
      { id: 1, from: "them", text: "Hello", at: "3 weeks ago" },
      { id: 2, from: "them", text: "Any progress?", at: "3 weeks ago" },
      { id: 3, from: "them", text: "Thank you", at: "3 weeks ago" },
      { id: 4, from: "me", text: "How are you?", at: "3 weeks ago" },
      { id: 5, from: "me", text: "Almost Ready", at: "3 weeks ago" },
      { id: 6, from: "me", text: "You are most welcome!", at: "3 weeks ago" },
    ],
  },
  {
    id: "u2",
    name: "James Thompson",
    avatar: "/assets/homepage/user2.jpg",
    last: "I hope you’re doing well..",
    when: "2 weeks ago",
    messages: [
      { id: 1, from: "them", text: "Hey, quick question about the brief." },
      { id: 2, from: "me", text: "Sure, send it over!" },
    ],
  },
  {
    id: "u3",
    name: "Jessica Lee",
    avatar: "/assets/homepage/user3.jpg",
    last: "Great to hear back!",
    when: "2 weeks ago",
    messages: [{ id: 1, from: "them", text: "Great to hear back!" }],
  },
  {
    id: "u4",
    name: "John Smith",
    avatar: "/assets/homepage/user4.jpg",
    last: "I’ve attached some refs..",
    when: "2 weeks ago",
    messages: [{ id: 1, from: "them", text: "I’ve attached some references." }],
  },
  {
    id: "u5",
    name: "Lily Turner",
    avatar: "/assets/homepage/user5.jpg",
    last: "Thanks for sending the files!",
    when: "2 weeks ago",
    messages: [{ id: 1, from: "them", text: "Thanks for sending the files!" }],
  },
];

export default function MessagesDashboard() {
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState(THREADS[0].id);
  const [threads, setThreads] = useState(THREADS);

  const active = threads.find((t) => t.id === activeId);

  const filtered = threads.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const [draft, setDraft] = useState("");

  const sendMessage = () => {
    if (!draft.trim()) return;

    const newMsg = {
      id: Date.now(),
      from: "me",
      text: draft,
      at: "just now",
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeId
          ? {
              ...t,
              messages: [...t.messages, newMsg],
              last: draft,
              when: "just now",
            }
          : t
      )
    );

    setDraft("");
  };

  return (
    <div className="dz-with-shell">
      {/* <DashboardSidebar user={{ name: "Alex", avatar: "/assets/avatar.png" }} /> */}

      <main className="dz-main dz-shell-main-padding">
        {/* Title */}
        <div className="dz-headerband">
          <h1>Message</h1>
          <p className="dz-breadcrumb">Dashboard &gt; Message</p>
        </div>

        <div className="mg-layout">
          {/* LEFT – threads list */}
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
              {filtered.map((t) => (
                <li
                  key={t.id}
                  className={`mg-item ${
                    t.id === activeId ? "mg-item--active" : ""
                  }`}
                  onClick={() => setActiveId(t.id)}
                >
                  <img className="mg-avatar" src={t.avatar} alt={t.name} />
                  <div className="mg-item-body">
                    <div className="mg-row">
                      <span className="mg-name">{t.name}</span>
                      <span className="mg-when">{t.when}</span>
                    </div>
                    <div className="mg-last">{t.last}</div>
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          {/* RIGHT – chat area */}
          <section className="mg-chat">
            <header className="mg-chat-head">
              <div className="mg-chat-user">
                <img src={active.avatar} alt={active.name} />
                <div>
                  <div className="mg-chat-name">{active.name}</div>
                  <div className="mg-chat-sub">Last active: {active.when}</div>
                </div>
              </div>
              <button className="mg-profile-btn">View Profile</button>
            </header>

            <div className="mg-thread">
              {active.messages.map((m) => (
                <div
                  key={m.id}
                  className={`mg-msg ${
                    m.from === "me" ? "mg-msg--me" : "mg-msg--them"
                  }`}
                >
                  <div className="mg-bubble">{m.text}</div>
                  <div className="mg-time">{m.at}</div>
                </div>
              ))}
            </div>

            <footer className="mg-compose">
              <input
                type="text"
                placeholder="Write a message…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button className="mg-send" onClick={sendMessage}>
                Send
              </button>
            </footer>
          </section>
        </div>
      </main>
    </div>
  );
}
