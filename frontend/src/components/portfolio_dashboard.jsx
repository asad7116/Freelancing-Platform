import React from "react";
import DashboardSidebar from "../components/Dashboard_sidebar";
import "../styles/portfolio_dashboard.css";

const portfolioItems = [
  {
    id: "p1",
    title: "Mobile App UI/UX Design",
    image: "/assets/portfolio/app1.png",
    category: "Design",
    status: "Published",
  },
  {
    id: "p2",
    title: "E-commerce Website Development",
    image: "/assets/portfolio/web1.png",
    category: "Development",
    status: "Draft",
  },
  {
    id: "p3",
    title: "Branding & Logo Pack",
    image: "/assets/portfolio/logo1.png",
    category: "Branding",
    status: "Published",
  },
  {
    id: "p4",
    title: "Social Media Ad Banners",
    image: "/assets/portfolio/banner1.png",
    category: "Marketing",
    status: "Published",
  },
];

export default function PortfolioDashboard() {
  return (
    <div className="dz-with-shell">
      {/* Sidebar */}
      <DashboardSidebar user={{ name: "Alex", avatar: "/assets/avatar.png" }} />

      {/* Main content */}
      <main className="dz-main dz-shell-main-padding">
        <div className="dz-headerband">
          <h1>Portfolio</h1>
          <p className="dz-breadcrumb">Dashboard &gt; Portfolio</p>
        </div>

        <section className="pf-grid">
          {portfolioItems.map((item) => (
            <div className="pf-card" key={item.id}>
              <div className="pf-img-wrap">
                <img src={item.image} alt={item.title} />
              </div>
              <div className="pf-body">
                <h3 className="pf-title">{item.title}</h3>
                <p className="pf-category">{item.category}</p>
                <span
                  className={`pf-status ${
                    item.status.toLowerCase() === "published"
                      ? "published"
                      : "draft"
                  }`}
                >
                  {item.status}
                </span>
                <div className="pf-actions">
                  <button className="pf-btn view">👁 View</button>
                  <button className="pf-btn edit">✎ Edit</button>
                  <button className="pf-btn delete">🗑 Delete</button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
