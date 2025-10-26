import React from "react";
import "../styles/footer.css";

import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowUp,
} from "lucide-react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-newsletter">
          {/* Left: Logo + Description */}
          <div className="newsletter-left">
            <Link to="/" className="footer-logo">
              <img src="/assets/logo/logo.png" alt="logo" />
            </Link>
            <p>
              Connect with talented freelancers and find the perfect professional
              for your project. Get your work done efficiently and affordably.
            </p>
          </div>

          {/* Right: Newsletter */}
          <div className="newsletter-right">
            <h3>Subscribe to Newsletter</h3>
            <p className="muted">Get the latest job updates delivered to your inbox.</p>
            <form
              className="newsletter-form"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email"
                aria-label="Email"
                required
              />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>

        <div className="container">
          <hr className="footer-divider" />
        </div>

        {/* Widgets row */}
        <div className="container footer-widgets">
          {/* Contact Info */}
          <div className="widget">
            <h4 className="widget-title">Contact</h4>
            <ul className="contact-list">
              <li>
                <Mail size={16} />
                <a href="mailto:info@workzone.com">info@workzone.com</a>
              </li>
              <li>
                <Phone size={16} />
                <a href="tel:+12345678900">+1 (234) 567-8900</a>
              </li>
              <li>
                <MapPin size={16} />
                <span>123 Business Street, Suite 100<br />New York, NY 10001</span>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="widget">
            <h4 className="widget-title">Categories</h4>
            <ul className="link-list">
              <li>
                <Link to="#">Graphics & Design</Link>
              </li>
              <li>
                <Link to="#">Digital Marketing</Link>
              </li>
              <li>
                <Link to="#">Programming & Tech</Link>
              </li>
              <li>
                <Link to="#">Video & Animation</Link>
              </li>
              <li>
                <Link to="#">Photography</Link>
              </li>
              <li>
                <Link to="#">Writing & Translation</Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="widget">
            <h4 className="widget-title">Company</h4>
            <ul className="link-list">
              <li>
                <Link to="#">About Us</Link>
              </li>
              <li>
                <Link to="#">Careers</Link>
              </li>
              <li>
                <Link to="#">Blog</Link>
              </li>
              <li>
                <Link to="#">Press</Link>
              </li>
              <li>
                <Link to="#">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="widget">
            <h4 className="widget-title">Support</h4>
            <ul className="link-list">
              <li>
                <Link to="#">Help Center</Link>
              </li>
              <li>
                <Link to="#">Privacy Policy</Link>
              </li>
              <li>
                <Link to="#">Terms of Service</Link>
              </li>
              <li>
                <Link to="#">FAQ's</Link>
              </li>
              <li>
                <Link to="#">Trust & Safety</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="container bottom-inner">
          <p>&copy; 2025 Tixe - Grow with us. All Rights Reserved.</p>
          <div className="socials">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              title="Facebook"
            >
              <Facebook size={18} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
              title="Twitter"
            >
              <Twitter size={18} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              title="Instagram"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <Linkedin size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      <button
        className="scrolltop"
        aria-label="Scroll to top"
        onClick={scrollToTop}
        title="Back to top"
      >
        <ArrowUp size={20} />
      </button>
    </footer>
  );
};

export default Footer;