import React from "react";
import "../styles/testimonials.css";

const testimonials = [
  {
    id: 1,
    name: "Black Marvin",
    role: "Nursing Assistant",
    text: "Very Solid!! There are many variations of a passages of Lorem Ipsum available, but the majority have suffered alteration in some form.",
    avatar: "/assets/homepage/user1.jpg",
    rating: 5,
  },
  {
    id: 2,
    name: "Black Marvin",
    role: "Nursing Assistant",
    text: "Very Solid!! There are many variations of a passages of Lorem Ipsum available, but the majority have suffered alteration in some form.",
    avatar: "/assets/homepage/user2.jpg",
    rating: 4,
  },
  {
    id: 3,
    name: "Black Marvin",
    role: "Nursing Assistant",
    text: "Very Solid!! There are many variations of a passages of Lorem Ipsum available, but the majority have suffered alteration in some form.",
    avatar: "/assets/homepage/user3.jpg",
    rating: 5,
  },
  {
    id: 4,
    name: "Black Marvin",
    role: "Nursing Assistant",
    text: "Very Solid!! There are many variations of a passages of Lorem Ipsum available, but the majority have suffered alteration in some form.",
    avatar: "/assets/homepage/user4.jpg",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="ts-section">
      <div className="ts-container">
        {/* Header */}
        <div className="ts-header">
          <h2 className="ts-title">Testimonial</h2>
          <p className="ts-subtitle">
            Received 4.8/5 Stars in Over 10,000+ Reviews.
          </p>
        </div>

        {/* Cards */}
        <div className="ts-grid">
          {testimonials.map((t) => (
            <div className="ts-card" key={t.id}>
              <p className="ts-text">❝ {t.text}</p>
              <div className="ts-footer">
                <div className="ts-user">
                  <img src={t.avatar} alt={t.name} className="ts-avatar" />
                  <div>
                    <h4 className="ts-name">{t.name}</h4>
                    <span className="ts-role">{t.role}</span>
                  </div>
                </div>
                <div className="ts-rating">
                  {"★".repeat(t.rating)}
                  {"☆".repeat(5 - t.rating)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
