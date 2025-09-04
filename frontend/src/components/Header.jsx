import React from "react";
import "../styles/Header.css";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header>
      {/* Top Navbar */}
      <div className="navbar">
        {/* Logo */}
        <div className="logo">
          <img src="/assets/logo/logo.png" alt="logo" />
        </div>

        {/* Navigation */}
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>   {/* ✅ updated */}
          <a href="#">Job Post</a>
          <a href="#">Freelancers</a>
          <a href="#">Pages ▾</a>
          <Link to="/Contact">Contact</Link>
          <Link to="/about">About Us</Link>
        </nav>

        {/* Right Side */}
        <div className="right-side">
          <span>$ USD</span>
          <span>🌐 English</span>
          <Link to="/signin" className="signin-btn">
            Sign In
          </Link>
        </div>
      </div>

      {/* Sub Navbar */}
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
