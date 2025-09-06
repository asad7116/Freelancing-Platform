import React from "react";
import "../styles/ProfileCard.css";

export default function ProfileCard({ 
  name, 
  role, 
  rating, 
  reviews, 
  image, 
  price, 
  isTopSeller 
}) {
  return (
    <div className="profile-card">
      {isTopSeller && <span className="badge">Top Seller</span>}
      
      <div className="profile-img">
        <img src={image} alt={name} />
      </div>

      <div className="profile-content">
        <h3 className="profile-name">
          {name} <span className="verified">✔</span>
        </h3>
        <p className="profile-role">{role}</p>
        
        <div className="profile-rating">
          ⭐ {rating} ({reviews} Reviews)
        </div>

        <div className="profile-price">From: <span>${price}</span></div>
      </div>
    </div>
  );
}
