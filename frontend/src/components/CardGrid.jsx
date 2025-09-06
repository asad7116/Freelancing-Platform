import React from "react";
import ProfileCard from "./ProfileCard";

export default function CardGrid() {
  const freelancers = [
    {
      name: "David Richard",
      role: "Web Developer",
      rating: 4.0,
      reviews: 10,
      image: "/assets/Freelancers/david.png",
      price: 50,
      isTopSeller: true,
    },
    {
      name: "David Simmons",
      role: "Web Developer",
      rating: 0.0,
      reviews: 0,
      image: "/assets/Freelancers/david.png",
      price: 40,
      isTopSeller: true,
    },
    {
      name: "Naymr Jhon",
      role: "Graphic Designer",
      rating: 0.0,
      reviews: 0,
      image: "/assets/Freelancers/david.png",
      price: 45,
      isTopSeller: true,
    },
    {
      name: "Madge Jordan",
      role: "Graphic Designer",
      rating: 0.0,
      reviews: 0,
      image: "/assets/Freelancers/david.png",
      price: 60,
      isTopSeller: true,
    },
    {
      name: "David Miller",
      role: "Web Designer",
      rating: 3.0,
      reviews: 1,
      image: "/assets/Freelancers/david.png",
      price: 55,
      isTopSeller: false,
    },
  ];

  return (
    <div className="card-grid">
      {freelancers.map((freelancer, index) => (
        <ProfileCard key={index} {...freelancer} />
      ))}
    </div>
  );
}
