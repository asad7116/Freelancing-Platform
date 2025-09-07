import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageHeader from "../components/PageHeader";
import "../styles/Freelancer.css";
import CardGrid from "../components/CardGrid";

export default function Freelancer() {
    const freelancers = [
    {
      username: "david_richard",
      name: "David Richard",
      role: "Web Developer",
      rating: 4.0,
      reviews: 10,
      image: "/assets/Freelancers/david.png",
      price: 50,
      isTopSeller: true,
    },
    {
      username: "david_simmons",
      name: "David Simmons",
      role: "Web Developer",
      rating: 0.0,
      reviews: 0,
      image: "/assets/Freelancers/david.png",
      price: 40,
      isTopSeller: true,
    },
    {
      username: "naymr_jhon",
      name: "Naymr Jhon",
      role: "Graphic Designer",
      rating: 0.0,
      reviews: 0,
      image: "/assets/Freelancers/david.png",
      price: 45,
      isTopSeller: true,
    },
    {
      username: "madge_jordan",
      name: "Madge Jordan",
      role: "Graphic Designer",
      rating: 0.0,
      reviews: 0,
      image: "/assets/Freelancers/david.png",
      price: 60,
      isTopSeller: true,
    },
    {
      username: "david_miller",
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
    <>
      <Header />
      <PageHeader title="Our Freelancers" />

      {/* Filter Section */}
      <section className="filter-section">
        <div className="container">
          <div className="filter-controls">
            <input
              type="text"
              placeholder="Search.."
              className="filter-input"
            />

            <select className="filter-select">
              <option>All Categories</option>
              <option>Web Design</option>
              <option>Development</option>
              <option>Marketing</option>
              <option>AI Services</option>
            </select>

            <select className="filter-select">
              <option>Default</option>
              <option>Top Rated</option>
              <option>New</option>
            </select>

            <select className="filter-select">
              <option>Price (Default)</option>
              <option>Low to High</option>
              <option>High to Low</option>
            </select>

            <select className="filter-select">
              <option>Most Relevant</option>
              <option>Newest</option>
              <option>Popular</option>
            </select>
          </div>
        </div>
      </section>

      {/* Freelancer Cards Section */}
      <section className="freelancer-cards">
        <div className="container">
          <CardGrid freelancers={freelancers} />
        </div>
      </section>
      <Footer />
    </>
  );
}