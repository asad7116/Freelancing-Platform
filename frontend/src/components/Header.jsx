import React from "react";
import "../styles/Header.css";
import { Link } from "react-router-dom";
import { Globe, DollarSign, Menu, X, ChevronDown } from "lucide-react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [currency, setCurrency] = React.useState("USD");
  const [language, setLanguage] = React.useState("English");
  const [showCurrency, setShowCurrency] = React.useState(false);
  const [showLanguage, setShowLanguage] = React.useState(false);

  const currencyRef = React.useRef(null);
  const languageRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setShowCurrency(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setShowLanguage(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currencies = ["USD", "EUR", "GBP", "PKR", "INR"];
  const languages = ["English", "Spanish", "French", "Arabic", "German"];

  return (
    <header>
      <div className="navbar">
        <div className="logo">
          <Link to="/">
            <img src="/assets/logo/logo.png" alt="tixe-logo" />
          </Link>
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
          {/* Currency Selector */}
          <div className="selector-container" ref={currencyRef}>
            <div
              className={`currency-selector ${showCurrency ? 'active' : ''}`}
              onClick={() => {
                setShowCurrency(!showCurrency);
                setShowLanguage(false);
              }}
            >
              <DollarSign size={18} />
              <span>{currency}</span>
              <ChevronDown size={14} className={`chevron ${showCurrency ? 'rotate' : ''}`} />
            </div>

            {showCurrency && (
              <div className="selector-dropdown">
                {currencies.map(curr => (
                  <div
                    key={curr}
                    className={`dropdown-item ${currency === curr ? 'selected' : ''}`}
                    onClick={() => {
                      setCurrency(curr);
                      setShowCurrency(false);
                    }}
                  >
                    {curr}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Language Selector */}
          <div className="selector-container" ref={languageRef}>
            <div
              className={`language-selector ${showLanguage ? 'active' : ''}`}
              onClick={() => {
                setShowLanguage(!showLanguage);
                setShowCurrency(false);
              }}
            >
              <Globe size={18} />
              <span>{language}</span>
              <ChevronDown size={14} className={`chevron ${showLanguage ? 'rotate' : ''}`} />
            </div>

            {showLanguage && (
              <div className="selector-dropdown">
                {languages.map(lang => (
                  <div
                    key={lang}
                    className={`dropdown-item ${language === lang ? 'selected' : ''}`}
                    onClick={() => {
                      setLanguage(lang);
                      setShowLanguage(false);
                    }}
                  >
                    {lang}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>


    </header>
  );
};

export default Header;