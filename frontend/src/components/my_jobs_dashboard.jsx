import React from "react";
import DashboardSidebar from "./Dashboard_sidebar";
import "../styles/my_jobs_dashboard.css";

const JOBS = [
  {
    id: 1,
    logo: "/assets/img/order1.png",
    title: "Marketing Automation Specialist and Email Campaign Manager",
    amount: 120.0,
    proposals: 1,
  },
  {
    id: 2,
    logo: "/assets/img/order3.png",
    title: "Senior Web Developer and SEO Specialist",
    amount: 550.0,
    proposals: 1,
  },
];

export default function MyJobs() {
  return (
    <div className="dz-with-shell">
      {/* shared sidebar + topbar (logo, icons, avatar) */}
      <DashboardSidebar user={{ name: "Alex", avatar: "/assets/avatar.png" }} />

      {/* main */}
      <main className="dz-main dz-shell-main-padding">
        <div className="dz-headerband">
          <div>
            <h1>My jobs</h1>
            <p className="dz-breadcrumb">Dashboard &gt; My jobs</p>
          </div>
          <button className="mj-post-btn">Post a Job</button>
        </div>

        <section className="mj-card">
          <table className="mj-table">
            <thead>
              <tr>
                <th className="th-project">Project Name</th>
                <th className="th-amount">Amount</th>
                <th className="th-prop">Proposals</th>
                <th className="th-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {JOBS.map((job) => (
                <tr key={job.id}>
                  <td className="td-project">
                    <img src={job.logo} alt="" className="mj-logo" />
                    <a className="mj-title" href="#!">{job.title}</a>
                  </td>
                  <td className="td-amount">${job.amount.toFixed(2)}</td>
                  <td className="td-prop">
                    <span className="mj-pill">{job.proposals}</span>
                  </td>
                  <td className="td-action">
                    <button className="mj-icon-btn" title="Edit">🖊️</button>
                    <button className="mj-icon-btn" title="View">👁️</button>
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
