import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageHeader from "../components/PageHeader";
import "../styles/SellerDetails.css";

export default function SellerDetails() {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState('Gigs');
  const [sellerData, setSellerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSellerDetails();
  }, [username]);

  const fetchSellerDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/api/freelancers/${username}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch freelancer details");
      }

      const data = await response.json();
      
      if (data.success) {
        setSellerData(data.data);
      } else {
        throw new Error(data.message || "Failed to load freelancer");
      }
    } catch (err) {
      console.error("Error fetching freelancer details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const toggleFavorite = (gigId) => {
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

  if (loading) {
    return (
      <>
        <Header />
        <PageHeader title="Seller Details" />
        <div className="container" style={{ textAlign: "center", padding: "50px" }}>
          <p>Loading freelancer details...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !sellerData) {
    return (
      <>
        <Header />
        <PageHeader title="Seller Details" />
        <div className="container" style={{ textAlign: "center", padding: "50px" }}>
          <p style={{ color: "red" }}>Error: {error || "Freelancer not found"}</p>
          <button onClick={fetchSellerDetails}>Retry</button>
        </div>
        <Footer />
      </>
    );
  }

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
              <img 
                src={sellerData.avatar?.startsWith('/uploads') ? `http://localhost:4000${sellerData.avatar}` : sellerData.avatar} 
                alt={sellerData.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/Freelancers/default-avatar.png';
                }}
              />
            </div>

            <h2 className="seller-name">{sellerData.name}</h2>
            
            <div className="seller-rating">
              {renderStars(sellerData.rating || 0)}
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
                <span className="stat-value">{sellerData.totalGigs || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Proposals</span>
                <span className="stat-value">{sellerData.proposalsCount || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Hourly Rate</span>
                <span className="stat-value">${sellerData.hourlyRate || 0}/hr</span>
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
              {sellerData.yearsOfExperience > 0 && (
                <div className="info-row">
                  <span className="info-label">Experience:</span>
                  <span className="info-value">{sellerData.yearsOfExperience} years</span>
                </div>
              )}
            </div>

            <button className="contact-btn">
              Contact Me →
            </button>

            <div className="about-section">
              <h3>About Description</h3>
              <p>{sellerData.description || "No description available."}</p>
            </div>

            {sellerData.skills && sellerData.skills.length > 0 && (
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
            )}

            {sellerData.languages && sellerData.languages.length > 0 && (
              <div className="skills-section">
                <h3>Languages</h3>
                <div className="skills-tags">
                  {sellerData.languages.map((lang, index) => (
                    <span key={index} className="skill-tag">
                      {typeof lang === 'string' ? lang : lang.language}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
                {sellerData.gigs && sellerData.gigs.length > 0 ? (
                  sellerData.gigs.map((gig) => (
                    <div key={gig.id} className="gig-card">
                      <div className="gig-image">
                        <img 
                          src={gig.image?.startsWith('/uploads') ? `http://localhost:4000${gig.image}` : gig.image} 
                          alt={gig.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/assets/default-gig.png';
                          }}
                        />
                        <button 
                          className={`favorite-btn ${gig.favorite ? 'active' : ''}`}
                          onClick={() => toggleFavorite(gig.id)}
                        >
                          ♡
                        </button>
                      </div>
                      
                      <div className="gig-content">
                        <div className="gig-price">${gig.price}</div>
                        
                        <div className="gig-rating">
                          {renderStars(gig.rating || 0)}
                          <span className="rating-text">
                            {(gig.rating || 0).toFixed(1)} ({gig.reviews || 0})
                          </span>
                        </div>

                        <h4 className="gig-title">{gig.title}</h4>

                        <div className="gig-seller">
                          <img 
                            src={sellerData.avatar?.startsWith('/uploads') ? `http://localhost:4000${sellerData.avatar}` : sellerData.avatar} 
                            alt={sellerData.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/assets/Freelancers/default-avatar.png';
                            }}
                          />
                          <span>{sellerData.name}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No gigs available yet.</p>
                )}
              </div>
            )}

            {activeTab === 'Portfolio' && (
              <div className="portfolio-content">
                {sellerData.portfolio && sellerData.portfolio.length > 0 ? (
                  <div className="portfolio-grid">
                    {sellerData.portfolio.map((item, index) => (
                      <div key={index} className="portfolio-item">
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                        {item.url && (
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            View Project →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No portfolio items available yet.</p>
                )}
              </div>
            )}

            {activeTab === 'Reviews' && (
              <div className="reviews-content">
                <div className="reviews-summary">
                  <h3>Reviews Summary</h3>
                  <p>Rating: {(sellerData.rating || 0).toFixed(1)} / 5.0</p>
                  <p>Total Reviews: {sellerData.totalReviews || 0}</p>
                </div>
                <p style={{marginTop: "20px"}}>Detailed reviews will be displayed here once review system is implemented.</p>
              </div>
            )}

            {activeTab === 'Jobs' && (
              <div className="jobs-content">
                <div className="jobs-info">
                  <h3>Active Proposals</h3>
                  <p>Total Proposals Submitted: {sellerData.proposalsCount || 0}</p>
                  <p>Detailed job applications and history will be displayed here.</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}