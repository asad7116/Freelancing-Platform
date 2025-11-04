import React, { useState } from "react";
import "../../styles/CreateGig.css";

export default function CreateGig() {
  const [currentStep, setCurrentStep] = useState(1);
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
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Ensure all required fields are filled
    if (
      !formData.gigTitle ||
      !formData.category ||
      !formData.shortDescription ||
      !formData.price ||
      !formData.deliveryTime ||
      !formData.revisions
    ) {
      alert("Please fill all required fields.");
      return;
    }

    // Debug: log cookies
    console.log("Document cookies:", document.cookie);

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
      const res = await fetch("http://localhost:4000/api/gigs", {
        method: "POST",
        body: formDataToSend,
        credentials: 'include', // ✅ Include cookies for authentication
      });

      const data = await res.json();
      
      if (!res.ok) {
        // Handle error responses
        alert(data.message || `Error: ${res.status} ${res.statusText}`);
        console.error("Error response:", data);
        return;
      }
      
      if (data.gig) {
        // Assuming the backend sends the 'gig' data
        alert("Gig created successfully!");
        console.log("Saved:", data.gig);
        // Optionally redirect to gigs page
        // window.location.href = "/freelancer/Gigs";
      } else {
        alert(data.message || "Failed to create gig");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting gig: " + err.message);
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
          {categories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </select>
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
          required
        />
      </div>
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
          required
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
          required
        >
          <option value="">Select delivery time</option>
          <option value="1">1 Day</option>
          <option value="3">3 Days</option>
          <option value="7">7 Days</option>
          <option value="14">14 Days</option>
        </select>
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
          <option value="1">1 Revision</option>
          <option value="2">2 Revisions</option>
          <option value="3">3 Revisions</option>
          <option value="unlimited">Unlimited</option>
        </select>
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
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
