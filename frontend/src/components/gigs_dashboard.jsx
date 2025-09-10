import React from "react";
import "../styles/gigs_dashboard.css";
import DashboardSidebar from "./Dashboard_sidebar";

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
    <div className="dz-with-shell">
      {/* Shared Sidebar + Topbar */}
      <DashboardSidebar user={{ name: "Alex", avatar: "/assets/avatar.png" }} />

      {/* Main */}
      <main className="dz-main dz-shell-main-padding">
        {/* Title band */}
        <div className="dz-headerband">
          <h1>Manage Gig</h1>
          <p className="dz-breadcrumb">Dashboard &gt; Manage Gig</p>
          <button className="gd-new-gig">Create a new Gig</button>
        </div>

        {/* Gig cards */}
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
                  <img src="/assets/avatar.png" alt={gig.seller} className="gd-avatar" />
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
