// src/pages/gigs_dashboard.jsx
import React from "react";
import "../styles/gigs_dashboard.css";

const dummyGigs = [
  {
    id: 1,
    title: "App icon Design For Android And iOS",
    price: 5500,
    rating: 4.2,
    reviews: 5,
    seller: "Matthew Anderson",
    image: "/assets/img/order1.png",
    active: true,
  },
  {
    id: 2,
    title: "Custom Typography Design for your Product",
    price: 2000,
    rating: 5.0,
    reviews: 1,
    seller: "Matthew Anderson",
    image: "/assets/img/order2.png",
    active: true,
  },
  {
    id: 3,
    title: "Instagram Reel Marketing for Your Niche",
    price: 600,
    rating: 0.0,
    reviews: 0,
    seller: "Matthew Anderson",
    image: "/assets/img/order3.png",
    active: true,
  },
];

export default function GigsDashboard() {
  return (
    <div className="gd-wrap">
      {/* Sidebar */}
      <aside className="gd-sidebar">
        <div className="gd-brand">
          <img src="/assets/logo/logo.png" alt="Workzone" />
          <div className="gd-brand-text">
            <span className="gd-brand-title">Work</span>
            <span className="gd-brand-sub">zone</span>
          </div>
        </div>
        <nav className="gd-menu">
          <button className="gd-menu-item">🏠 Dashboard</button>
          <button className="gd-menu-item gd-menu-item--active">📦 Gigs</button>
          <button className="gd-menu-item">🧾 Orders</button>
          <button className="gd-menu-item">💼 Jobs</button>
          <button className="gd-menu-item">🛒 My Orders</button>
          <button className="gd-menu-item">📝 Proposals</button>
          <button className="gd-menu-item">🎟️ Subscription</button>
          <button className="gd-menu-item">✉️ Messages</button>
          <button className="gd-menu-item">🖼️ Portfolio</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="gd-main">
        <header className="gd-header">
          <div>
            <h1>Manage Gig</h1>
            <p className="gd-breadcrumb">Dashboard &gt; Manage Gig</p>
          </div>
          <button className="gd-new-gig">Create a new Gig</button>
        </header>

        {/* Gig Cards */}
        <section className="gd-cards">
          {dummyGigs.map((gig) => (
            <article className="gd-card" key={gig.id}>
              <img src={gig.image} alt={gig.title} className="gd-card-img" />
              <div className="gd-card-body">
                <div className="gd-price">${gig.price.toLocaleString()}</div>
                <div className="gd-rating">
                  ⭐ {gig.rating.toFixed(1)} ({gig.reviews})
                </div>
                <h3 className="gd-title">{gig.title}</h3>
                <div className="gd-seller">
                  <img
                    src="/assets/avatar.png"
                    alt={gig.seller}
                    className="gd-avatar"
                  />
                  <span>{gig.seller}</span>
                </div>
                <div className="gd-actions">
                  <label className="gd-status">
                    Status:
                    <input type="checkbox" checked={gig.active} readOnly />
                  </label>
                  <button className="gd-edit">Edit Gig</button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
