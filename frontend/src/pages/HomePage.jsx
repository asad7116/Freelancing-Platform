import React from "react";
import Header from "../components/Header";
import "../styles/homepage.css";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import ExploreSection from "../components/ExploreSection";
import Testimonials from "../components/Testimonials";
import CallToAction from "../components/CallToAction";

const Homepage = () => {
  return (
    <>
      <Header />
      <Hero />
      <ExploreSection />
      <Testimonials />
      <CallToAction />
      <Footer />
     
    </>
  );
};

export default Homepage;
