import React from "react";
import "../styles/Header.css";
import { Link } from "react-router-dom";
import { Globe, DollarSign, Menu, X } from "lucide-react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header>
      <div className="navbar">
        <div className="logo">
          <img src="/assets/logo/logo.png" alt="workzone-logo" />
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={`nav-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <div className="right-side">
          <div className="currency-selector">
            <DollarSign size={18} />
            <span>USD</span>
          </div>
          <div className="language-selector">
            <Globe size={18} />
            <span>English</span>
          </div>
          <Link to="/signin" className="signin-btn">
            Sign In
          </Link>
        </div>
      </div>

      <div className="sub-navbar">
        <Link to="/#" className="marketing">
          Marketing
        </Link>
        <Link to="/#" className="architecture">
          Architecture
        </Link>
        <Link to="/#" className="web-design">
          Web Design
        </Link>
        <Link to="/#" className="ai-services">
          AI Services
        </Link>
        <Link to="/#" className="business-style">
          Business Style
        </Link>
        <Link to="/#" className="development-it">
          Development & IT
        </Link>
        <Link to="/#" className="photography">
          Photography
        </Link>
        <Link to="/#" className="design-creative">
          Design & Creative
        </Link>
      </div>
    </header>
  );
};

export default Header;