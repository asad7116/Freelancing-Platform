import React from "react";
import ProfileCard from "./ProfileCard";
import { Link } from "react-router-dom";

export default function CardGrid({ freelancers }) {
  return (
    <div className="card-grid">
      {freelancers.map((freelancer, index) => (
        <Link to={`/seller/${freelancer.username}`} key={index} style={{ textDecoration: 'none' }}>
         <ProfileCard key={index} {...freelancer} />
        </Link>
      ))}
    </div>
  );
}
