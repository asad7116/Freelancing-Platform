import React from "react";
import "../styles/testimonials.css";
import { useLanguage } from "../context/LanguageContext";

export default function Testimonials() {
  const { t } = useLanguage();

  const testimonials = [
    {
      id: 1,
      name: "Sarah Jenkins",
      role: t('testimonials.graphicDesigner'),
      text: t('testimonials.review1'),
      avatar: "/assets/homepage/user1.jpg",
      rating: 5,
    },
    {
      id: 2,
      name: "Michael Ross",
      role: t('testimonials.webDeveloper'),
      text: t('testimonials.review2'),
      avatar: "/assets/homepage/user2.jpg",
      rating: 5,
    },
    {
      id: 3,
      name: "Emily Lawson",
      role: t('testimonials.digitalMarketer'),
      text: t('testimonials.review3'),
      avatar: "/assets/homepage/user1.jpg",
      rating: 5,
    },
    {
      id: 4,
      name: "David Kovic",
      role: t('testimonials.contentWriter'),
      text: t('testimonials.review4'),
      avatar: "/assets/homepage/user2.jpg",
      rating: 5,
    },
  ];

  return (
    <section className="ts-section">
      <div className="ts-container">
        {/* Header */}
        <div className="ts-header">
          <h2 className="ts-title">{t('testimonials.title')}</h2>
          <p className="ts-subtitle">
            {t('testimonials.subtitle')}
          </p>
        </div>

        {/* Cards */}
        <div className="ts-grid">
          {testimonials.map((item) => (
            <div className="ts-card" key={item.id}>
              <p className="ts-text">❝ {item.text}</p>
              <div className="ts-footer">
                <div className="ts-user">
                  <img src={item.avatar} alt={item.name} className="ts-avatar" />
                  <div>
                    <h4 className="ts-name">{item.name}</h4>
                    <span className="ts-role">{item.role}</span>
                  </div>
                </div>
                <div className="ts-rating">
                  {"★".repeat(item.rating)}
                  {"☆".repeat(5 - item.rating)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
