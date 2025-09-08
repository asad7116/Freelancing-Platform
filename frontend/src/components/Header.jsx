import React from "react";
import "../styles/Header.css";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header>
      <div className="navbar">
        <div className="logo">
          <img src="/assets/logo/" alt="tixe-logo" />
        </div>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/jobs">Jobs</Link>
          <a href="/Freelancers">Freelancers</a>

          {/* ▼ Pages dropdown (hover) */}
          <div className="pages-dropdown">
            <button type="button" className="pages-trigger">
              Pages <span className="caret">▾</span>
            </button>
            <div className="pages-menu">
              <Link to="/dashboard">User Dashboard</Link>
              <Link to="/pricing">Pricing</Link>        {/* ✅ route to Pricing */}
              <Link to="/faq">Faq</Link>
              <Link to="/signin">Login</Link>
              <Link to="/signUp">SignUp</Link>
              <Link to="/not-found">404 Page</Link>
            </div>
          </div>

          <Link to="/Contact">Contact</Link>
          <Link to="/about">About Us</Link>
        </nav>

        <div className="right-side">
          <span>$ USD</span>
          <span>🌐 English</span>
          <Link to="/signin" className="signin-btn">Sign In</Link>
        </div>
      </div>

      <div className="sub-navbar">
        <a href="#">Marketing</a>
        <a href="#">Architecture</a>
        <a href="#">Web Design</a>
        <a href="#">AI Services</a>
        <a href="#">Business Style</a>
        <a href="#">Development & IT</a>
        <a href="#">Photography</a>
        <a href="#">Design & Creative</a>
      </div>
    </header>
  );
};

export default Header;
