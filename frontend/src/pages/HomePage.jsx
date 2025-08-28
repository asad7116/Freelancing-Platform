import React from "react";
import Header from "../components/Header";
import "../styles/homepage.css";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Category from "../components/Category";

const Homepage = () => {
  return (
    <>
      <Header />
      <Hero />
      <Category />
      {/* <section className="hero">
        <div className="hero-content">
          <h2>Find The Perfect Freelance Services For Your Business</h2>
          <p>Trusted by thousands of businesses and freelancers worldwide.</p>

          <div className="search-box">
            <input type="text" placeholder="What service are you looking for?" />
            <button>Search</button>
          </div>
        </div>
      </section> */}
      <Footer />
     
    </>
  );
};

export default Homepage;
