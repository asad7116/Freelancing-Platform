import React from "react";
import "../styles/my_orders_dash.css";
import DashboardSidebar from "./Dashboard_sidebar";

const myOrders = [
  { id: "#2338", product: "Premium", image: "/assets/logo/logo.png", type: "Subscription", time: "July 26, 2024", amount: "$99.00", status: "Pending" },
  { id: "#2337", product: "Professional", image: "/assets/logo/logo.png", type: "Subscription", time: "July 26, 2024", amount: "$55.00", status: "Pending" },
  { id: "#2336", product: "Professional", image: "/assets/logo/logo.png", type: "Subscription", time: "July 26, 2024", amount: "$70.00", status: "Pending" },
  { id: "#2269", product: "Premium", image: "/assets/logo/logo.png", type: "Subscription", time: "July 24, 2024", amount: "$99.00", status: "Pending" },
  { id: "#2268", product: "Professional", image: "/assets/logo/logo.png", type: "Subscription", time: "July 24, 2024", amount: "$55.00", status: "Pending" },
  { id: "#2264", product: "Book Cover Designing Service", image: "/assets/homepage/service1.png", type: "Job", time: "July 24, 2024", amount: "$550.00", status: "Completed" },
  { id: "#2263", product: "Book Cover Designing Service", image: "/assets/homepage/service2.jpg", type: "Job", time: "July 24, 2024", amount: "$345.00", status: "Completed" },
];

export default function MyOrdersDash() {
  return (
    <div>
      <DashboardSidebar />

      {/* NOTE: dz-content keeps this clear of sidebar/topbar */}
      <main className="dz-content mod-main">
        <header className="mod-header">
          <h1>My Orders</h1>
          <div className="mod-user-icons">
            <button className="mod-round" title="Favorites">♡</button>
            <button className="mod-round mod-badge" title="Inbox">✉️</button>
            <button className="mod-round" title="Alerts">🔔</button>
            <img src="/assets/avatar.png" alt="User" className="mod-avatar" />
          </div>
        </header>

        <section className="mod-container">
          <table className="mod-table">
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
              {myOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td className="mod-product-cell">
                    <img src={order.image} alt={order.product} />
                    <span className="mod-product-name">{order.product}</span>
                  </td>
                  <td>{order.type}</td>
                  <td>{order.time}</td>
                  <td>{order.amount}</td>
                  <td>
                    <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span>
                  </td>
                  <td className="mod-action-cell">
                    <button className="view-btn" title="View">👁</button>
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
