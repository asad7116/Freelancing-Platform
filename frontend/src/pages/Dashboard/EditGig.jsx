import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import "../../styles/CreateGig.css";

export default function EditGig() {
  const { gigId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    gigTitle: "",
    category: "",
    shortDescription: "",
    thumbnailImage: null,
    galleryImages: [],
    price: "",
    deliveryTime: "",
    revisions: "",
    additionalNotes: "",
  });

  const categories = [
    "Web Development",
    "Mobile Development",
    "UI/UX Design",
    "Digital Marketing",
    "Content Writing",
    "Video Editing",
    "Graphic Design",
    "Data Entry",
    "Translation",
    "Virtual Assistant",
  ];

  useEffect(() => {
    fetchGigData();
  }, [gigId]);

  const fetchGigData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gigs/${gigId}`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        const gig = data.gig;
        setFormData({
          gigTitle: gig.gigTitle || "",
          category: gig.category || "",
          shortDescription: gig.shortDescription || "",
          thumbnailImage: null, // Keep null for new uploads
          galleryImages: [],    // Keep empty for new uploads
          price: gig.price?.toString() || "",
          deliveryTime: gig.deliveryTime?.toString() || "",
          revisions: gig.revisions?.toString() || "",
          additionalNotes: gig.additionalNotes || "",
          // Store existing images for reference
          existingThumbnail: gig.thumbnailImage,
          existingGallery: gig.galleryImages || []
        });
      } else {
        setError(data.message || 'Failed to fetch gig data');
      }
    } catch (error) {
      console.error('Error fetching gig data:', error);
      setError('Error fetching gig data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      thumbnailImage: file,
    }));
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3); // Limit to 3 files
    setFormData((prev) => ({
      ...prev,
      galleryImages: files,
    }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.gigTitle || !formData.category || !formData.shortDescription || 
        !formData.price || !formData.deliveryTime || !formData.revisions) {
      alert("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const submitData = new FormData();
      
      // Add text fields
      submitData.append("gigTitle", formData.gigTitle);
      submitData.append("category", formData.category);
      submitData.append("shortDescription", formData.shortDescription);
      submitData.append("price", parseFloat(formData.price));
      submitData.append("deliveryTime", parseInt(formData.deliveryTime));
      submitData.append("revisions", parseInt(formData.revisions));
      submitData.append("additionalNotes", formData.additionalNotes);

      // Add thumbnail image if provided
      if (formData.thumbnailImage) {
        submitData.append("thumbnailImage", formData.thumbnailImage);
      }

      // Add gallery images if provided
      if (formData.galleryImages && formData.galleryImages.length > 0) {
        formData.galleryImages.forEach((image, index) => {
          submitData.append("galleryImages", image);
        });
      }

      const response = await fetch(`/api/gigs/${gigId}`, {
        method: "PUT",
        body: submitData,
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success || response.ok) {
        alert("Gig updated successfully!");
        navigate('/freelancer/Gigs'); // Navigate back to gigs dashboard
      } else {
        throw new Error(result.message || "Failed to update gig");
      }
    } catch (error) {
      console.error("Error updating gig:", error);
      setError(error.message || "Failed to update gig");
      alert("Error updating gig: " + (error.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="create-gig-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading gig data...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.gigTitle) {
    return (
      <div className="create-gig-container">
        <div className="error-state">
          <h2>Error Loading Gig</h2>
          <p>{error}</p>
          <button onClick={handleCancel} className="cancel-btn">
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-gig-container">
      <div className="create-gig-header">
        <button onClick={handleCancel} className="back-btn">
          <ArrowLeft size={18} />
          Cancel
        </button>
        <h1>Edit Gig</h1>
        <div className="header-actions">
          <button onClick={handleSubmit} className="save-btn" disabled={saving}>
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <X size={16} />
          {error}
        </div>
      )}

      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentStep / 3) * 100}%` }}
          ></div>
        </div>
        <div className="step-indicators">
          <span className={currentStep >= 1 ? "active" : ""}>1. Basic Info</span>
          <span className={currentStep >= 2 ? "active" : ""}>2. Media</span>
          <span className={currentStep >= 3 ? "active" : ""}>3. Pricing</span>
        </div>
      </div>

      <form className="create-gig-form" onSubmit={handleSubmit}>
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="form-step">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label htmlFor="gigTitle">Gig Title *</label>
              <input
                type="text"
                id="gigTitle"
                name="gigTitle"
                value={formData.gigTitle}
                onChange={handleInputChange}
                placeholder="I will design a professional logo for your business"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="shortDescription">Description *</label>
              <textarea
                id="shortDescription"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                placeholder="Describe what you'll deliver and what makes your gig special"
                rows={4}
                required
              />
            </div>

            <div className="form-navigation">
              <button type="button" onClick={nextStep} className="next-btn">
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Media Upload */}
        {currentStep === 2 && (
          <div className="form-step">
            <h2>Images & Media</h2>
            
            <div className="form-group">
              <label htmlFor="thumbnailImage">Thumbnail Image</label>
              <div className="current-media">
                {formData.existingThumbnail && (
                  <div className="current-thumbnail">
                    <p>Current thumbnail:</p>
                    <img 
                      src={`/uploads/${formData.existingThumbnail}`} 
                      alt="Current thumbnail"
                      style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </div>
                )}
              </div>
              <input
                type="file"
                id="thumbnailImage"
                name="thumbnailImage"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
              <small>Upload a new image to replace the current thumbnail (optional)</small>
            </div>

            <div className="form-group">
              <label htmlFor="galleryImages">Gallery Images (Max 3)</label>
              <div className="current-media">
                {formData.existingGallery && formData.existingGallery.length > 0 && (
                  <div className="current-gallery">
                    <p>Current gallery images:</p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {formData.existingGallery.map((image, index) => (
                        <img 
                          key={index}
                          src={`/uploads/${image}`} 
                          alt={`Gallery ${index + 1}`}
                          style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <input
                type="file"
                id="galleryImages"
                name="galleryImages"
                accept="image/*"
                multiple
                onChange={handleGalleryChange}
              />
              <small>Upload new images to replace the current gallery (optional)</small>
            </div>

            <div className="form-navigation">
              <button type="button" onClick={prevStep} className="prev-btn">
                Previous
              </button>
              <button type="button" onClick={nextStep} className="next-btn">
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Pricing & Details */}
        {currentStep === 3 && (
          <div className="form-step">
            <h2>Pricing & Delivery</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price (USD) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="25"
                  min="5"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="deliveryTime">Delivery Time (Days) *</label>
                <select
                  id="deliveryTime"
                  name="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select delivery time</option>
                  <option value="1">1 Day</option>
                  <option value="2">2 Days</option>
                  <option value="3">3 Days</option>
                  <option value="5">5 Days</option>
                  <option value="7">1 Week</option>
                  <option value="14">2 Weeks</option>
                  <option value="21">3 Weeks</option>
                  <option value="30">1 Month</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="revisions">Number of Revisions *</label>
              <select
                id="revisions"
                name="revisions"
                value={formData.revisions}
                onChange={handleInputChange}
                required
              >
                <option value="">Select revisions</option>
                <option value="0">No Revisions</option>
                <option value="1">1 Revision</option>
                <option value="2">2 Revisions</option>
                <option value="3">3 Revisions</option>
                <option value="5">5 Revisions</option>
                <option value="-1">Unlimited Revisions</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="additionalNotes">Additional Notes</label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                placeholder="Any additional information about your gig..."
                rows={3}
              />
            </div>

            <div className="form-navigation">
              <button type="button" onClick={prevStep} className="prev-btn">
                Previous
              </button>
              <button type="submit" className="submit-btn" disabled={saving}>
                {saving ? 'Updating...' : 'Update Gig'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}