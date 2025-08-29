import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageHeader from "../components/PageHeader";
import "../styles/About.css";

export default function About() {
  return (
    <>
      <Header />
      <PageHeader title="About Us" />
      <div className="about-container">
        {/* Main Grouped Section */}
        <section className="content-section">

          {/* Subsection: Features */}
          <div className="subsection features">
            <h2 className="section-title">Best Feature</h2>
            <h3 className="features-title">Our Latest Features</h3>
            <div className="features-grid">
              <div className="feature-card">
                <img src="/assets/about/hourly_rate.webp" alt="Hourly Rated Jobs" />
                <p className="feature-text">Hourly Rated Jobs</p>
              </div>
              <div className="feature-card">
                <img src="/assets/about/project_gigs.webp" alt="Projects Gig Catalogue" />
                <p className="feature-text">Projects Gig Catalogue</p>
              </div>
              <div className="feature-card">
                <img src="/assets/about/paid _membership.webp" alt="Paid Membership" />
                <p className="feature-text">Paid Membership</p>
              </div>
              <div className="feature-card">
                <img src="/assets/about/custom_order.webp" alt="Custom Order" />
                <p className="feature-text">Custom Order</p>
              </div>
              <div className="feature-card">
                <img src="/assets/about/live_chat.webp" alt="Live Chat System" />
                <p className="feature-text">Live Chat System</p>
              </div>
            </div>
          </div>

          {/* Subsection: About Company */}
          <div className="subsection about-company">
            {/* Left Side: Text */}
            <div className="about-text">
              <h2 className="section-title">About Company</h2>
              <h3 className="about-title">
                Join World's Best <br />
                Marketplace for Workers
              </h3>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis
                molestie mi ut arcu conde consequat erat iaculis. Duis quam lorem,
                bibendum at bibendum ut, auctor a ligula. Alv dolor urna. Proin
                rutrum lobortis vulputate.
              </p>
              <p>
                Suspendisse tincidunt urna et odio egestas tum. Class aptent
                taciti sociosqu ad litora torquen. Interdum et malesuada fames ac
                eu consequat. Nunc facilisis porttitor odio eu finibus.
              </p>
              <ul className="about-benefits">
                <li>
                  <span className="check-icon">✔</span> Modern Technology
                </li>
                <li>
                  <span className="check-icon">✔</span> Insured and Bonded
                </li>
                <li>
                  <span className="check-icon">✔</span> One-off, weekly or fortnightly visits
                </li>
              </ul>

              <div className="about-footer">
                <button className="contact-btn">Contact Us →</button>
                <div className="about-profile">
                  <img
                    src="/assets/about/seo_image.webp"
                    alt="Profile"
                    className="profile-img"
                  />
                  <img
                    src="/assets/about/signature.webp"
                    alt="Signature"
                    className="signature-img"
                  />
                </div>
              </div>
            </div>

            {/* Right Side: Images */}
            <div className="about-images">
              <div className="top-images">
                <img
                  src="/assets/about/about_image.webp"
                  alt="Team Collaboration"
                  className="about-img"
                />          
              </div>
              
            </div>
          </div>

        </section>
      </div>
      <Footer />
    </>
  );
}
