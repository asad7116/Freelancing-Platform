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
        </div>
      </div>

     
    </header>
  );
};

export default Header;