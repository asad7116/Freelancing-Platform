import React from "react";
import DashboardSidebar from "../components/Dashboard_sidebar";
import "../styles/subscription_dash.css"; // table styles only

const dummySubscriptions = [
  { id: 1, plan: "Premium",      type: "yearly",  price: "$99.00",  expiry: "2024", status: "Active", image: "/assets/img/order1.png" },
  { id: 2, plan: "Professional", type: "monthly", price: "$55.00",  expiry: "2024", status: "Active", image: "/assets/img/order2.png" },
  { id: 3, plan: "Professional", type: "yearly",  price: "$70.00",  expiry: "2024", status: "Active", image: "/assets/img/order2.png" },
  { id: 4, plan: "Premium",      type: "monthly", price: "$99.00",  expiry: "2024", status: "Active", image: "/assets/img/order1.png" },
];

export default function SubscriptionDash() {
  return (
    <div className="dz-with-shell">
      {/* Sidebar & topbar */}
      {/* <DashboardSidebar user={{ name: "Alex", avatar: "/assets/avatar.png" }} /> */}

      {/* Main content area */}
      <main className="dz-main dz-shell-main-padding">
        {/* Title band */}
        <div className="dz-headerband">
          <h1>Subscription</h1>
          <p className="dz-breadcrumb">Dashboard &gt; Subscription</p>
        </div>

        {/* Subscription Table */}
        <section className="subscription-container">
          <table className="subscription-table">
            <thead>
              <tr>
                <th>Subscription Plan</th>
                <th>Type</th>
                <th>Price</th>
                <th>Expired On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dummySubscriptions.map((sub) => (
                <tr key={sub.id}>
                  <td className="plan-cell">
                    <img src={sub.image} alt={sub.plan} />
                    <span className="plan-name">{sub.plan}</span>
                  </td>
                  <td>{sub.type}</td>
                  <td>{sub.price}</td>
                  <td>{sub.expiry}</td>
                  <td>
                    <span className={`status ${sub.status.toLowerCase()}`}>
                      {sub.status}
                    </span>
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
