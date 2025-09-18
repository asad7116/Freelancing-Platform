import React from "react";
import "../styles/my_proposals.css";
import DashboardSidebar from "./Dashboard_sidebar";

const DUMMY_PROPOSALS = [
  {
    id: "p-1060",
    client: { name: "Matthew Anderson", avatar: "/assets/avatar.png" },
    job: "Senior Full-Stack Developer and UX/UI Designer",
    service: "App icon Design For Android And iOS",
    price: 1060,
    revisions: 7,
    deliveryDays: 15,
    status: "Paid",
  },
  {
    id: "p-0370",
    client: { name: "Matthew Anderson", avatar: "/assets/avatar.png" },
    job: "UI/UX Designer and Front-End Developer",
    service: "Custom Typography Design for your Product",
    price: 370,
    revisions: 1,
    deliveryDays: 10,
    status: "Paid",
  },
];

export default function MyProposals() {
  return (
    <div className="dz-with-shell">
      {/* Shared sidebar + topbar */}
      <DashboardSidebar user={{ name: "Alex", avatar: "/assets/avatar.png" }} />

      {/* Main content, properly shifted */}
      <main className="dz-main dz-shell-main-padding">
        <div className="dz-headerband">
          <h1>My Proposals</h1>
          <p className="dz-breadcrumb">Jobs &gt; My Proposals</p>
        </div>

        <section className="mp-table-wrap">
          <table className="mp-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Job</th>
                <th>Offered Service</th>
                <th>Proposal Price</th>
                <th>Revisions</th>
                <th>Delivery Day</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {DUMMY_PROPOSALS.map((p) => (
                <tr key={p.id}>
                  <td className="mp-client">
                    <img src={p.client.avatar} alt={p.client.name} />
                    <span>{p.client.name}</span>
                  </td>

                  <td>
                    <button className="mp-link" type="button" title={p.job}>
                      {p.job}
                    </button>
                  </td>

                  <td>
                    <button className="mp-link" type="button" title={p.service}>
                      {p.service}
                    </button>
                  </td>

                  <td>${p.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td>{p.revisions}</td>
                  <td>{p.deliveryDays}</td>

                  <td>
                    <span className={`mp-status ${p.status.toLowerCase()}`}>
                      {p.status}
                    </span>
                  </td>

                  <td className="mp-action">
                    <button className="mp-view" title="View">👁</button>
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
