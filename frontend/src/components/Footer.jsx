import React from "react";
import "../styles/footer.css";
import { Link } from "react-router-dom";
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-newsletter">
          {/* Left: Logo + blurb */}
          <div className="newsletter-left">
            <Link to="/" className="footer-logo">
              <img src="/assets/logo/" alt="Tixe logo" />
              <span><b>Tixe</b><em> app</em></span>
            </Link>
            <p>
              It is a long established fact that a reader will be distracted by
              the readable content of a page when looking at its layout the point
              of using lorem varius sit amet ipsum.
            </p>
          </div>

          {/* Right: Newsletter */}
          <div className="newsletter-right">
            <h3>Subscribe to Our Newsletter</h3>
            <p className="muted">We’ll keep you updated with the best new jobs.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email address"
                aria-label="Email"
                required
              />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>

        <div className="container"><hr className="footer-divider" /></div>

        {/* Widgets row */}
        <div className="container footer-widgets">
          {/* Download / Contact */}
          <div className="widget">
            <h4 className="widget-title">Download App</h4>
            <ul className="contact-list">
              <li>📧 example@email.com</li>
              <li>📞 +1 778-344-544</li>
              <li>White Street Night Road<br />N/A 12 Constance Street<br />London E16 2DQ</li>
            </ul>
            <div className="store-badges">
              <Link to="https://play.google.com" target="_blank" rel="noreferrer">
                <img src="/assets/play-stor.png" alt="Google Play" />
              </Link>
              <Link to="https://www.apple.com/app-store/" target="_blank" rel="noreferrer">
                <img src="/assets/app-stor.png" alt="App Store" />
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div className="widget">
            <h4 className="widget-title">Categories</h4>
            <ul className="link-list">
              <li><Link to="#">Graphics & Design</Link></li>
              <li><Link to="#">Digital Marketing</Link></li>
              <li><Link to="#">Writing & Translation</Link></li>
              <li><Link to="#">Video & Animation</Link></li>
              <li><Link to="#">Music & Audio</Link></li>
              <li><Link to="#">Tixe Logo Maker</Link></li>
              <li><Link to="#">Programming & Tech</Link></li>
              <li><Link to="#">Photography</Link></li>
            </ul>
          </div>

          {/* About */}
          <div className="widget">
            <h4 className="widget-title">About</h4>
            <ul className="link-list">
              <li><Link to="#">Careers</Link></li>
              <li><Link to="#">Press & News</Link></li>
              <li><Link to="#">Pricing Plan</Link></li>
              <li><Link to="#">Privacy Policy</Link></li>
              <li><Link to="#">Terms of Service</Link></li>
              <li><Link to="#">Blogs</Link></li>
              <li><Link to="#">FAQ’s</Link></li>
              <li><Link to="#">Contact</Link></li>
            </ul>
          </div>

          {/* Help & Supports */}
          <div className="widget">
            <h4 className="widget-title">Help & Supports</h4>
            <ul className="link-list">
              <li><Link to="#">Help & Support</Link></li>
              <li><Link to="#">Trust & Safety</Link></li>
              <li><Link to="#">Selling on Tixes</Link></li>
              <li><Link to="#">Buying on Tixes</Link></li>
              <li><Link to="#">Tixes Guides</Link></li>
              <li><Link to="#">Workspace</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="container bottom-inner">
          <p>Copyright © 2025 Tixe. All Rights Reserved.</p>
          <div className="socials">
            <Link to="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><i className="fab fa-facebook-f" /></Link>
            <Link to="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><i className="fab fa-twitter" /></Link>
            <Link to="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><i className="fab fa-instagram" /></Link>
            <Link to="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><i className="fab fa-linkedin-in" /></Link>
            <Link to="#" aria-label="Pinterest"><i className="fab fa-pinterest-p" /></Link>
          </div>
        </div>
      </div>

      {/* Scroll to top (static icon spot from screenshot) */}
      <button className="scrolltop" aria-label="Scroll to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑</button>
    </footer>
  );
};

export default Footer;
