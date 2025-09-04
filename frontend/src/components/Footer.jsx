import React from "react";
import "../styles/footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-newsletter">
          {/* Left: Logo + blurb */}
          <div className="newsletter-left">
            <a href="/" className="footer-logo">
              <img src="/assets/logo/logo.png" alt="Workzone logo" />
              <span><b>Work</b><em> zone</em></span>
            </a>
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
              <a href="https://play.google.com" target="_blank" rel="noreferrer">
                <img src="/assets/play-stor.png" alt="Google Play" />
              </a>
              <a href="https://www.apple.com/app-store/" target="_blank" rel="noreferrer">
                <img src="/assets/app-stor.png" alt="App Store" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="widget">
            <h4 className="widget-title">Categories</h4>
            <ul className="link-list">
              <li><a href="#">Graphics & Design</a></li>
              <li><a href="#">Digital Marketing</a></li>
              <li><a href="#">Writing & Translation</a></li>
              <li><a href="#">Video & Animation</a></li>
              <li><a href="#">Music & Audio</a></li>
              <li><a href="#">WorkZone Logo Maker</a></li>
              <li><a href="#">Programming & Tech</a></li>
              <li><a href="#">Photography</a></li>
            </ul>
          </div>

          {/* About */}
          <div className="widget">
            <h4 className="widget-title">About</h4>
            <ul className="link-list">
              <li><a href="#">Careers</a></li>
              <li><a href="#">Press & News</a></li>
              <li><a href="#">Pricing Plan</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Blogs</a></li>
              <li><a href="#">FAQ’s</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>

          {/* Help & Supports */}
          <div className="widget">
            <h4 className="widget-title">Help & Supports</h4>
            <ul className="link-list">
              <li><a href="#">Help & Support</a></li>
              <li><a href="#">Trust & Safety</a></li>
              <li><a href="#">Selling on Work zones</a></li>
              <li><a href="#">Buying on Work zones</a></li>
              <li><a href="#">Work zones Guides</a></li>
              <li><a href="#">Workspace</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="container bottom-inner">
          <p>Copyright © 2025 WorkZone. All Rights Reserved.</p>
          <div className="socials">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><i className="fab fa-facebook-f" /></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><i className="fab fa-twitter" /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><i className="fab fa-instagram" /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><i className="fab fa-linkedin-in" /></a>
            <a href="#" aria-label="Pinterest"><i className="fab fa-pinterest-p" /></a>
          </div>
        </div>
      </div>

      {/* Scroll to top (static icon spot from screenshot) */}
      <button className="scrolltop" aria-label="Scroll to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑</button>
    </footer>
  );
};

export default Footer;
