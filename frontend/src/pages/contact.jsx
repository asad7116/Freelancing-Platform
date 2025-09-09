import React from "react";
import "../styles/contact.css";
import Header from "../components/Header";
import PageHeader from "../components/PageHeader";
import Footer from "../components/Footer";

export default function Contact() {
  return (
    <>
    <Header />
      <PageHeader title="Contact Us" />
    <div className="contact-page">
      {/* Banner Section */}
      <div className="contact-banner">
        <h1>Contact Us</h1>
        <p>Home / <span>Contact Us</span></p>
      </div>

      {/* Contact Info Section */}
      <div className="contact-info">
        <div className="info-box">
          <i className="fas fa-phone"></i>
          <h4>Phone</h4>
          <p>+92 3XX XXX XXX<br />+92 3XX XXXX XXX</p>
        </div>
        <div className="info-box"><i class="fa-slab fa-regular fa-envelope"></i>
          <h4>Email</h4>
          <p>asadmeh.9546@gmail.com<br />Tixe@gmail.com</p>
        </div>
        <div className="info-box">
          <i className="fas fa-map-marker-alt"></i>
          <h4>Location</h4>
          <p>4517 Washington Ave. 32 King Street.</p>
        </div>
        <div className="info-box">
          <h4>Follow Us:</h4>
          <div className="social-icons">
            <i className="fab fa-facebook-f"></i>
            <i className="fab fa-twitter"></i>
            <i className="fab fa-linkedin-in"></i>
            <i className="fab fa-instagram"></i>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="contact-form">
        <h3>Get in Touch</h3>
        <p>
          Award-winning, family owned dealership of new and pre-owned Tixe
          with several locations across the city.
        </p>
        <form>
          <div className="form-row">
            <input type="text" placeholder="Name *" required />
            <input type="text" placeholder="Phone" />
          </div>
          <div className="form-row">
            <input type="email" placeholder="Email *" required />
            <input type="text" placeholder="Subject *" required />
          </div>
          <textarea placeholder="Message *" required></textarea>
          <button type="submit" className="send-btn">Send Message</button>
        </form>
      </div>
    </div>
    <Footer/>
  </>
  );
}
