import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../lib/api";
import "../../styles/CreateGig.css";
import AIAssistant from "../../components/AI/AIAssistant";
import GigAnalyzer from "../../components/AI/GigAnalyzer";
import PriceRecommendation from "../../components/AI/PriceRecommendation";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";

export default function CreateGig() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
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
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.gigTitle.trim()) newErrors.gigTitle = "Gig title is required";
      if (!formData.category) newErrors.category = "Category is required";
      if (!formData.shortDescription.trim()) newErrors.shortDescription = "Description is required";
    }
    if (step === 2) {
      if (!formData.price || Number(formData.price) < 5) newErrors.price = "Price must be at least $5";
    }
    if (step === 3) {
      if (!formData.deliveryTime) newErrors.deliveryTime = "Delivery time is required";
      if (!formData.revisions) newErrors.revisions = "Number of revisions is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setSubmitting(true);
    setSubmitError("");

    const formDataToSend = new FormData();
    formDataToSend.append("gigTitle", formData.gigTitle);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("shortDescription", formData.shortDescription);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("deliveryTime", formData.deliveryTime);
    formDataToSend.append("revisions", formData.revisions);
    formDataToSend.append("additionalNotes", formData.additionalNotes);

    if (formData.thumbnailImage) {
      formDataToSend.append("thumbnailImage", formData.thumbnailImage);
    }

    formData.galleryImages.forEach((file) => {
      formDataToSend.append("galleryImages", file);
    });

    try {
      const res = await fetch(`${API_BASE_URL}/api/gigs`, {
        method: "POST",
        body: formDataToSend,
        credentials: 'include',
      });

      const data = await res.json();
      
      if (!res.ok) {
        setSubmitError(data.message || `Error: ${res.status} ${res.statusText}`);
        setSubmitting(false);
        return;
      }
      
      if (data.gig) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/freelancer/Gigs");
        }, 2500);
      } else {
        setSubmitError(data.message || "Failed to create gig");
      }
    } catch (err) {
      console.error(err);
      setSubmitError("Error submitting gig: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="step-content">
      <h2>Step 1: Basic Information</h2>
      <div className="form-group">
        <label htmlFor="gigTitle">Gig Title *</label>
        <input
          type="text"
          id="gigTitle"
          name="gigTitle"
          value={formData.gigTitle}
          onChange={handleInputChange}
          placeholder="Enter your gig title"
          className={errors.gigTitle ? "input-error" : ""}
          required
        />
        {errors.gigTitle && <span className="field-error">{errors.gigTitle}</span>}
        <AIAssistant
          type="title"
          value={formData.gigTitle}
          category={formData.category}
          onApply={(improvedTitle) => {
            setFormData(prev => ({ ...prev, gigTitle: improvedTitle }));
          }}
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category *</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className={errors.category ? "input-error" : ""}
          required
        >
          <option value="">Select a category</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && <span className="field-error">{errors.category}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="shortDescription">Short Description *</label>
        <textarea
          id="shortDescription"
          name="shortDescription"
          value={formData.shortDescription}
          onChange={handleInputChange}
          placeholder="Describe your gig in a few sentences"
          rows="4"
          className={errors.shortDescription ? "input-error" : ""}
          required
        />
        {errors.shortDescription && <span className="field-error">{errors.shortDescription}</span>}
        <AIAssistant
          type="description"
          value={formData.shortDescription}
          category={formData.category}
          title={formData.gigTitle}
          onApply={(enhancedDescription) => {
            setFormData(prev => ({ ...prev, shortDescription: enhancedDescription }));
          }}
        />
      </div>

      {/* AI Gig Analyzer */}
      <GigAnalyzer gigData={formData} />
    </div>
  );

  const renderStep2 = () => (
    <div className="step-content">
      <h2>Step 2: Images & Pricing</h2>

      <div className="form-group">
        <label htmlFor="thumbnailImage">Thumbnail Image *</label>
        <input
          type="file"
          id="thumbnailImage"
          name="thumbnailImage"
          onChange={handleThumbnailChange}
          accept="image/*"
          required
        />
        <small className="file-info">
          This will be the main image displayed for your gig
        </small>
        {formData.thumbnailImage && (
          <small className="file-selected">
            Selected: {formData.thumbnailImage.name}
          </small>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="galleryImages">Gallery Images (Max 3)</label>
        <input
          type="file"
          id="galleryImages"
          name="galleryImages"
          onChange={handleGalleryChange}
          multiple
          accept="image/*"
        />
        <small className="file-info">
          Additional images to showcase your work (optional, max 3 images)
        </small>
        {formData.galleryImages.length > 0 && (
          <small className="file-selected">
            {formData.galleryImages.length} gallery image(s) selected
          </small>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="price">Price ($) *</label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          placeholder="Enter your price"
          min="5"
          className={errors.price ? "input-error" : ""}
          required
        />
        {errors.price && <span className="field-error">{errors.price}</span>}
        <PriceRecommendation
          gigData={formData}
          onApplyPrice={(recommendedPrice) => {
            setFormData(prev => ({ ...prev, price: recommendedPrice }));
          }}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-content">
      <h2>Step 3: Delivery & Requirements</h2>
      <div className="form-group">
        <label htmlFor="deliveryTime">Delivery Time *</label>
        <select
          id="deliveryTime"
          name="deliveryTime"
          value={formData.deliveryTime}
          onChange={handleInputChange}
          className={errors.deliveryTime ? "input-error" : ""}
          required
        >
          <option value="">Select delivery time</option>
          <option value="1">1 Day</option>
          <option value="3">3 Days</option>
          <option value="7">7 Days</option>
          <option value="14">14 Days</option>
        </select>
        {errors.deliveryTime && <span className="field-error">{errors.deliveryTime}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="revisions">Number of Revisions *</label>
        <select
          id="revisions"
          name="revisions"
          value={formData.revisions}
          onChange={handleInputChange}
          className={errors.revisions ? "input-error" : ""}
          required
        >
          <option value="">Select revisions</option>
          <option value="1">1 Revision</option>
          <option value="2">2 Revisions</option>
          <option value="3">3 Revisions</option>
          <option value="unlimited">Unlimited</option>
        </select>
        {errors.revisions && <span className="field-error">{errors.revisions}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="additionalNotes">Additional Notes</label>
        <textarea
          id="additionalNotes"
          name="additionalNotes"
          value={formData.additionalNotes}
          onChange={handleInputChange}
          placeholder="Any additional requirements or notes for buyers"
          rows="4"
        />
      </div>
    </div>
  );

  return (
    <>
      <div className="create-gig-container">
        {success ? (
          <div className="gig-success-message">
            <CheckCircle size={64} className="gig-success-icon" />
            <h2>Gig Created Successfully! 🎉</h2>
            <p>Your gig is now live and visible to clients.</p>
            <p className="gig-redirect-text">Redirecting to My Gigs...</p>
          </div>
        ) : (
        <div className="create-gig-wrapper">
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
            <div className="progress-steps">
              <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
                <span>1</span>
                <p>Basic Info</p>
              </div>
              <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
                <span>2</span>
                <p>Images & Price</p>
              </div>
              <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
                <span>3</span>
                <p>Delivery</p>
              </div>
            </div>
          </div>

          <div className="form-container">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            <div className="button-container">
              {currentStep > 1 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={prevStep}
                >
                  Previous
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={nextStep}
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader size={18} className="spin-icon" />
                      Creating...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              )}
            </div>

            {submitError && (
              <div className="gig-error-banner">
                <AlertCircle size={18} />
                {submitError}
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </>
  );
}
