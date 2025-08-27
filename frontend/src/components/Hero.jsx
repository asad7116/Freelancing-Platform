import React from "react";
import "../styles/Hero.css";

export default function Hero() {
  return (
    <section className="hero-one">
      <div className="hero-container">
        <div className="row">
          {/* Left Column */}
          <div className="left-col">
            <div>
              <h1
                className="hero-one-title fw-bold"
                data-aos="fade-up"
                data-aos-duration="1000"
                data-aos-easing="linear"
              >
                Find Your Perfect <span>Freelancer</span> Quick and Easy
              </h1>

              {/* Search Form */}
              <div className="hero-search-form">
                <form className="form" action="/services">
                  <div className="hero-form-wrapper">
                    <div className="hero-form-select">
                      <select className="form-select" name="category">
                        <option value="">All Categories</option>
                        <option value="marketing">Marketing</option>
                        <option value="architecture">Architecture</option>
                        <option value="web-design">Web Design</option>
                        <option value="ai-services">AI Services</option>
                        <option value="business-style">Business Style</option>
                        <option value="development-it">Development &amp; IT</option>
                        <option value="photography">Photography</option>
                        <option value="design-creative">Design &amp; Creative</option>
                        <option value="programming">Programming</option>
                        <option value="animation">Animation</option>
                        <option value="digital-marketing">Digital Marketing</option>
                        <option value="graphics-design">Graphics &amp; Design</option>
                      </select>
                    </div>
                    <div className="hero-search-bar">
                      <input
                        type="text"
                        className="form-search-input"
                        placeholder="Search for any service"
                        name="search"
                      />
                      <button className="hero-form-btn">
                        <svg
                          width="19"
                          height="18"
                          viewBox="0 0 19 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15Z"
                            stroke="#F2F2F2"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M18 17L14 13"
                            stroke="#F2F2F2"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Search
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Stats */}
              <div className="mt-60 d-flex flex-column flex-sm-row flex-wrap gap-4 align-items-center">
                {/* Customers */}
                <div className="d-flex gap-3 align-items-center">
                  <div className="hero-group-img-wrapper">
                    <img
                      src="/assets/img/hero/group.webp"
                      className="hero-group-img"
                      alt="Customers"
                    />
                  </div>
                  <div>
                    <h3 className="text-white hero-counter-title fw-bold">35M+</h3>
                    <p className="text-white">Happy Customers</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="hero-rating">
                  <h3 className="text-white hero-counter-title fw-bold">4.9</h3>
                  <img src="/assets/img/hero/stars.svg" alt="Rating" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Illustration) */}
          <div className="col-md-12 col-xl-5 mt-5 mt-xl-0">
            <div>
              <img
                src="/assets/hero/ill-1.png"
                className="hero-one-img text-end"
                alt="Freelancer Illustration"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
