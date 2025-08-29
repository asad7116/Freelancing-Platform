import React from "react";
import Header from "../components/Header";
import "../styles/homepage.css";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import CardListing from "../components/CardListing";
import categories from "../data/categoriesData";
import Card from "../components/Card";
import topSellers from "../data/topsellersData";

const Homepage = () => {
  return (
    <>
      <Header />
      <Hero />
      <CardListing
          title="Popular Categories"
          subtitle="Browse our top categories"
          data={categories}   // 👈 this is where data must be passed
          renderCard={(item, i) => <Card key={i} {...item} />}
      />

        <CardListing
          title="Top Sellers"
          subtitle="Meet the best performing freelancers"
          data={topSellers}
          renderCard={(item, i) => <Card key={i} {...item} />}
        />
         {/*
         <CardListing
          title="Testimonials"
          subtitle="See what clients say about us"
          items={testimonials}
        /> */}
      {/* <Category /> */}
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
