import React from "react";
import ProfileCard from "./ProfileCard";

export default function CardGrid({ freelancers }) {
  return (
    <div className="card-grid">
      {freelancers.map((freelancer, index) => (
        <a href={`/seller/${freelancer.username}`} key={index} style={{ textDecoration: 'none' }}>
         <ProfileCard key={index} {...freelancer} />
        </a>
      ))}
    </div>
  );
}
