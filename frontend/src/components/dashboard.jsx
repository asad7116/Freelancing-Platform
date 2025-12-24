import React, { useEffect, useMemo, useState } from "react";
import {
  DollarSign,
  Wallet,
  TrendingUp,
  BookOpen,
  Briefcase,
  Star,
  FlaskConical,
  ShoppingBag,
  ClipboardCheck,
  Users,
  Clock,
  RefreshCw
} from "lucide-react";
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
        const endpoint = role === "freelancer" ? "/api/freelancer/dashboard" : "/api/client/dashboard";
        const url = `${endpoint}?t=${Date.now()}`;
        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
            "Pragma": "no-cache",
          },
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`Dashboard fetch failed: ${res.status}`);
        }
        const data = await res.json();
        if (alive) setStats(data);
      } catch (e) {
        if (alive) setStats(null);
        console.error("Fetch error:", e);
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

  const jobOrGigCount = role === "freelancer" ? (S.totalGig || 0) : (S.totalJob || 0);

  // Top tiles with lucide icons
  const topTiles = useMemo(() => {
    if (role === "client") {
      return [
        { label: "Total Service", value: S.totalService, icon: BookOpen },
        { label: "Total Job", value: jobOrGigCount, icon: Briefcase },
        { label: "Average Rating", value: S.averageRating, icon: Star },
      ];
    } else {
      return [
        { label: "Total Balance", value: `$${Number(S.balance).toFixed(2)}`, icon: Wallet },
        { label: "Payout Amount", value: `$${Number(S.payoutAmount).toFixed(2)}`, icon: DollarSign },
        { label: "Total Earnings", value: `$${Number(S.totalEarnings).toFixed(2)}`, icon: TrendingUp },
      ];
    }
  }, [role, S.balance, S.payoutAmount, S.totalEarnings, S.totalService, jobOrGigCount, S.averageRating]);

  // miniTiles with lucide icons
  const miniTiles = useMemo(
    () => [
      { label: "Total Service", value: S.totalService, icon: BookOpen },
      { label: role === "freelancer" ? "Total Gig" : "Total Job", value: jobOrGigCount, icon: Briefcase },
      { label: "Average Rating", value: S.averageRating, icon: Star },
      { label: "Rating Count", value: S.ratingCount, icon: FlaskConical },
      { label: "Total Order", value: S.totalOrder, icon: ShoppingBag },
      { label: "Completed Orders", value: S.completedOrders, icon: ClipboardCheck },
      { label: "Active Orders", value: S.activeOrders, icon: Users },
      { label: "Pending Orders", value: S.pendingOrders, icon: Clock },
    ],
    [role, S.totalService, jobOrGigCount, S.averageRating, S.ratingCount, S.totalOrder, S.completedOrders, S.activeOrders, S.pendingOrders]
  );

  return (
    <div className="dz-with-shell">
      <main className="dz-main dz-shell-main-padding">
        <div className="dz-headerband">
          <h1>Dashboard</h1>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="dz-refresh-btn"
            title="Refresh dashboard"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="dz-loading">Loading dashboard…</div>
        ) : (
          <>
            <section className="dz-cards dz-cards--top">
              {topTiles.map((t, i) => (
                <article key={i} className="dz-card dz-card--big">
                  <div className="dz-card-body">
                    <div className="dz-value">{t.value}</div>
                    <div className="dz-label">{t.label}</div>
                  </div>
                  <div className="dz-card-icon">
                    <t.icon size={32} />
                  </div>
                </article>
              ))}
            </section>

            <section className="dz-cards dz-cards--mini">
              {miniTiles.map((t, i) => (
                <article key={i} className="dz-card dz-card--mini">
                  <div className="dz-mini-value">{t.value}</div>
                  <div className="dz-mini-row">
                    <div className="dz-mini-label">{t.label}</div>
                    <div className="dz-mini-icon">
                      <t.icon size={20} />
                    </div>
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
