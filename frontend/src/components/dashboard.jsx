import React, { useEffect, useMemo, useState } from "react";
import "../styles/dashboard.css";

// Live, DB-driven dashboard (client)
export default function Dashboard({ role = "client" }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // fetch live stats from your backend
  useEffect(() => {
    let alive = true;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      try {
        // Use the appropriate endpoint based on role
        const endpoint = role === "freelancer" ? "/api/freelancer/dashboard" : "/api/client/dashboard";
        // Add timestamp to prevent caching
        const url = `${endpoint}?t=${Date.now()}`;
        console.log("🔄 Fetching dashboard from:", url);
        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: { 
            "Cache-Control": "no-store, no-cache, must-revalidate",
            "Pragma": "no-cache",
          },
          signal: controller.signal,
        });
        console.log("📡 Response status:", res.status);
        if (!res.ok) {
          const errorText = await res.text();
          console.error("❌ Error response:", errorText);
          throw new Error(`Dashboard fetch failed: ${res.status}`);
        }
        const data = await res.json();
        console.log("📊 Dashboard data received:", data);
        if (alive) setStats(data);
      } catch (e) {
        if (alive) setStats(null);
        console.error("💥 Fetch error:", e);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [role, refreshKey]);

  // fallback shape (same keys as backend)
  const S = stats || {
    balance: 0,
    payoutAmount: 0,
    totalEarnings: 0,
    totalService: 0,
    totalJob: 0,
    totalGig: 0,
    averageRating: 0,
    ratingCount: 0,
    totalOrder: 0,
    completedOrders: 0,
    activeOrders: 0,
    pendingOrders: 0,
  };

  // Use totalGig for freelancers, totalJob for clients
  const jobOrGigCount = role === "freelancer" ? (S.totalGig || 0) : (S.totalJob || 0);

  // Top tiles: hide balance/payout/earnings for clients
  const topTiles = useMemo(() => {
    if (role === "client") {
      return [
        { label: "Total Service", value: S.totalService, icon: "📚" },
        { label: "Total Job", value: jobOrGigCount, icon: "🗂️" },
        { label: "Average Rating", value: S.averageRating, icon: "⭐" },
      ];
    } else {
      // freelancer or other roles — show all
      return [
        { label: "Total Balance", value: `$${Number(S.balance).toFixed(2)}`, icon: "🤝" },
        { label: "Payout Amount", value: `$${Number(S.payoutAmount).toFixed(2)}`, icon: "💸" },
        { label: "Total Earnings", value: `$${Number(S.totalEarnings).toFixed(2)}`, icon: "🧾" },
      ];
    }
  }, [role, S.balance, S.payoutAmount, S.totalEarnings, S.totalService, jobOrGigCount, S.averageRating]);

  // miniTiles: change label for freelancer from "Total Job" -> "Total Gig"
  const miniTiles = useMemo(
    () => [
      { label: "Total Service", value: S.totalService, icon: "📚" },
      { label: role === "freelancer" ? "Total Gig" : "Total Job", value: jobOrGigCount, icon: "🗂️" },
      { label: "Average Rating", value: S.averageRating, icon: "⭐" },
      { label: "Rating Count", value: S.ratingCount, icon: "🧪" },
      { label: "Total Order", value: S.totalOrder, icon: "🛍️" },
      { label: "Completed Orders", value: S.completedOrders, icon: "📋" },
      { label: "Active Orders", value: S.activeOrders, icon: "👥" },
      { label: "Pending Orders", value: S.pendingOrders, icon: "🧑‍🤝‍🧑" },
    ],
    [role, S.totalService, jobOrGigCount, S.averageRating, S.ratingCount, S.totalOrder, S.completedOrders, S.activeOrders, S.pendingOrders]
  );

  return (
    <div className="dz-with-shell">
      <main className="dz-main dz-shell-main-padding">
        <div className="dz-headerband">
          <h1>Dashboard</h1>
          <p className="dz-breadcrumb">Dashboard</p>
          <button 
            onClick={() => setRefreshKey(k => k + 1)}
            style={{
              padding: "8px 16px",
              marginLeft: "16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 16 }}>Loading dashboard…</div>
        ) : (
          <>
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
          </>
        )}
      </main>
    </div>
  );
}
