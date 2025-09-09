// frontend/src/pages/dashboard.jsx
import React, { useMemo, useState } from "react";
import "../styles/dashboard.css";

const DUMMY = {
  user: { name: "Alex Johnson", avatar: "/assets/avatar.png" },
  money: {
    totalBalance: 516.0,
    payoutAmount: 1934.0,
    totalEarnings: 2450.0,
  },
  stats: {
    totalService: 3,
    totalJob: 2,
    averageRating: 4.3,
    ratingCount: 6,
    totalOrder: 9,
    completedOrders: 3,
    activeOrders: 0,
    pendingOrders: 6,
  },
  sidebar: [
    { key: "dashboard", label: "Dashboard", icon: "🏠" },
    { key: "orders", label: "Orders", icon: "🧾" },
    { key: "gigs", label: "Gigs", icon: "📦" },
    { key: "myorders", label: "My Orders", icon: "🛒" },
    { key: "jobs", label: "Jobs", icon: "💼" },
    { key: "proposals", label: "My Proposals", icon: "📝" },
    { key: "subscription", label: "Subscription", icon: "🎟️" },
    { key: "messages", label: "Messages", icon: "✉️" },
    { key: "portfolio", label: "Portfolio", icon: "🖼️" },
  ],
};

export default function Dashboard() {
  const [active, setActive] = useState("dashboard");

  const topTiles = useMemo(
    () => [
      {
        label: "Total Balance",
        value: `$${DUMMY.money.totalBalance.toFixed(2)}`,
        icon: "🤝",
      },
      {
        label: "Payout Amount",
        value: `$${DUMMY.money.payoutAmount.toFixed(2)}`,
        icon: "🤝",
      },
      {
        label: "Total Earnings",
        value: `$${DUMMY.money.totalEarnings.toFixed(2)}`,
        icon: "🤝",
      },
    ],
    []
  );

  const miniTiles = useMemo(
    () => [
      { label: "Total Service", value: DUMMY.stats.totalService, icon: "📚" },
      { label: "Total Job", value: DUMMY.stats.totalJob, icon: "🗂️" },
      { label: "Average Rating", value: DUMMY.stats.averageRating, icon: "⭐" },
      { label: "Rating Count", value: DUMMY.stats.ratingCount, icon: "🧪" },
      { label: "Total Order", value: DUMMY.stats.totalOrder, icon: "🛍️" },
      { label: "Completed Orders", value: DUMMY.stats.completedOrders, icon: "📋" },
      { label: "Active Orders", value: DUMMY.stats.activeOrders, icon: "👥" },
      { label: "Pending Orders", value: DUMMY.stats.pendingOrders, icon: "🧑‍🤝‍🧑" },
    ],
    []
  );

  return (
    <div className="dz-wrap">
      {/* Sidebar */}
      <aside className="dz-sidebar">
        <div className="dz-brand">
          <img src="/assets/logo/logo.png" alt="Workzone" />
          <div className="dz-brand-text">
            <span className="dz-brand-title">Work</span>
            <span className="dz-brand-sub">zone</span>
          </div>
        </div>

        <nav className="dz-menu">
          {DUMMY.sidebar.map((item) => (
            <button
              key={item.key}
              className={`dz-menu-item ${
                active === item.key ? "dz-menu-item--active" : ""
              }`}
              onClick={() => setActive(item.key)}
            >
              <span className="dz-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="dz-main">
        <header className="dz-header">
          <div>
            <h1>Dashboard</h1>
            <p className="dz-breadcrumb">Dashboard</p>
          </div>
          <div className="dz-user">
            <button title="Favorites" className="dz-round">♡</button>
            <button title="Inbox" className="dz-round dz-badge">✉️</button>
            <button title="Alerts" className="dz-round">🔔</button>
            <img
              src={DUMMY.user.avatar || "/assets/img/user.png"}
              alt="User avatar"
              className="dz-avatar"
            />
          </div>
        </header>

        {/* Top money tiles */}
        <section className="dz-cards dz-cards--top">
          {topTiles.map((t, i) => (
            <article key={i} className="dz-card dz-card--big">
              <div className="dz-card-body">
                <div className="dz-value">{t.value}</div>
                <div className="dz-label">{t.label}</div>
              </div>
              <div className="dz-card-icon">{t.icon}</div>
            </article>
          ))}
        </section>

        {/* Mini stats grid */}
        <section className="dz-cards dz-cards--mini">
          {miniTiles.map((t, i) => (
            <article key={i} className="dz-card dz-card--mini">
              <div className="dz-mini-value">{t.value}</div>
              <div className="dz-mini-row">
                <div className="dz-mini-label">{t.label}</div>
                <div className="dz-mini-icon">{t.icon}</div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
