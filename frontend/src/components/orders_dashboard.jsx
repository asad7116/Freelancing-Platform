import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/orders_dashboard.css";

const dummyOrders = [
  { id: "#2266", product: "App icon Design For Android And iOS", image: "/assets/img/order1.png", type: "Job", time: "July 24, 2024", amount: "$1,060.00", status: "Pending" },
  { id: "#2265", product: "Custom Typography Design for your Product", image: "/assets/img/order2.png", type: "Job", time: "July 24, 2024", amount: "$370.00", status: "Pending" },
  { id: "#2260", product: "Custom Typography Design for your Product", image: "/assets/img/order2.png", type: "Gig", time: "July 24, 2024", amount: "$320.00", status: "Completed" },
  { id: "#2259", product: "Custom Typography Design for your Product", image: "/assets/img/order2.png", type: "Gig", time: "July 24, 2024", amount: "$120.00", status: "Completed" },
  { id: "#2258", product: "Custom Typography Design for your Product", image: "/assets/img/order2.png", type: "Gig", time: "July 24, 2024", amount: "$790.00", status: "Completed" },
  { id: "#2257", product: "Instagram Reel Marketing for Your Niche", image: "/assets/img/order3.png", type: "Gig", time: "July 24, 2024", amount: "$210.00", status: "Revision" },
];

const SIDEBAR = [
  { key: "dashboard", label: "Dashboard", icon: "🏠", path: "/dashboard" },
  { key: "orders", label: "Orders", icon: "🧾", path: "/dashboard/orders" }, // active
  { key: "gigs", label: "Gigs", icon: "📦", path: "/dashboard/gigs" },
  { key: "myorders", label: "My Orders", icon: "🛒", path: "/dashboard/my-orders" },
  { key: "jobs", label: "Jobs", icon: "💼", path: "/dashboard/jobs" },
  { key: "proposals", label: "My Proposals", icon: "📝", path: "/dashboard/proposals" },
  { key: "subscription", label: "Subscription", icon: "🎟️", path: "/dashboard/subscription" },
  { key: "messages", label: "Messages", icon: "✉️", path: "/dashboard/messages" },
  { key: "portfolio", label: "Portfolio", icon: "🖼️", path: "/dashboard/portfolio" },
];

export default function Orders() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="od-wrap">
      {/* Sidebar */}
      <aside className="od-sidebar">
        <div className="od-brand">
          <img src="/assets/logo/logo.png" alt="Workzone" />
          <div className="od-brand-text">
            <span className="od-brand-title">Work</span>
            <span className="od-brand-sub">zone</span>
          </div>
        </div>

        <nav className="od-menu">
          {SIDEBAR.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`od-menu-item ${isActive(item.path) ? "od-menu-item--active" : ""}`}
            >
              <span className="od-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="od-main">
        <header className="od-header">
          <h1>Orders</h1>
          <div className="od-user-icons">
            <button className="od-round">♡</button>
            <button className="od-round od-badge">✉️</button>
            <button className="od-round">🔔</button>
            <img src="/assets/avatar.png" alt="User" className="od-avatar" />
          </div>
        </header>

        <section className="orders-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order No</th>
                <th>Product</th>
                <th>Type</th>
                <th>Time</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dummyOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td className="product-cell">
                    <img src={order.image} alt={order.product} />
                    <span className="product-name">{order.product}</span>
                  </td>
                  <td>{order.type}</td>
                  <td>{order.time}</td>
                  <td>{order.amount}</td>
                  <td>
                    <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span>
                  </td>
                  <td className="action-cell">
                    <button className="view-btn" title="View">👁</button>
                    <button className="check-btn" title="Approve">✔</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
