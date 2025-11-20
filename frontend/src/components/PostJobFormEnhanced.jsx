// frontend/src/components/PostJobFormEnhanced.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/post_job_enhanced.css';
import { emit } from '../lib/eventBus'; // ✅ to refresh dashboard after success
import JobTitleGenerator from './AI/JobTitleGenerator';
import JobDescriptionEnhancer from './AI/JobDescriptionEnhancer';
import JobBudgetRecommender from './AI/JobBudgetRecommender';
import JobSkillsSuggester from './AI/JobSkillsSuggester';
import JobTimelineEstimator from './AI/JobTimelineEstimator';

const PostJobFormEnhanced = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(jobId);

  // Form step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Loading states
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  // Data for dropdowns
  const [categories, setCategories] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [skills, setSkills] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: About the Job
    title: '',
    summary: '',
    description: '',
    deliverables: '',
    category_id: '',
    specialty: '',

    // Step 2: Freelancer Requirements
    mandatory_skills: [],
    nice_to_have_skills: [],
    tools: [],
    experience_level: 'intermediate',
    languages: [],

    // Step 3: Budget
    budget_type: 'hourly',
    hourly_rate_from: '',
    hourly_rate_to: '',
    fixed_price: '',
    project_type: 'one-time',
    duration: '',
    hours_per_week: '',
    job_size: '',
    freelancers_needed: 1,
  });

  // Thumbnail upload state
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const [errors, setErrors] = useState({});

  // Experience level options
  const experienceLevels = [
    { value: 'entry', label: 'Entry Level', description: 'Looking for someone relatively new to this field' },
    { value: 'intermediate', label: 'Intermediate', description: 'Looking for substantial experience in this field' },
    { value: 'expert', label: 'Expert', description: 'Looking for comprehensive and deep expertise in this field' },
  ];

  // Duration options
  const durationOptions = [
    { value: '1-3-months', label: '1 to 3 months' },
    { value: '3-6-months', label: '3 to 6 months' },
    { value: '6-months-plus', label: 'More than 6 months' },
  ];

  // Hours per week options
  const hoursPerWeekOptions = [
    { value: 'less-than-30', label: 'Less than 30 hrs/week' },
    { value: '30-plus', label: '30+ hrs/week' },
  ];

  // Job size options
  const jobSizeOptions = [
    { value: 'small', label: 'Small', description: 'Quick and straightforward' },
    { value: 'medium', label: 'Medium', description: 'Well-defined project' },
    { value: 'large', label: 'Large', description: 'Larger and more complex project' },
  ];

  // Fetch initial data
  useEffect(() => {
    fetchCategories();
    fetchSkills();
    if (isEditMode && jobId) {
      fetchJobData(jobId);
    }
  }, [jobId, isEditMode]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) setCategories(data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/skills');
      const data = await response.json();
      if (data.success) setSkills(data.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const fetchSpecialties = async (categoryId) => {
    try {
      const response = await fetch(`/api/specialties?category_id=${categoryId}`);
      const data = await response.json();
      if (data.success) setSpecialties(data.data);
      else setSpecialties([]);
    } catch (error) {
      console.error('Error fetching specialties:', error);
      setSpecialties([]);
    }
  };

  const fetchJobData = async (jid) => {
    try {
      setFetchingData(true);
      const response = await fetch(`/api/job-posts/${jid}`, {
        credentials: 'include',
        headers: { 'Cache-Control': 'no-store' }, // avoid stale edit data
      });
      const data = await response.json();

      if (data.success) {
        const job = data.data;
        setFormData({
          title: job.title || '',
          summary: job.summary || '',
          description: job.description || '',
          deliverables: job.deliverables || '',
          category_id: job.category_id || '',
          specialty: job.specialty || '',
          mandatory_skills: job.mandatory_skills || [],
          nice_to_have_skills: job.nice_to_have_skills || [],
          tools: job.tools || [],
          experience_level: job.experience_level || 'intermediate',
          languages: job.languages || [],
          budget_type: job.budget_type || 'hourly',
          hourly_rate_from: job.hourly_rate_from || '',
          hourly_rate_to: job.hourly_rate_to || '',
          fixed_price: job.fixed_price || '',
          project_type: job.project_type || 'one-time',
          duration: job.duration || '',
          hours_per_week: job.hours_per_week || '',
          job_size: job.job_size || '',
          freelancers_needed: job.freelancers_needed || 1,
        });

        if (job.category_id) fetchSpecialties(job.category_id);
        if (job.thumb_image) setThumbnailPreview(`/uploads/job-thumbnails/${job.thumb_image}`);
      } else {
        alert('Failed to load job data');
        navigate('/client/Orders');
      }
    } catch (error) {
      console.error('Error fetching job data:', error);
      alert('Error loading job data');
      navigate('/client/Orders');
    } finally {
      setFetchingData(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // clear error on type
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));

    // when category changes, refresh specialties
    if (name === 'category_id' && value) {
      setSpecialties([]);
      setFormData((prev) => ({ ...prev, specialty: '' }));
      fetchSpecialties(value);
    }
  };

  const addSkill = (skillType, skill) => {
    if (!formData[skillType].some((s) => s.id === skill.id)) {
      setFormData((prev) => ({ ...prev, [skillType]: [...prev[skillType], skill] }));
    }
  };

  const removeSkill = (skillType, skillId) => {
    setFormData((prev) => ({ ...prev, [skillType]: prev[skillType].filter((s) => s.id !== skillId) }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Job title is required';
      if (!formData.description.trim()) newErrors.description = 'Job description is required';
      if (!formData.category_id) newErrors.category_id = 'Category is required';
    }

    if (step === 2) {
      if (formData.mandatory_skills.length === 0) newErrors.mandatory_skills = 'At least one mandatory skill is required';
    }

    if (step === 3) {
      if (formData.budget_type === 'hourly') {
        if (!formData.hourly_rate_from) newErrors.hourly_rate_from = 'Minimum hourly rate is required';
        if (!formData.hourly_rate_to) newErrors.hourly_rate_to = 'Maximum hourly rate is required';
        const a = Number(formData.hourly_rate_from);
        const b = Number(formData.hourly_rate_to);
        if (!Number.isNaN(a) && !Number.isNaN(b) && a > b) {
          newErrors.hourly_rate_to = 'Max rate must be ≥ min rate';
        }
      } else {
        if (!formData.fixed_price) newErrors.fixed_price = 'Fixed price is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) setCurrentStep((p) => Math.min(p + 1, totalSteps));
  };
  const prevStep = () => setCurrentStep((p) => Math.max(p - 1, 1));

  // Handle thumbnail file selection
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB');
      return;
    }

    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setThumbnailPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      const formDataObj = new FormData();

      // append all fields
      Object.keys(formData).forEach((key) => {
        if (Array.isArray(formData[key])) {
          formDataObj.append(key, JSON.stringify(formData[key]));
        } else if (key === 'fixed_price' && formData[key]) {
          const price = parseFloat(formData[key]).toFixed(2);
          formDataObj.append(key, price);
        } else {
          formDataObj.append(key, formData[key]);
        }
      });

      if (thumbnailFile) formDataObj.append('thumb_image', thumbnailFile);

      const url = isEditMode ? `/api/job-posts/${jobId}` : '/api/job-posts';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        body: formDataObj, // no Content-Type header for FormData
      });

      const result = await response.json();

      if (response.ok) {
        alert(isEditMode ? 'Job updated successfully!' : 'Job posted successfully!');

        // 🔔 Tell the app to refresh dashboard tiles immediately
        const id = (result && result.data && result.data.id) || jobId;
        emit('job:mutated', { type: isEditMode ? 'updated' : 'created', jobId: id });

        navigate('/client/Orders');
      } else {
        if (result.errors) setErrors(result.errors);
        else alert(result.message || 'Error saving job post');
      }
    } catch (error) {
      console.error('Error submitting job post:', error);
      alert('Error submitting job post: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="job-form-container">
        <div className="loading-state">
          <h3>Loading job data...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="job-form-container">
      <div className="job-form-header">
        <h1>{isEditMode ? 'Edit Job' : 'Post a Job'}</h1>
        <div className="step-indicator">
          <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">About the job</span>
          </div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Freelancer requirements</span>
          </div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">Budget</span>
          </div>
        </div>
      </div>

      <div className="job-form-content">
        {/* Step 1: About the Job */}
        {currentStep === 1 && (
          <div className="form-step">
            <h2>About the Job</h2>

            <div className="form-group">
              <label>Title *</label>
              <JobTitleGenerator
                description={formData.description}
                category={categories.find(c => c.id === formData.category_id)?.name || ''}
                onApply={(title) => handleInputChange('title', title)}
              />
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g. Web Developer Needed for Project"
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label>Summary</label>
              <textarea
                value={formData.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                placeholder="Brief overview of what you're looking for..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <JobDescriptionEnhancer
                description={formData.description}
                title={formData.title}
                category={categories.find(c => c.id === formData.category_id)?.name || ''}
                onApply={(enhanced) => handleInputChange('description', enhanced)}
              />
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your project in detail..."
                rows="6"
                className={errors.description ? 'error' : ''}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            <div className="form-group">
              <label>Deliverables</label>
              <textarea
                value={formData.deliverables}
                onChange={(e) => handleInputChange('deliverables', e.target.value)}
                placeholder="What specific deliverables do you expect?"
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Job Category *</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => handleInputChange('category_id', e.target.value)}
                  className={errors.category_id ? 'error' : ''}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && <span className="error-message">{errors.category_id}</span>}
              </div>

              <div className="form-group">
                <label>Specialty</label>
                <select
                  value={formData.specialty}
                  onChange={(e) => handleInputChange('specialty', e.target.value)}
                  disabled={!formData.category_id || specialties.length === 0}
                >
                  <option value="" disabled>
                    {!formData.category_id
                      ? 'Select a category first'
                      : specialties.length === 0
                      ? 'Loading specialties...'
                      : 'Select a specialty'}
                  </option>
                  {specialties.map((specialty) => (
                    <option key={specialty.id} value={specialty.name}>
                      {specialty.name}
                    </option>
                  ))}
                </select>
                {formData.category_id && specialties.length === 0 && (
                  <span
                    className="info-message"
                    style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}
                  >
                    No specialties available for this category
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Upload Section */}
            <div className="form-group">
              <label>Job Thumbnail</label>
              <div className="thumbnail-upload-container">
                {!thumbnailPreview ? (
                  <div className="thumbnail-upload-area">
                    <input type="file" accept="image/*" onChange={handleThumbnailChange} id="thumbnail-upload" style={{ display: 'none' }} />
                    <label htmlFor="thumbnail-upload" className="thumbnail-upload-button">
                      <div className="upload-icon">📷</div>
                      <div className="upload-text">
                        <div>Choose Thumbnail</div>
                        <div className="upload-subtext">JPG, PNG, GIF, WebP (Max 5MB)</div>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="thumbnail-preview">
                    <img src={thumbnailPreview} alt="Job thumbnail" />
                    <button type="button" className="remove-thumbnail" onClick={removeThumbnail}>
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Freelancer Requirements */}
        {currentStep === 2 && (
          <div className="form-step">
            <h2>Freelancer Requirements</h2>

            <JobSkillsSuggester
              title={formData.title}
              description={formData.description}
              category={categories.find(c => c.id === formData.category_id)?.name || ''}
              onApply={(suggestedSkills) => {
                // Convert skill names to skill objects
                const skillsToAdd = suggestedSkills.map(skillName => {
                  const existingSkill = skills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
                  return existingSkill || { id: `temp-${Date.now()}-${Math.random()}`, name: skillName, type: 'skill' };
                }).filter(skill => !formData.mandatory_skills.some(s => s.id === skill.id));
                
                setFormData(prev => ({
                  ...prev,
                  mandatory_skills: [...prev.mandatory_skills, ...skillsToAdd]
                }));
              }}
            />

            <div className="skills-section">
              <h3>Mandatory Skills *</h3>
              <div className="selected-skills">
                {formData.mandatory_skills.map((skill) => (
                  <span key={skill.id} className="skill-tag">
                    {skill.name}
                    <button type="button" onClick={() => removeSkill('mandatory_skills', skill.id)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <select
                onChange={(e) => {
                  // skill ids from the API are strings (mapped from _id),
                  // so compare as strings instead of parsing to number
                  const val = e.target.value;
                  const skill = skills.find((s) => s.id === val);
                  if (skill) addSkill('mandatory_skills', skill);
                  e.target.value = '';
                }}
              >
                <option value="">Add skills</option>
                {skills
                  .filter((skill) => skill.type === 'skill')
                  .map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
              </select>
              {errors.mandatory_skills && <span className="error-message">{errors.mandatory_skills}</span>}
            </div>

            <div className="skills-section">
              <h3>Nice-to-have Skills</h3>
              <div className="selected-skills">
                {formData.nice_to_have_skills.map((skill) => (
                  <span key={skill.id} className="skill-tag">
                    {skill.name}
                    <button type="button" onClick={() => removeSkill('nice_to_have_skills', skill.id)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  const skill = skills.find((s) => s.id === val);
                  if (skill) addSkill('nice_to_have_skills', skill);
                  e.target.value = '';
                }}
              >
                <option value="">Add skills</option>
                {skills
                  .filter((skill) => skill.type === 'skill')
                  .map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="skills-section">
              <h3>Tools (optional)</h3>
              <div className="selected-skills">
                {formData.tools.map((tool) => (
                  <span key={tool.id} className="skill-tag">
                    {tool.name}
                    <button type="button" onClick={() => removeSkill('tools', tool.id)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  const tool = skills.find((s) => s.id === val);
                  if (tool) addSkill('tools', tool);
                  e.target.value = '';
                }}
              >
                <option value="">Add tools</option>
                {skills
                  .filter((s) => s.type === 'tool')
                  .map((tool) => (
                    <option key={tool.id} value={tool.id}>
                      {tool.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="experience-section">
              <h3>Experience Level</h3>
              {experienceLevels.map((level) => (
                <label key={level.value} className="radio-option">
                  <input
                    type="radio"
                    name="experience_level"
                    value={level.value}
                    checked={formData.experience_level === level.value}
                    onChange={(e) => handleInputChange('experience_level', e.target.value)}
                  />
                  <div className="radio-content">
                    <strong>{level.label}</strong>
                    <p>{level.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Budget */}
        {currentStep === 3 && (
          <div className="form-step">
            <h2>Budget</h2>

            <JobBudgetRecommender
              title={formData.title}
              description={formData.description}
              category={categories.find(c => c.id === formData.category_id)?.name || ''}
              complexity={formData.job_size}
              duration={formData.duration}
            />

            <div className="budget-type-section">
              <h3>Project Type</h3>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="budget_type"
                    value="hourly"
                    checked={formData.budget_type === 'hourly'}
                    onChange={(e) => handleInputChange('budget_type', e.target.value)}
                  />
                  <strong>Hourly rate</strong>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="budget_type"
                    value="fixed"
                    checked={formData.budget_type === 'fixed'}
                    onChange={(e) => handleInputChange('budget_type', e.target.value)}
                  />
                  <strong>Fixed-price</strong>
                </label>
              </div>
            </div>

            {formData.budget_type === 'hourly' ? (
              <div className="hourly-rate-section">
                <h4>Hourly Rate Range</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>From *</label>
                    <input
                      type="number"
                      value={formData.hourly_rate_from}
                      onChange={(e) => handleInputChange('hourly_rate_from', e.target.value)}
                      placeholder="15.00"
                      className={errors.hourly_rate_from ? 'error' : ''}
                    />
                    {errors.hourly_rate_from && <span className="error-message">{errors.hourly_rate_from}</span>}
                  </div>
                  <div className="form-group">
                    <label>To *</label>
                    <input
                      type="number"
                      value={formData.hourly_rate_to}
                      onChange={(e) => handleInputChange('hourly_rate_to', e.target.value)}
                      placeholder="25.00"
                      className={errors.hourly_rate_to ? 'error' : ''}
                    />
                    {errors.hourly_rate_to && <span className="error-message">{errors.hourly_rate_to}</span>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="fixed-price-section">
                <h4>Fixed Price</h4>
                <div className="form-group">
                  <label>Project Budget *</label>
                  <input
                    type="text"
                    value={formData.fixed_price}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*\.?\d*$/.test(value)) {
                        handleInputChange('fixed_price', value);
                      }
                    }}
                    placeholder="1000.00"
                    className={errors.fixed_price ? 'error' : ''}
                  />
                  {errors.fixed_price && <span className="error-message">{errors.fixed_price}</span>}
                </div>
              </div>
            )}

            <div className="project-details-section">
              <h3>Project Details</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration</label>
                  <JobTimelineEstimator
                    title={formData.title}
                    description={formData.description}
                    category={categories.find(c => c.id === formData.category_id)?.name || ''}
                    budget={formData.budget_type === 'fixed' ? formData.fixed_price : null}
                    onApply={(days) => {
                      // Convert days to duration option
                      let durationValue = '';
                      if (days <= 90) durationValue = '1-3-months';
                      else if (days <= 180) durationValue = '3-6-months';
                      else durationValue = '6-months-plus';
                      handleInputChange('duration', durationValue);
                    }}
                  />
                  <select value={formData.duration} onChange={(e) => handleInputChange('duration', e.target.value)}>
                    <option value="">Select duration</option>
                    {durationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Hours per week</label>
                  <select value={formData.hours_per_week} onChange={(e) => handleInputChange('hours_per_week', e.target.value)}>
                    <option value="">Select hours</option>
                    {hoursPerWeekOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Job Size</label>
                <div className="job-size-options">
                  {jobSizeOptions.map((size) => (
                    <label key={size.value} className="radio-option">
                      <input
                        type="radio"
                        name="job_size"
                        value={size.value}
                        checked={formData.job_size === size.value}
                        onChange={(e) => handleInputChange('job_size', e.target.value)}
                      />
                      <div className="radio-content">
                        <strong>{size.label}</strong>
                        <p>{size.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Freelancers needed</label>
                <div className="freelancer-counter">
                  <button
                    type="button"
                    onClick={() => handleInputChange('freelancers_needed', Math.max(1, formData.freelancers_needed - 1))}
                    disabled={formData.freelancers_needed <= 1}
                  >
                    -
                  </button>
                  <span>{formData.freelancers_needed}</span>
                  <button type="button" onClick={() => handleInputChange('freelancers_needed', formData.freelancers_needed + 1)}>
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="form-navigation">
          {currentStep > 1 && (
            <button type="button" className="btn-secondary" onClick={prevStep}>
              Back
            </button>
          )}

          {currentStep < totalSteps ? (
            <button type="button" className="btn-primary" onClick={nextStep}>
              Next
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? (isEditMode ? 'Updating...' : 'Posting...') : isEditMode ? 'Update Job' : 'Post Job'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostJobFormEnhanced;