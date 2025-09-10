import React from "react";
import DashboardSidebar from "../components/Dashboard_sidebar";
import "../styles/orders_dashboard.css"; // table styles only

const dummyOrders = [
  { id: "#2266", product: "App icon Design For Android And iOS", image: "/assets/img/order1.png", type: "Job", time: "July 24, 2024", amount: "$1,060.00", status: "Pending" },
  { id: "#2265", product: "Custom Typography Design for your Product", image: "/assets/img/order2.png", type: "Job", time: "July 24, 2024", amount: "$370.00", status: "Pending" },
  { id: "#2260", product: "Custom Typography Design for your Product", image: "/assets/img/order2.png", type: "Gig",  time: "July 24, 2024", amount: "$320.00", status: "Completed" },
  { id: "#2259", product: "Custom Typography Design for your Product", image: "/assets/img/order2.png", type: "Gig",  time: "July 24, 2024", amount: "$120.00", status: "Completed" },
  { id: "#2258", product: "Custom Typography Design for your Product", image: "/assets/img/order2.png", type: "Gig",  time: "July 24, 2024", amount: "$790.00", status: "Completed" },
  { id: "#2257", product: "Instagram Reel Marketing for Your Niche",   image: "/assets/img/order3.png", type: "Gig",  time: "July 24, 2024", amount: "$210.00", status: "Revision" },
];

export default function Orders() {
  return (
    <div className="dz-with-shell">
      {/* Fixed sidebar + topbar (shared) */}
      <DashboardSidebar user={{ name: "Alex", avatar: "/assets/avatar.png" }} />

      {/* Main content area shifted by sidebar & topbar */}
      <main className="dz-main dz-shell-main-padding">
        {/* Title band to match your screenshot */}
        <div className="dz-headerband">
          <h1>Orders</h1>
          <p className="dz-breadcrumb">Dashboard &gt; Orders</p>
        </div>

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
                    <span className={`status ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
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
