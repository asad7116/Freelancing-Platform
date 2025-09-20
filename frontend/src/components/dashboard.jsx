import React, { useMemo } from "react";
import "../styles/dashboard.css";

const DUMMY = {
  user: { name: "Alex Johnson", avatar: "/assets/avatar.png" },
  money: { totalBalance: 516.0, payoutAmount: 1934.0, totalEarnings: 2450.0 },
  stats: {
    totalService: 3, totalJob: 2, averageRating: 4.3, ratingCount: 6,
    totalOrder: 9, completedOrders: 3, activeOrders: 0, pendingOrders: 6,
  },
};

export default function Dashboard() {
  const topTiles = useMemo(() => ([
    { label: "Total Balance",  value: `$${DUMMY.money.totalBalance.toFixed(2)}`,  icon: "🤝" },
    { label: "Payout Amount",  value: `$${DUMMY.money.payoutAmount.toFixed(2)}`, icon: "🤝" },
    { label: "Total Earnings", value: `$${DUMMY.money.totalEarnings.toFixed(2)}`, icon: "🤝" },
  ]), []);

  const miniTiles = useMemo(() => ([
    { label: "Total Service",     value: DUMMY.stats.totalService,     icon: "📚" },
    { label: "Total Job",         value: DUMMY.stats.totalJob,         icon: "🗂️" },
    { label: "Average Rating",    value: DUMMY.stats.averageRating,    icon: "⭐" },
    { label: "Rating Count",      value: DUMMY.stats.ratingCount,      icon: "🧪" },
    { label: "Total Order",       value: DUMMY.stats.totalOrder,       icon: "🛍️" },
    { label: "Completed Orders",  value: DUMMY.stats.completedOrders,  icon: "📋" },
    { label: "Active Orders",     value: DUMMY.stats.activeOrders,     icon: "👥" },
    { label: "Pending Orders",    value: DUMMY.stats.pendingOrders,    icon: "🧑‍🤝‍🧑" },
  ]), []);

  return (
    <div className="dz-with-shell">

      <main className="dz-main dz-shell-main-padding">
        {/* header band like your screenshot */}
        <div className="dz-headerband">
          <h1>Dashboard</h1>
          <p className="dz-breadcrumb">Dashboard</p>
        </div>

        {/* Top tiles */}
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

        {/* Mini stats */}
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
