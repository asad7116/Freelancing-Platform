import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageHeader from "../components/PageHeader";
import "../styles/SellerDetails.css";

export default function SellerDetails() {
  const [activeTab, setActiveTab] = useState('Gigs');

  const sellerData = {
    name: "Matthew Anderson",
    rating: 4.4,
    totalReviews: 7,
    location: "Egypt",
    memberSince: "June 16, 2024",
    avatar: "/assets/Freelancers/david.png", // Replace with actual path
    isTopSeller: true,
    description: "There are many variations of Lorem Ipsum passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need. Fusce eget pulvinar lorem. Quisque suscipit ante ac nisl rutrum nec mollis nulla.",
    skills: ["Brand Design", "Graphics & Design", "AI Service", "Digital Marketing"]
  };

  const gigs = [
    {
      id: 1,
      title: "App icon Design For Android And iOS",
      price: "90.00$",
      rating: 4.3,
      reviews: 6,
      image: "/assets/Freelancers/Freelancer1/gig-img (1).png", // Replace with actual path
      favorite: false
    },
    {
      id: 2,
      title: "Custom Typography Design for your Product",
      price: "90.00$",
      rating: 5.0,
      reviews: 1,
      image: "/assets/Freelancers/Freelancer1/gig-img (1).jpg", // Replace with actual path
      favorite: true
    },
    {
      id: 3,
      title: "Instagram Reel Marketing for Your Niche",
      price: "90.00$",
      rating: 0.0,
      reviews: 0,
      image: "/assets/Freelancers/Freelancer1/gig-img (2).jpg", // Replace with actual path
      favorite: false
    }
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const toggleFavorite = (gigId) => {
    // Handle favorite toggle logic here
    console.log(`Toggle favorite for gig ${gigId}`);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    }

    return stars;
  };

  return (
    <>
      <Header />
      <PageHeader title="Seller Details" />
      <div className="seller-details-container">
        <div className="seller-details-sidebar">
          <div className="seller-profile-card">
            {sellerData.isTopSeller && (
              <div className="top-seller-badge">Top Seller</div>
            )}
            
            <div className="seller-avatar">
              <img src={sellerData.avatar} alt={sellerData.name} />
            </div>

            <h2 className="seller-name">{sellerData.name}</h2>
            
            <div className="seller-rating">
              {renderStars(sellerData.rating)}
              <span className="rating-text">
                {sellerData.rating} ({sellerData.totalReviews} Reviews)
              </span>
            </div>

            <div className="seller-stats">
              <div className="stat-item">
                <span className="stat-label">Location</span>
                <span className="stat-value">{sellerData.location}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Gigs</span>
                <span className="stat-value">3</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Jobs</span>
                <span className="stat-value">2</span>
              </div>
            </div>

            <div className="seller-details-info">
              <div className="info-row">
                <span className="info-label">Location:</span>
                <span className="info-value">{sellerData.location}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Member Since:</span>
                <span className="info-value">{sellerData.memberSince}</span>
              </div>
            </div>

            <button className="contact-btn">
              Contact Me →
            </button>

            <div className="about-section">
              <h3>About Description</h3>
              <p>{sellerData.description}</p>
            </div>

            <div className="skills-section">
              <h3>Skills</h3>
              <div className="skills-tags">
                {sellerData.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="seller-details-main">
          <div className="seller-tabs">
            <button 
              className={`tab-btn ${activeTab === 'Gigs' ? 'active' : ''}`}
              onClick={() => handleTabClick('Gigs')}
            >
              Gigs
            </button>
            <button 
              className={`tab-btn ${activeTab === 'Portfolio' ? 'active' : ''}`}
              onClick={() => handleTabClick('Portfolio')}
            >
              Portfolio
            </button>
            <button 
              className={`tab-btn ${activeTab === 'Reviews' ? 'active' : ''}`}
              onClick={() => handleTabClick('Reviews')}
            >
              Reviews
            </button>
            <button 
              className={`tab-btn ${activeTab === 'Jobs' ? 'active' : ''}`}
              onClick={() => handleTabClick('Jobs')}
            >
              Jobs
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'Gigs' && (
              <div className="gigs-grid">
                {gigs.map((gig) => (
                  <div key={gig.id} className="gig-card">
                    <div className="gig-image">
                      <img src={gig.image} alt={gig.title} />
                      <button 
                        className={`favorite-btn ${gig.favorite ? 'active' : ''}`}
                        onClick={() => toggleFavorite(gig.id)}
                      >
                        ♡
                      </button>
                    </div>
                    
                    <div className="gig-content">
                      <div className="gig-price">{gig.price}</div>
                      
                      <div className="gig-rating">
                        {renderStars(gig.rating)}
                        <span className="rating-text">
                          {gig.rating} ({gig.reviews})
                        </span>
                      </div>

                      <h4 className="gig-title">{gig.title}</h4>

                      <div className="gig-seller">
                        <img src={sellerData.avatar} alt={sellerData.name} />
                        <span>{sellerData.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'Portfolio' && (
              <div className="portfolio-content">
                <p>Portfolio content will be displayed here.</p>
              </div>
            )}

            {activeTab === 'Reviews' && (
              <div className="reviews-content">
                <p>Reviews content will be displayed here.</p>
              </div>
            )}

            {activeTab === 'Jobs' && (
              <div className="jobs-content">
                <p>Jobs content will be displayed here.</p>
              </div>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}