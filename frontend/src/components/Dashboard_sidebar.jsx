import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/dashboard_sidebar.css";

const sidebarItems = [
  { key: "dashboard",   label: "Dashboard",    icon: "🏠", path: "/dashboard" },
  { key: "orders",      label: "Orders",       icon: "🧾", path: "/dashboard/orders" },
  { key: "gigs",        label: "Gigs",         icon: "📦", path: "/dashboard/gigs" },
  { key: "myorders",    label: "My Orders",    icon: "🛒", path: "/dashboard/my-orders" },
  // ✅ Updated to route to My Jobs page
  { key: "jobs",        label: "Jobs",         icon: "💼", path: "/dashboard/my-jobs" },
  { key: "proposals",   label: "My Proposals", icon: "📝", path: "/dashboard/my-proposals" },
  { key: "subscription",label: "Subscription", icon: "🎟️", path: "/dashboard/subscription" },
  { key: "messages",    label: "Messages",     icon: "✉️", path: "/dashboard/messages" },
  { key: "portfolio",   label: "Portfolio",    icon: "🖼️", path: "/dashboard/portfolio" },
];

export default function DashboardSidebar({ user = { name: "Alex", avatar: "/assets/avatar.png" } }) {
  const location = useLocation();
  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <>
      {/* Fixed left sidebar */}
      <aside className="dz-sidebar">
        <div className="dz-brand">
          <img src="/assets/logo/logo.png" alt="Workzone" />
          <div className="dz-brand-text">
            <span className="dz-brand-title">Work</span>
            <span className="dz-brand-sub">zone</span>
          </div>
        </div>

        <nav className="dz-menu">
          {sidebarItems.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`dz-menu-item ${
                isActive(item.path) ? "dz-menu-item--active" : ""
              }`}
            >
              <span className="dz-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Fixed topbar */}
      <div className="dz-topbar">
        <div className="dz-topbar-right">
          <button className="dz-topbtn" title="Favorites">♡</button>
          <button className="dz-topbtn dz-badge" title="Inbox">✉️</button>
          <button className="dz-topbtn" title="Alerts">🔔</button>
          <div className="dz-topuser">
            <img src={user.avatar} alt={user.name} />
            <span className="dz-topname">{user.name}</span>
          </div>
        </div>
      </div>
    </>
  );
}
