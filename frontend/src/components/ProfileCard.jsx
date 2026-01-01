import React from "react";
import "../styles/ProfileCard.css";

export default function ProfileCard({ 
  name, 
  role, 
  rating, 
  reviews, 
  image, 
  price,
  hourlyRate, 
  isTopSeller 
}) {
  const displayPrice = hourlyRate || price || 0;
  
  return (
    <div className="profile-card">
      {isTopSeller && <span className="badge">Top Seller</span>}
      
      <div className="profile-img">
        <img 
          src={image?.startsWith('/uploads') ? `http://localhost:4000${image}` : image} 
          alt={name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/assets/Freelancers/default-avatar.png';
          }}
        />
      </div>

      <div className="profile-content">
        <h3 className="profile-name">
          {name} <span className="verified">✔</span>
        </h3>
        <p className="profile-role">{role}</p>
        
        <div className="profile-rating">
          ⭐ {rating ? rating.toFixed(1) : '0.0'} ({reviews} Reviews)
        </div>

        <div className="profile-price">
          Hourly Rate: <span>${displayPrice}/hr</span>
        </div>
      </div>
    </div>
  );
}
