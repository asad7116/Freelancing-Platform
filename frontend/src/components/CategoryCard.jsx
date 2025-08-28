import React, { useRef, useState } from "react";
import "../styles/CategoryCard.css";

export default function CategoryCard({
  title,
  subtitle,
  img,
  isSelected = false,
  onClick = () => {},
  tabIndex = 0,
}) {
  return (
    <article
      className={`category-card ${isSelected ? "selected" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={tabIndex}
      aria-pressed={isSelected}
      aria-label={`${title} - ${subtitle}`}
    >
      <div className="card-inner">
        <div className="icon-wrap">
          <img src={img} alt={`${title} icon`} />
        </div>

        <div className="card-text">
          <h3 className="card-title">{title}</h3>
          <p className="card-sub">{subtitle}</p>
        </div>
      </div>
    </article>
  );
}
