import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageHeader from "../components/PageHeader";
import "../styles/Freelancer.css";
import CardGrid from "../components/CardGrid";

export default function Freelancer() {
  const [freelancers, setFreelancers] = useState([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("Default");
  const [priceSort, setPriceSort] = useState("Price (Default)");

  useEffect(() => {
    fetchFreelancers();
  }, []);

  useEffect(() => {
    filterAndSortFreelancers();
  }, [freelancers, searchTerm, selectedCategory, sortBy, priceSort]);

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:4000/api/freelancers", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch freelancers");
      }

      const data = await response.json();
      
      if (data.success) {
        setFreelancers(data.data);
        setFilteredFreelancers(data.data);
      } else {
        throw new Error(data.message || "Failed to load freelancers");
      }
    } catch (err) {
      console.error("Error fetching freelancers:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortFreelancers = () => {
    let result = [...freelancers];

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (freelancer) =>
          freelancer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          freelancer.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          freelancer.skills?.some(skill => 
            skill.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Category filter (based on role/skills)
    if (selectedCategory !== "All Categories") {
      result = result.filter(
        (freelancer) =>
          freelancer.role?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          freelancer.skills?.some(skill => 
            skill.toLowerCase().includes(selectedCategory.toLowerCase())
          )
      );
    }

    // Sort by rating/status
    if (sortBy === "Top Rated") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "New") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Sort by price
    if (priceSort === "Low to High") {
      result.sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0));
    } else if (priceSort === "High to Low") {
      result.sort((a, b) => (b.hourlyRate || 0) - (a.hourlyRate || 0));
    }

    setFilteredFreelancers(result);
  };

  if (loading) {
    return (
      <>
        <Header />
        <PageHeader title="Our Freelancers" />
        <div className="container" style={{ textAlign: "center", padding: "50px" }}>
          <p>Loading freelancers...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <PageHeader title="Our Freelancers" />
        <div className="container" style={{ textAlign: "center", padding: "50px" }}>
          <p style={{ color: "red" }}>Error: {error}</p>
          <button onClick={fetchFreelancers}>Retry</button>
        </div>
        <Footer />
      </>
    );
  }

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
              placeholder="Search freelancers, skills..."
              className="filter-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select 
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option>All Categories</option>
              <option>Web Design</option>
              <option>Development</option>
              <option>Marketing</option>
              <option>AI Services</option>
              <option>Graphic Design</option>
            </select>

            <select 
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option>Default</option>
              <option>Top Rated</option>
              <option>New</option>
            </select>

            <select 
              className="filter-select"
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value)}
            >
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
          {filteredFreelancers.length === 0 ? (
            <p style={{ textAlign: "center", padding: "50px" }}>
              No freelancers found. Try adjusting your filters.
            </p>
          ) : (
            <CardGrid freelancers={filteredFreelancers} />
          )}
        </div>
      </section>
      <Footer />
    </>
  );
}