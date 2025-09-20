import React from "react";
import DashboardSidebar from "../components/Dashboard_sidebar";
import "../styles/wishlist_dashboard.css";

const wishlistItems = [
  {
    id: "w1",
    title: "Ice cream cup label packaging Design",
    freelancer: "Jhon Doe",
    price: "$59.00",
    rating: 1,
    reviews: 0,
    image: "/assets/homepage/service1.png",
    status: "saved",
  },
  {
    id: "w2",
    title: "App icon Design For Android And iOS",
    freelancer: "Matthew Anderson",
    price: "$120.00",
    rating: 5,
    reviews: 5,
    image: "/assets/homepage/service2.jpg",
    status: "saved",
  },
  {
    id: "w3",
    title: "Flutter App Development for Android and iOS",
    freelancer: "Olivia Clark",
    price: "$80.00",
    rating: 5,
    reviews: 2,
    image: "/assets/homepage/service3.jpg",
    status: "saved",
  },
  {
    id: "w4",
    title: "Sneakers Shoes Illustration Vector Design",
    freelancer: "Sophia Taylor",
    price: "$95.00",
    rating: 4,
    reviews: 1,
    image: "/assets/homepage/service5.png",
    status: "saved",
  },
];

export default function WishlistDashboard() {
  return (
    <div className="dz-with-shell">
      {/* <DashboardSidebar user={{ name: "Alex", avatar: "/assets/avatar.png" }} /> */}

      <main className="dz-main dz-shell-main-padding">
        <div className="dz-headerband">
          <h1>Wishlist</h1>
          <p className="dz-breadcrumb">Dashboard &gt; Wishlist</p>
        </div>

        <section className="wl-container">
          <table className="wl-table">
            <thead>
              <tr>
                <th>Gig</th>
                <th>Freelancer</th>
                <th>Price</th>
                <th>Status</th>
                <th>Ratings</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {wishlistItems.map((item) => (
                <tr key={item.id}>
                  <td className="wl-gig-cell">
                    <img src={item.image} alt={item.title} />
                    <span className="wl-gig-title">{item.title}</span>
                  </td>
                  <td>{item.freelancer}</td>
                  <td>{item.price}</td>
                  <td>
                    <span className="wl-status">{item.status}</span>
                  </td>
                  <td>
                    {"★".repeat(item.rating)}
                    {"☆".repeat(5 - item.rating)} ({item.reviews})
                  </td>
                  <td className="wl-action">
                    <button className="view-btn" title="View">👁</button>
                    <button className="delete-btn" title="Remove">🗑</button>
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
