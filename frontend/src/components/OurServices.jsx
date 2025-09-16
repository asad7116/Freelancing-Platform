import React from "react";
import "../styles/ourservices.css";

const services = [
  {
    id: 1,
    title: "App icon Design For Android And iOS",
    price: 120,
    rating: 4.3,
    reviews: 6,
    seller: "Matthew Anderson",
    sellerAvatar: "/assets/homepage/user1.jpg",
    image: "/assets/homepage/service1.png",
  },
  {
    id: 2,
    title: "Modern Typography Font Design",
    price: 75,
    rating: 4.7,
    reviews: 3,
    seller: "Michael Davis",
   sellerAvatar: "/assets/homepage/user2.jpg",
    image: "/assets/homepage/service2.jpg",
  },
  {
    id: 3,
    title: "Flutter App Development for Android and iOS",
    price: 80,
    rating: 5.0,
    reviews: 2,
    seller: "Olivia Clark",
    sellerAvatar: "/assets/homepage/user1.jpg",
    image: "/assets/homepage/service3.jpg",
  },
  {
    id: 4,
    title: "Product Label Design for Promotion",
    price: 45,
    rating: 3.0,
    reviews: 3,
    seller: "Sarah Brown",
    sellerAvatar: "/assets/homepage/user2.jpg",
    image: "/assets/homepage/service1.png",
  },
  {
    id: 5,
    title: "Sneakers Shoes Illustration Vector Design",
    price: 95,
    rating: 4.0,
    reviews: 1,
    seller: "Sophia Taylor",
   sellerAvatar: "/assets/homepage/user1.jpg",
    image: "/assets/homepage/service5.png",
  },
];

export default function OurServices() {
  return (
    <section className="os-section">
      {/* Header */}
      <div className="os-header">
        <div>
          <h2 className="os-title">Our Services</h2>
          <p className="os-subtitle">Get some Inspirations from 86K+ skills</p>
        </div>
        <div className="os-arrows">
          <button className="os-arrow">{"<"}</button>
          <button className="os-arrow">{">"}</button>
        </div>
      </div>

      {/* Service Cards */}
      <div className="os-grid">
        {services.map((srv) => (
          <div key={srv.id} className="os-card">
            <div className="os-img-wrap">
              <img src={srv.image} alt={srv.title} className="os-img" />
              <button className="os-fav">♡</button>
            </div>
            <div className="os-body">
              <div className="os-price">{srv.price}.00৳</div>
              <div className="os-rating">
                ⭐ {srv.rating} ({srv.reviews})
              </div>
              <h3 className="os-title-card">{srv.title}</h3>
              <div className="os-seller">
                <img
                  src={srv.sellerAvatar}
                  alt={srv.seller}
                  className="os-avatar"
                />
                <span>{srv.seller}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
