import React, { useState, useRef } from 'react';
import { API_BASE_URL } from '../../lib/api';
import '../../styles/FreelancerProfile.css';

const FreelancerProfileSetup = () => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    bio: '',
    skills: '',
    hourlyRate: '',
    experience: '',
    location: '',
    portfolioUrl: '',
    profileImage: null,
  });

  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const requiredFields = ['title', 'bio', 'skills', 'hourlyRate', 'profileImage'];

  const calculateCompletion = () => {
    const filledFields = requiredFields.filter(
      (field) => formData[field] || preview
    ).length;
    return (filledFields / requiredFields.length) * 100;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        profileImage: 'Please upload a valid image file',
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      profileImage: file,
    }));

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result);
    };
    reader.readAsDataURL(file);

    setErrors((prev) => ({
      ...prev,
      profileImage: '',
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    }
    if (!formData.skills.trim()) {
      newErrors.skills = 'At least one skill is required';
    }
    if (!formData.hourlyRate || formData.hourlyRate <= 0) {
      newErrors.hourlyRate = 'Valid hourly rate is required';
    }
    if (!formData.profileImage && !preview) {
      newErrors.profileImage = 'Profile image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('bio', formData.bio);
      submitData.append('skills', formData.skills);
      submitData.append('hourlyRate', formData.hourlyRate);
      submitData.append('experience', formData.experience || 0);
      submitData.append('location', formData.location);
      submitData.append('portfolioUrl', formData.portfolioUrl);
      if (formData.profileImage) {
        submitData.append('profileImage', formData.profileImage);
      }

      const response = await fetch(`${API_BASE_URL}/api/freelancer/profile`, {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setMessage({
        type: 'success',
        text: 'Profile created successfully!',
      });

      // Reset form
      setFormData({
        title: '',
        bio: '',
        skills: '',
        hourlyRate: '',
        experience: '',
        location: '',
        portfolioUrl: '',
        profileImage: null,
      });
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to create profile. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completion = calculateCompletion();

  return (
    <div className="freelancer-container">
      <div className="freelancer-card">
        <h1 className="freelancer-title">Create Your Freelancer Profile</h1>

        <div className="progress-section">
          <div className="progress-label">
            <span>Profile Completion</span>
            <span className="progress-percent">{Math.round(completion)}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${completion}%` }}
            ></div>
          </div>
        </div>

        {message && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="freelancer-form">
          <div className="form-grid">
            {/* Profile Image Upload */}
            <div className="form-group form-group-full">
              <label htmlFor="profileImage" className="form-label">
                Profile Image <span className="required">*</span>
              </label>
              <div className="image-upload-section">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input"
                />
                <label htmlFor="profileImage" className="upload-label">
                  <div className="upload-content">
                    <span className="upload-icon">📸</span>
                    <span className="upload-text">
                      Click to upload or drag and drop
                    </span>
                  </div>
                </label>
                {preview && (
                  <div className="image-preview">
                    <img src={preview} alt="Preview" />
                  </div>
                )}
              </div>
              {errors.profileImage && (
                <span className="error-message">{errors.profileImage}</span>
              )}
            </div>

            {/* Title */}
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Professional Title <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Full Stack Developer"
                className={`form-input ${errors.title ? 'input-error' : ''}`}
              />
              {errors.title && (
                <span className="error-message">{errors.title}</span>
              )}
            </div>

            {/* Hourly Rate */}
            <div className="form-group">
              <label htmlFor="hourlyRate" className="form-label">
                Hourly Rate <span className="required">*</span>
              </label>
              <div className="input-with-prefix">
                <span className="input-prefix">$</span>
                <input
                  type="number"
                  id="hourlyRate"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                  placeholder="50"
                  min="0"
                  step="0.01"
                  className={`form-input ${errors.hourlyRate ? 'input-error' : ''}`}
                />
              </div>
              {errors.hourlyRate && (
                <span className="error-message">{errors.hourlyRate}</span>
              )}
            </div>

            {/* Bio */}
            <div className="form-group form-group-full">
              <label htmlFor="bio" className="form-label">
                Bio <span className="required">*</span>
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell clients about yourself, your experience, and what you offer..."
                rows="4"
                className={`form-textarea ${errors.bio ? 'input-error' : ''}`}
              ></textarea>
              {errors.bio && (
                <span className="error-message">{errors.bio}</span>
              )}
            </div>

            {/* Skills */}
            <div className="form-group form-group-full">
              <label htmlFor="skills" className="form-label">
                Skills <span className="required">*</span>
              </label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                placeholder="e.g., React, JavaScript, Node.js, Python"
                className={`form-input ${errors.skills ? 'input-error' : ''}`}
              />
              <small className="form-hint">
                Enter skills separated by commas
              </small>
              {errors.skills && (
                <span className="error-message">{errors.skills}</span>
              )}
            </div>

            {/* Experience */}
            <div className="form-group">
              <label htmlFor="experience" className="form-label">
                Years of Experience
              </label>
              <input
                type="number"
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="5"
                min="0"
                step="0.5"
                className="form-input"
              />
            </div>

            {/* Location */}
            <div className="form-group">
              <label htmlFor="location" className="form-label">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., San Francisco, CA"
                className="form-input"
              />
            </div>

            {/* Portfolio URL */}
            <div className="form-group form-group-full">
              <label htmlFor="portfolioUrl" className="form-label">
                Portfolio URL
              </label>
              <input
                type="url"
                id="portfolioUrl"
                name="portfolioUrl"
                value={formData.portfolioUrl}
                onChange={handleInputChange}
                placeholder="https://yourportfolio.com"
                className="form-input"
              />
            </div>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Profile...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FreelancerProfileSetup;