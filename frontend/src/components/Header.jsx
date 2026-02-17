import React from "react";
import "../styles/Header.css";
import { Link } from "react-router-dom";
import { Globe, DollarSign, Menu, X, ChevronDown } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [currency, setCurrency] = React.useState("USD");
  const [showCurrency, setShowCurrency] = React.useState(false);
  const [showLanguage, setShowLanguage] = React.useState(false);

  const { language, changeLanguage, t, availableLanguages } = useLanguage();

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

  // Close mobile menu when clicking a link
  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const currencies = ["USD", "EUR", "GBP", "PKR", "INR"];

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
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <nav className="nav-links desktop-nav">
          <Link to="/">{t('header.home')}</Link>
          <Link to="/about">{t('header.about')}</Link>
          <Link to="/pricing">{t('header.pricing')}</Link>
          <Link to="/contact">{t('header.contact')}</Link>
        </nav>

        {/* Desktop Right Side */}
        <div className="right-side desktop-right">
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
                {availableLanguages.map(lang => (
                  <div
                    key={lang}
                    className={`dropdown-item ${language === lang ? 'selected' : ''}`}
                    onClick={() => {
                      changeLanguage(lang);
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

        {/* Mobile Menu Overlay */}
        <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)} />

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <nav className="mobile-nav-links">
            <Link to="/" onClick={handleLinkClick}>{t('header.home')}</Link>
            <Link to="/about" onClick={handleLinkClick}>{t('header.about')}</Link>
            <Link to="/pricing" onClick={handleLinkClick}>{t('header.pricing')}</Link>
            <Link to="/contact" onClick={handleLinkClick}>{t('header.contact')}</Link>
          </nav>

          <div className="mobile-selectors">
            {/* Mobile Currency Selector */}
            <div className="mobile-selector">
              <label>{t('header.currency')}</label>
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
              >
                {currencies.map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>

            {/* Mobile Language Selector */}
            <div className="mobile-selector">
              <label>{t('header.language')}</label>
              <select 
                value={language} 
                onChange={(e) => changeLanguage(e.target.value)}
              >
                {availableLanguages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mobile-auth-buttons">
            <Link to="/signin" className="mobile-signin-btn" onClick={handleLinkClick}>{t('header.signIn')}</Link>
            <Link to="/signup" className="mobile-signup-btn" onClick={handleLinkClick}>{t('header.signUp')}</Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;