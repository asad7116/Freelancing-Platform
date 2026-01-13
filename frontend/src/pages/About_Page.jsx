import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageHeader from "../components/PageHeader";
import { Target, ShieldCheck, Handshake, Lightbulb, Globe } from "lucide-react";
import "../styles/About_New.css";

export default function About() {
  return (
    <>
      <Header />
      <PageHeader title="About Us" />
      <div className="about-page-new">
        <section className="about-hero">
          <div className="container">
            <div className="about-hero-content">
              <span className="badge">Our Story</span>
              <h1>Empowering the Global <br /><span>Freelancing Community</span></h1>
              <p className="lead-text">
                Welcome to Tixe, where talent meets opportunity. We're more than just a platform;
                we're a global catalyst for professional growth and business success.
              </p>
            </div>
          </div>
        </section>

        <section className="about-mission">
          <div className="container">
            <div className="mission-grid">
              <div className="mission-text">
                <h2 className="section-title">Our Mission</h2>
                <p>
                  At Tixe, our mission is to break down geographical barriers and provide a
                  seamless, secure, and efficient ecosystem for collaboration. We believe
                  that the future of work is flexible, inclusive, and driven by merit.
                </p>
                <div className="stats-row">
                  <div className="stat-item">
                    <h3>10k+</h3>
                    <p>Active Freelancers</p>
                  </div>
                  <div className="stat-item">
                    <h3>5k+</h3>
                    <p>Successful Projects</p>
                  </div>
                  <div className="stat-item">
                    <h3>98%</h3>
                    <p>Client Satisfaction</p>
                  </div>
                </div>
              </div>
              <div className="mission-visual">
                <div className="visual-card">
                  <div className="icon-box">
                    <Target size={32} className="lucide-icon" />
                  </div>
                  <h4>Precision Matching</h4>
                  <p>Our AI-driven algorithms ensure the right talent finds the right project.</p>
                </div>
                <div className="visual-card">
                  <div className="icon-box">
                    <ShieldCheck size={32} className="lucide-icon" />
                  </div>
                  <h4>Secure Payments</h4>
                  <p>Trust is our foundation, with industry-leading escrow and payment protection.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-values">
          <div className="container">
            <h2 className="section-title centered">Our Core Values</h2>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">
                  <Handshake size={48} className="lucide-icon" />
                </div>
                <h4>Integrity First</h4>
                <p>We foster a community built on honesty, transparency, and mutual respect.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">
                  <Lightbulb size={48} className="lucide-icon" />
                </div>
                <h4>Constant Innovation</h4>
                <p>We continuously evolve our platform to meet the changing needs of the modern workforce.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">
                  <Globe size={48} className="lucide-icon" />
                </div>
                <h4>Global Inclusion</h4>
                <p>We believe great talent can be found anywhere, and we're here to prove it.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
