import React from "react";
import "../styles/testimonials.css";

const testimonials = [
  {
    id: 1,
    name: "Sarah Jenkins",
    role: "Graphic Designer",
    text: "Tixe has completely changed how I find clients. The platform is intuitive and the quality of projects is top-notch.",
    avatar: "/assets/homepage/user1.jpg",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Ross",
    role: "Web Developer",
    text: "The AI-powered matching actually works! I found my biggest project yet within just a week of joining.",
    avatar: "/assets/homepage/user2.jpg",
    rating: 5,
  },
  {
    id: 3,
    name: "Emily Lawson",
    role: "Digital Marketer",
    text: "As a buyer, I've found incredible talent here. The vetting process ensures I'm always working with professionals.",
    avatar: "/assets/homepage/user1.jpg",
    rating: 5,
  },
  {
    id: 4,
    name: "David Kovic",
    role: "Content Writer",
    text: "The payment system is secure and transparent. It's the most reliable freelancing platform I've ever used.",
    avatar: "/assets/homepage/user2.jpg",
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
