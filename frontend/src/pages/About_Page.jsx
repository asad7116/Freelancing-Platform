import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageHeader from "../components/PageHeader";

export default function About() {
  return (
    <>
      <Header />
      <PageHeader title="About Us" />
      <div className="about-container">
        <h1>About Us</h1>
        <p>Welcome to Work Zone! We are a freelancing platform dedicated to connecting clients and freelancers worldwide.</p>
        <p>Our mission is to provide a seamless and efficient platform for collaboration and success.</p>
      </div>
      <Footer />
    </>
  );
}