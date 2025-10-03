import React, { useState, useEffect } from 'react';
import '../styles/post_job.css';

const PostJobForm = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category_id: '',
    city_id: '',
    regular_price: '',
    job_type: 'Hourly',
    description: '',
    thumb_image: null
  });

  const [errors, setErrors] = useState({});

  // Generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  };

  // Handle title change and auto-generate slug
  const handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = generateSlug(title);
    
    setFormData(prev => ({
      ...prev,
      title,
      slug
    }));
    
    if (errors.title) {
      setErrors(prev => ({ ...prev, title: '' }));
    }
  };

  // Fetch categories and cities on component mount
  useEffect(() => {
    fetchCategories();
    fetchCities();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      console.log('Categories response:', data); // Debug log
      
      if (data.success) {
        setCategories(data.data);
      } else {
        console.error('Failed to fetch categories:', data.message);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/cities');
      const data = await response.json();
      console.log('Cities response:', data); // Debug log
      
      if (data.success) {
        setCities(data.data);
      } else {
        console.error('Failed to fetch cities:', data.message);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      description: value
    }));
    
    if (errors.description) {
      setErrors(prev => ({ ...prev, description: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        thumb_image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }
    
    if (!formData.city_id) {
      newErrors.city_id = 'City is required';
    }
    
    if (!formData.regular_price) {
      newErrors.regular_price = 'Price is required';
    } else if (isNaN(formData.regular_price) || parseFloat(formData.regular_price) <= 0) {
      newErrors.regular_price = 'Price must be a valid positive number';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const submitData = new FormData();
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        if (key === 'thumb_image' && formData[key]) {
          submitData.append(key, formData[key]);
        } else if (key !== 'thumb_image') {
          submitData.append(key, formData[key]);
        }
      });

      console.log('Submitting job post data:', Object.fromEntries(submitData)); // Debug log

      const response = await fetch('/api/job-posts', {
        method: 'POST',
        credentials: 'include', // This sends cookies automatically
        body: submitData
      });

      console.log('Response status:', response.status); // Debug log
      const result = await response.json();
      console.log('Response data:', result); // Debug log

      if (response.ok) {
        alert('Job posted successfully!');
        // Reset form
        setFormData({
          title: '',
          slug: '',
          category_id: '',
          city_id: '',
          regular_price: '',
          job_type: 'Hourly',
          description: '',
          thumb_image: null
        });
        setImagePreview(null);
      } else {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          alert(result.message || 'Error creating job post');
        }
      }
    } catch (error) {
      console.error('Error submitting job post:', error);
      alert('Error submitting job post: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="dashboard-main min-vh-100">
      <div className="job-post-container">
        {/* Page Header */}
        <div className="page-header">
          <h3 className="page-title">Post a Job</h3>
          <nav className="breadcrumb-nav">
            <span className="breadcrumb-item">Dashboard</span>
            <svg className="breadcrumb-separator" width="5" height="11" viewBox="0 0 5 11">
              <path d="M1 10L4 5.5L1 1" stroke="#5B5B5B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="breadcrumb-item active">Post a Job</span>
          </nav>
        </div>

        {/* Content */}
        <div className="job-post-content">
          <div className="form-wrapper">
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="form-sections">
                
                {/* Job Info Card */}
                <div className="gig-info-card">
                  <div className="gig-info-header">
                    <h4 className="card-title">Job Info</h4>
                  </div>
                  <div className="gig-info-body">
                    <div className="form-grid">
                      
                      {/* Job Title */}
                      <div className="form-group full-width">
                        <label htmlFor="title" className="form-label">
                          Job Title <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.title ? 'error' : ''}`}
                          placeholder="Enter job title"
                          name="title"
                          value={formData.title}
                          onChange={handleTitleChange}
                          id="title"
                        />
                        {errors.title && <span className="error-message">{errors.title}</span>}
                      </div>

                      {/* Slug */}
                      <div className="form-group full-width">
                        <label htmlFor="slug" className="form-label">
                          Slug <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.slug ? 'error' : ''}`}
                          placeholder="job-slug"
                          name="slug"
                          value={formData.slug}
                          onChange={handleInputChange}
                          id="slug"
                        />
                        {errors.slug && <span className="error-message">{errors.slug}</span>}
                      </div>

                      {/* Category */}
                      <div className="form-group half-width">
                        <label htmlFor="category_id" className="form-label">
                          Category <span className="required">*</span>
                        </label>
                        <select
                          className={`form-select ${errors.category_id ? 'error' : ''}`}
                          name="category_id"
                          value={formData.category_id}
                          onChange={handleInputChange}
                          id="category_id"
                        >
                          <option value="">Select Category</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        {errors.category_id && <span className="error-message">{errors.category_id}</span>}
                      </div>

                      {/* City */}
                      <div className="form-group half-width">
                        <label htmlFor="city_id" className="form-label">
                          City <span className="required">*</span>
                        </label>
                        <select
                          className={`form-select ${errors.city_id ? 'error' : ''}`}
                          name="city_id"
                          value={formData.city_id}
                          onChange={handleInputChange}
                          id="city_id"
                        >
                          <option value="">Select City</option>
                          {cities.map(city => (
                            <option key={city.id} value={city.id}>
                              {city.name}
                            </option>
                          ))}
                        </select>
                        {errors.city_id && <span className="error-message">{errors.city_id}</span>}
                      </div>

                      {/* Price */}
                      <div className="form-group half-width">
                        <label htmlFor="regular_price" className="form-label">
                          Start from <span className="required">*</span>
                        </label>
                        <input
                          type="number"
                          className={`form-control ${errors.regular_price ? 'error' : ''}`}
                          placeholder="Enter price"
                          name="regular_price"
                          value={formData.regular_price}
                          onChange={handleInputChange}
                          id="regular_price"
                          min="0"
                          step="0.01"
                        />
                        {errors.regular_price && <span className="error-message">{errors.regular_price}</span>}
                      </div>

                      {/* Job Type */}
                      <div className="form-group half-width">
                        <label htmlFor="job_type" className="form-label">Job Type</label>
                        <select
                          className="form-select"
                          name="job_type"
                          value={formData.job_type}
                          onChange={handleInputChange}
                          id="job_type"
                        >
                          <option value="Hourly">Hourly</option>
                          <option value="Daily">Daily</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Yearly">Yearly</option>
                        </select>
                      </div>

                      {/* Description */}
                      <div className="form-group full-width">
                        <label htmlFor="description" className="form-label">
                          Description <span className="required">*</span>
                        </label>
                        <textarea
                          className={`form-control ${errors.description ? 'error' : ''}`}
                          placeholder="Describe your job requirements..."
                          name="description"
                          value={formData.description}
                          onChange={handleDescriptionChange}
                          id="description"
                          rows="6"
                        />
                        {errors.description && <span className="error-message">{errors.description}</span>}
                      </div>

                    </div>
                  </div>
                </div>

                {/* Upload Image Card */}
                <div className="gig-info-card">
                  <div className="gig-info-header">
                    <h4 className="card-title">Upload Image</h4>
                  </div>
                  <div className="gig-info-body">
                    <p className="upload-subtitle">Thumbnail Image</p>
                    <div className="file-upload-wrapper">
                      <label htmlFor="thumb_image" className="gig-file-upload">
                        <img
                          className="gig-img-icon"
                          src={imagePreview || "https://via.placeholder.com/150x150?text=Choose+File"}
                          alt="Preview"
                        />
                        <p className="upload-text">Choose File</p>
                        <input
                          className="file-input"
                          type="file"
                          name="thumb_image"
                          id="thumb_image"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="submit-section">
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Now'}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="10"
                      viewBox="0 0 14 10"
                      fill="none"
                    >
                      <path
                        d="M9 9L13 5M13 5L9 1M13 5L1 5"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PostJobForm;