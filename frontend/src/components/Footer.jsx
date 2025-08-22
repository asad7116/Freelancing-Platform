import React from "react";
import "../styles/footer.css";

const Footer = () => {
  return (
    <footer className="footer-area">
      <div className="bg-dark-300 pt-110">
        <div className="container">
          {/* Newsletter */}
          <div className="footer-newsletter">
            <div className="row">
              {/* Left Side */}
              <div className="col-lg-6 col-xl-4">
                <a href="/" className="d-block mb-4">
                  <img src="/assets/logo/logo.png" alt="footer logo" />
                </a>
                <p className="text-white">
                  It is a long established fact that a reader will be distracted
                  by the readable content of a page when looking at its layout
                  the point of using lorem varius sit amet ipsum.
                </p>
              </div>

              {/* Right Side */}
              <div className="col-lg-6 col-xl-6">
                <h3 className="text-white mb-3">Subscribe to Our Newsletter</h3>
                <p className="footer-newsletter-desc">
                  We will keep you updated with the best new jobs.
                </p>
                <form className="footer-newsletter-form">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    required
                  />
                  <button type="submit" className="footer-newsletter-btn">
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Widgets */}
          <div className="footer-widgets">
            <div className="row">
              {/* Contact */}
              <div className="col-md-6 col-xl-3">
                <h3 className="footer-widget-title">Contact Us</h3>
                <ul className="footer-info-widget">
                  <li>📞 123-343-4444</li>
                  <li>📧 asadmeh.9546@gmail.com</li>
                  <li>📍 Information Tenchnology University Lahore, PK</li>
                </ul>

                <h3 className="footer-widget-title">Download App</h3>
                <div className="download-links">
                  <a
                    href="https://play.google.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src="/assets/play-stor.png"
                      alt="Google Play"
                      className="store-btn"
                    />
                  </a>
                  <a
                    href="https://www.apple.com/app-store/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src="/assets/app-stor.png"
                      alt="App Store"
                      className="store-btn"
                    />
                  </a>
                </div>
              </div>
              {/* You can add more widgets here */}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright & Social Links */}
      <div className="footer-copyright">
        <div className="container">
          <div className="row justify-content-between align-items-center">
            <div className="col-auto">
              <p className="text-white mb-0">
                Copyright 2024, QuomodoSoft. All Rights Reserved.
              </p>
            </div>
            <div className="col-auto">
              <div className="footer-social">
                <a
                  href="https://www.facebook.com"
                  className="footer-social-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a
                  href="https://www.twitter.com"
                  className="footer-social-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className="fab fa-twitter"></i>
                </a>
                <a
                  href="https://www.instagram.com"
                  className="footer-social-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a
                  href="https://www.linkedin.com"
                  className="footer-social-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
