import React from "react";
import "../styles/Header.css";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header>
      <div className="navbar">
        <div className="logo">
          <img src="/assets/logo/logo.png" alt="workzone-logo" />
        </div>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          
          <Link to="/services">Services</Link>
          <Link to="/jobs">Jobs</Link>
          <Link to="/freelancers">Freelancers</Link>

          {/* ▼ Pages dropdown (hover) */}
          <div className="pages-dropdown">
            <button type="button" className="pages-trigger">
              Pages <span className="caret">▾</span>
            </button>
            <div className="pages-menu">
              <Link to="/dashboard">User Dashboard</Link> {/* ✅ routable */}
              <Link to="/pricing">Pricing</Link>
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
          <Link to="/signin" className="signin-btn">
            Sign In
          </Link>
        </div>
      </div>

      <div className="sub-navbar">
        <Link to="/#" className="marketing" >Marketing</Link>
        <Link to="/#" className="architecture" >Architecture</Link>
        <Link to="/#" className="web-design" >Web Design</Link>
        <Link to="/#" className="ai-services" >AI Services</Link>
        <Link to="/#" className="business-style" >Business Style</Link>
        <Link to="/#" className="development-it" >Development & IT</Link>
        <Link to="/#" className="photography" >Photography</Link>
        <Link to="/#" className="design-creative" >Design & Creative</Link>
      </div>
    
    </header>
  );
};

export default Header;
