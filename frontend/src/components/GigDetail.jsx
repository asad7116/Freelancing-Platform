import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, RefreshCw, DollarSign, Calendar, Edit } from 'lucide-react';
import '../styles/gig_detail.css';

const GigDetail = () => {
  const { gigId } = useParams();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchGigDetails();
  }, [gigId]);

  const fetchGigDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gigs/${gigId}`, {
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
      {/* Header */}
      <div className="gig-detail-header">
        <button onClick={handleBackClick} className="back-btn">
          <ArrowLeft size={18} />
          Back
        </button>
        
        <div className="gig-actions">
          <button onClick={handleEditGig} className="edit-gig-btn">
            <Edit size={16} />
            Edit Gig
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="gig-detail-content">
        {/* Left Column - Images and Gallery */}
        <div className="gig-images-section">
          <div className="main-image-container">
            {gig.thumbnailImage ? (
              <img 
                src={`/uploads/${gig.thumbnailImage}`} 
                alt={gig.gigTitle}
                className="main-gig-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="placeholder-image" style={{ display: gig.thumbnailImage ? 'none' : 'flex' }}>
              <span>🎨</span>
              <p>No Image Available</p>
            </div>
          </div>

          {/* Gallery Images */}
          {gig.galleryImages && gig.galleryImages.length > 0 && (
            <div className="gallery-section">
              <h3>Gallery</h3>
              <div className="gallery-container">
                <button onClick={prevImage} className="gallery-nav prev" disabled={gig.galleryImages.length <= 1}>
                  ‹
                </button>
                
                <div className="gallery-images">
                  {gig.galleryImages.map((image, index) => (
                    <div 
                      key={index} 
                      className={`gallery-image ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
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
                
                <button onClick={nextImage} className="gallery-nav next" disabled={gig.galleryImages.length <= 1}>
                  ›
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Gig Details */}
        <div className="gig-info-section">
          <div className="gig-header-info">
            <h1 className="gig-title">{gig.gigTitle}</h1>
            <div className="gig-category-tag">{gig.category}</div>
          </div>

          <div className="gig-pricing">
            <div className="price-display">
              <DollarSign size={24} />
              <span className="price">${parseFloat(gig.price).toFixed(2)}</span>
            </div>
          </div>

          <div className="gig-description">
            <h3>Description</h3>
            <p>{gig.shortDescription}</p>
          </div>

          {gig.additionalNotes && (
            <div className="gig-notes">
              <h3>Additional Notes</h3>
              <p>{gig.additionalNotes}</p>
            </div>
          )}

          <div className="gig-details-grid">
            <div className="detail-item">
              <div className="detail-icon">
                <Clock size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Delivery Time</span>
                <span className="detail-value">
                  {gig.deliveryTime} {gig.deliveryTime === 1 ? 'day' : 'days'}
                </span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <RefreshCw size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Revisions</span>
                <span className="detail-value">
                  {gig.revisions} {gig.revisions === 1 ? 'revision' : 'revisions'}
                </span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <Calendar size={18} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Created</span>
                <span className="detail-value">{formatDate(gig.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="gig-actions-section">
            <button className="primary-btn contact-btn">
              Contact Seller
            </button>
            <button className="secondary-btn order-btn">
              Order Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigDetail;