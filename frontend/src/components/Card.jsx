import React from "react";
import "../styles/Card.css";

export default function Card({ title, subtitle, img }) {
  return (
    <div className="card">
      {img && <img src={img} alt={title} className="card-img" />}
      <div className="card-body">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
}
