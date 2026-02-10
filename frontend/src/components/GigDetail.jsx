import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, RefreshCw, DollarSign, Calendar, Edit } from 'lucide-react';
import '../styles/gig_detail.css';
import { API_BASE_URL } from "../lib/api";

const GigDetail = () => {
  const { gigId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Determine user role from route or localStorage
  const userRole = localStorage.getItem("role");
  const isFreelancer = userRole === "freelancer" || location.pathname.startsWith('/freelancer');

  useEffect(() => {
    fetchGigDetails();
  }, [gigId]);

  const fetchGigDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/gigs/${gigId}`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setGig(data.gig);
      } else {
        setError(data.message || 'Failed to fetch gig details');
      }
    } catch (error) {
      console.error('Error fetching gig details:', error);
      setError('Error fetching gig details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleEditGig = () => {
    navigate(`/freelancer/edit-gig/${gigId}`);
  };

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  const nextImage = () => {
    if (gig?.galleryImages && gig.galleryImages.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === gig.galleryImages.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (gig?.galleryImages && gig.galleryImages.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? gig.galleryImages.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="gig-detail-container">
        <div className="gig-detail-loading">
          <div className="loading-spinner"></div>
          <p>Loading gig details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gig-detail-container">
        <div className="gig-detail-error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleBackClick} className="back-btn">
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="gig-detail-container">
        <div className="gig-detail-error">
          <h2>Gig Not Found</h2>
          <p>The requested gig could not be found.</p>
          <button onClick={handleBackClick} className="back-btn">
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gig-detail-container">
      {/* Header Section */}
      <div className="gig-detail-header">
        <button onClick={handleBackClick} className="back-button">
          <ArrowLeft size={16} />
          Back to Gigs
        </button>
        
        <div className="gig-header-content">
          <div className="gig-thumbnail-large">
            {gig.thumbnailImage ? (
              <img 
                src={`/uploads/${gig.thumbnailImage}`} 
                alt={gig.gigTitle}
              />
            ) : (
              <div className="placeholder-thumbnail-large">
                <span>🎨</span>
              </div>
            )}
          </div>
          
          <div className="gig-header-info">
            <h1 className="gig-title-large">{gig.gigTitle}</h1>
            <div className="gig-meta-info">
              <span className="gig-category-badge">{gig.category}</span>
            </div>
            <div className="gig-stats-header">
              <div className="stat">
                <strong>${parseFloat(gig.price).toFixed(2)}</strong>
                <span>Price</span>
              </div>
              <div className="stat">
                <strong>{gig.deliveryTime} {gig.deliveryTime === 1 ? 'day' : 'days'}</strong>
                <span>Delivery</span>
              </div>
              <div className="stat">
                <strong>{formatDate(gig.created_at)}</strong>
                <span>Created</span>
              </div>
            </div>
            {/* Only show edit button for freelancers viewing their own gig */}
            {isFreelancer && (
              <button onClick={handleEditGig} className="btn-primary edit-gig-btn">
                <Edit size={16} />
                Edit Gig
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="gig-detail-content">

        <div className="main-content">
          {/* Gig Description */}
          <section className="content-section">
            <h2>Gig Description</h2>
            <div className="content-text">
              <p>{gig.shortDescription}</p>
            </div>
          </section>

          {/* Additional Notes */}
          {gig.additionalNotes && (
            <section className="content-section">
              <h2>Additional Notes</h2>
              <div className="content-text">
                <p>{gig.additionalNotes}</p>
              </div>
            </section>
          )}

          {/* Gallery Images */}
          {gig.galleryImages && gig.galleryImages.length > 0 && (
            <section className="content-section">
              <h2>Gallery</h2>
              <div className="gallery-grid">
                {gig.galleryImages.map((image, index) => (
                  <div key={index} className="gallery-item">
                    <img 
                      src={`/uploads/${image}`} 
                      alt={`Gallery ${index + 1}`}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="gallery-placeholder" style={{ display: 'none' }}>
                      📷
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="sidebar-content">
          <section className="content-section">
            <h2>Gig Details</h2>
            <div className="details-list">
              <div className="detail-row">
                <span className="detail-label">
                  <DollarSign size={16} />
                  Price
                </span>
                <span className="detail-value">${parseFloat(gig.price).toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">
                  <Clock size={16} />
                  Delivery Time
                </span>
                <span className="detail-value">{gig.deliveryTime} {gig.deliveryTime === 1 ? 'day' : 'days'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">
                  <RefreshCw size={16} />
                  Revisions
                </span>
                <span className="detail-value">{gig.revisions} {gig.revisions === 1 ? 'revision' : 'revisions'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">
                  <Calendar size={16} />
                  Created
                </span>
                <span className="detail-value">{formatDate(gig.created_at)}</span>
              </div>
            </div>
          </section>

          <section className="content-section">
            <div className="gig-actions-section">
              <button className="btn-primary contact-btn">
                Contact Seller
              </button>
              <button className="btn-secondary order-btn">
                Order Now
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default GigDetail;