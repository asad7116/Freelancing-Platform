import React from "react";
import "../styles/contact.css";
import Header from "../components/Header";
import PageHeader from "../components/PageHeader";
import Footer from "../components/Footer";
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export default function Contact() {
  return (
    <>
      <Header />
      <PageHeader title="Contact Us" />
      <div className="contact-page-new">
        <div className="container">
          {/* Contact Info Section */}
          <div className="contact-info-section">
            <div className="info-card">
              <div className="icon-wrapper">
                <Phone size={24} />
              </div>
              <div className="info-content">
                <h4>Phone</h4>
                <p>+92 3XX XXX XXX</p>
                <p>+92 3XX XXXX XXX</p>
              </div>
            </div>

            <div className="info-card">
              <div className="icon-wrapper">
                <Mail size={24} />
              </div>
              <div className="info-content">
                <h4>Email</h4>
                <p>asadmeh.9546@gmail.com</p>
                <p>Tixe@gmail.com</p>
              </div>
            </div>

            <div className="info-card">
              <div className="icon-wrapper">
                <MapPin size={24} />
              </div>
              <div className="info-content">
                <h4>Location</h4>
                <p>4517 Washington Ave. 32 King Street.</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-content">
                <h4>Follow Us</h4>
                <div className="social-links-row">
                  <a href="#" className="social-link"><Facebook size={20} /></a>
                  <a href="#" className="social-link"><Twitter size={20} /></a>
                  <a href="#" className="social-link"><Linkedin size={20} /></a>
                  <a href="#" className="social-link"><Instagram size={20} /></a>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="contact-form-section">
            <div className="form-header">
              <h2>Get in Touch</h2>
              <p>
                Have a project in mind or just want to say hello?
                Feel free to reach out to us. We'd love to hear from you.
              </p>
            </div>

            <form className="modern-form">
              <div className="input-group">
                <div className="input-field">
                  <label>Full Name *</label>
                  <input type="text" placeholder="John Doe" required />
                </div>
                <div className="input-field">
                  <label>Phone Number</label>
                  <input type="text" placeholder="+92 3XX XXX XXXX" />
                </div>
              </div>

              <div className="input-group">
                <div className="input-field">
                  <label>Email Address *</label>
                  <input type="email" placeholder="example@mail.com" required />
                </div>
                <div className="input-field">
                  <label>Subject *</label>
                  <input type="text" placeholder="How can we help?" required />
                </div>
              </div>

              <div className="input-field">
                <label>Your Message *</label>
                <textarea placeholder="Write your message here..." required></textarea>
              </div>

              <button type="submit" className="submit-now-btn">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
