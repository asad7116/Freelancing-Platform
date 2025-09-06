import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageHeader from "../components/PageHeader";
import CardListing from "../components/CardListing";
import "../styles/Freelancer.css";
import CardGrid from "../components/CardGrid";

export default function Freelancer() {
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
          <CardGrid />
        </div>
      </section>

      <Footer />
    </>
  );
}