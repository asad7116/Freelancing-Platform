import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/post_job_enhanced.css';
import { emit } from '../lib/eventBus'; // ✅ to refresh dashboard after success
import JobTitleGenerator from './AI/JobTitleGenerator';
import JobDescriptionEnhancer from './AI/JobDescriptionEnhancer';
import JobBudgetRecommender from './AI/JobBudgetRecommender';
import JobSkillsSuggester from './AI/JobSkillsSuggester';
import JobTimelineEstimator from './AI/JobTimelineEstimator';
import { API_BASE_URL } from "../lib/api";
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

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
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Data for dropdowns
  const [categories, setCategories] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [skills, setSkills] = useState([]);       // DB-seeded skills (fallback)
  const [aiSkills, setAiSkills] = useState([]);    // AI-generated skills for this job
  const [aiTools, setAiTools] = useState([]);      // AI-generated tools for this job

  // AI auto-detect category & specialty from title
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const aiDebounceRef = useRef(null);
  const lastAiTitleRef = useRef('');

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
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      const data = await response.json();
      if (data.success) setCategories(data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/skills`);
      const data = await response.json();
      if (data.success) setSkills(data.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  // AI-powered: auto-detect category & specialty from job title
  const autoDetectCategoryFromTitle = useCallback(async (title) => {
    if (!title || title.trim().length < 3) return;
    if (title.trim() === lastAiTitleRef.current) return; // skip duplicate calls
    lastAiTitleRef.current = title.trim();

    setAiSuggesting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/suggest-category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ jobTitle: title }),
      });
      const data = await response.json();

      if (response.ok && data.success && data.data) {
        const {
          category_id,
          suggested_specialty,
          specialties: aiSpecialtiesData,
          skills: aiSkillsData,
          tools: aiToolsData,
        } = data.data;

        // Only auto-set if user hasn't already picked a category manually
        setFormData((prev) => {
          const update = {};
          if (!prev.category_id && category_id) update.category_id = category_id;
          if (!prev.specialty && suggested_specialty) update.specialty = suggested_specialty;
          return { ...prev, ...update };
        });

        // Populate specialty dropdown with AI-generated options
        if (aiSpecialtiesData && aiSpecialtiesData.length > 0) {
          setSpecialties(aiSpecialtiesData);
        }

        // Populate skills dropdown with AI-generated options
        if (aiSkillsData && aiSkillsData.length > 0) {
          setAiSkills(aiSkillsData);
        }

        // Populate tools dropdown with AI-generated options
        if (aiToolsData && aiToolsData.length > 0) {
          setAiTools(aiToolsData);
        }
      }
    } catch (error) {
      console.error('Error auto-detecting category:', error);
    } finally {
      setAiSuggesting(false);
    }
  }, []);

  // Debounced title watcher — triggers AI auto-detect when title changes
  useEffect(() => {
    if (isEditMode) return; // don't auto-detect for edit mode
    const title = formData.title;
    if (!title || title.trim().length < 3) return;

    if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);
    aiDebounceRef.current = setTimeout(() => {
      autoDetectCategoryFromTitle(title);
    }, 1000);

    return () => {
      if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);
    };
  }, [formData.title, isEditMode, autoDetectCategoryFromTitle]);

  const fetchJobData = async (jid) => {
    try {
      setFetchingData(true);
      const response = await fetch(`${API_BASE_URL}/api/job-posts/${jid}`, {
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

        // For edit mode: auto-detect specialties from the existing title
        if (job.title && job.title.trim().length >= 3) {
          autoDetectCategoryFromTitle(job.title);
        }
        if (job.thumb_image) setThumbnailPreview(`/uploads/job-thumbnails/${job.thumb_image}`);
      } else {
        setSubmitError('Failed to load job data');
        navigate('/client/Orders');
      }
    } catch (error) {
      console.error('Error fetching job data:', error);
      setSubmitError('Error loading job data');
      navigate('/client/Orders');
    } finally {
      setFetchingData(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // clear error on type
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));

    // when category changes manually, reset specialty
    if (name === 'category_id' && value) {
      setFormData((prev) => ({ ...prev, specialty: '' }));
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
      if (!formData.title || !formData.title.trim()) newErrors.title = 'Job title is required';
      if (!formData.description || !formData.description.trim()) newErrors.description = 'Job description is required';
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
      setSubmitError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('Please select an image smaller than 5MB');
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
    setSubmitError("");
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
        // 🔔 Tell the app to refresh dashboard tiles immediately
        const id = (result && result.data && result.data.id) || jobId;
        emit('job:mutated', { type: isEditMode ? 'updated' : 'created', jobId: id });

        setSuccess(true);
        setTimeout(() => {
          navigate('/client/Orders');
        }, 2500);
      } else {
        if (result.errors) setErrors(result.errors);
        else setSubmitError(result.message || 'Error saving job post');
      }
    } catch (error) {
      console.error('Error submitting job post:', error);
      setSubmitError('Error submitting job post: ' + error.message);
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

  if (success) {
    return (
      <div className="job-form-container">
        <div className="job-success-message">
          <CheckCircle size={64} className="job-success-icon" />
          <h2>{isEditMode ? "Job Updated Successfully!" : "Job Posted Successfully! 🚀"}</h2>
          <p>{isEditMode ? "Your changes have been saved." : "Your job is now live and visible to freelancers."}</p>
          <p className="job-redirect-text">Redirecting to My Jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="job-form-container">
      <div className="job-form-header">
        <h1>{isEditMode ? 'Edit Job' : 'Post a Job'}</h1>
        <div className="step-indicator">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <div className="progress-steps">
            <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
              <span className="step-number">1</span>
              <p className="step-label">About the job</p>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              <span className="step-number">2</span>
              <p className="step-label">Freelancer requirements</p>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <p className="step-label">Budget</p>
            </div>
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
                currentTitle={formData.title}
                category={categories.find(c => c.id === formData.category_id)?.name}
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
                category={categories.find(c => c.id === formData.category_id)?.name}
                onApply={(description) => handleInputChange('description', description)}
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
                <label>Job Category *{aiSuggesting && <span className="ai-detecting-label"> — AI detecting...</span>}</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => handleInputChange('category_id', e.target.value)}
                  className={`${errors.category_id ? 'error' : ''} ${aiSuggesting ? 'ai-loading-select' : ''}`}
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
                <label>Specialty{aiSuggesting && <span className="ai-detecting-label"> — AI detecting...</span>}</label>
                <select
                  value={formData.specialty}
                  onChange={(e) => handleInputChange('specialty', e.target.value)}
                  disabled={specialties.length === 0 && !aiSuggesting}
                  className={aiSuggesting ? 'ai-loading-select' : ''}
                >
                  <option value="">
                    {aiSuggesting
                      ? 'AI detecting specialty...'
                      : specialties.length === 0
                      ? 'Type a title to auto-detect'
                      : 'Select a specialty'}
                  </option>
                  {specialties.map((specialty) => (
                    <option key={specialty.id} value={specialty.name}>
                      {specialty.name}
                    </option>
                  ))}
                </select>
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
              category={categories.find(c => c.id === formData.category_id)?.name}
              onApply={(suggestedSkills) => {
                // Convert suggested skill names to skill objects from combined skills
                const allSkills = [...aiSkills, ...skills.filter(s => s.type === 'skill')];
                const skillsToAdd = suggestedSkills
                  .map(skillName => allSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase()))
                  .filter(Boolean);
                
                // Add to mandatory skills (avoiding duplicates)
                const existingIds = formData.mandatory_skills.map(s => s.id);
                const newSkills = skillsToAdd.filter(s => !existingIds.includes(s.id));
                
                if (newSkills.length > 0) {
                  handleInputChange('mandatory_skills', [...formData.mandatory_skills, ...newSkills]);
                }
              }}
            />

            {/* Merge AI-generated skills with DB skills (AI first, then DB as "More skills") */}
            {(() => {
              const dbSkillsFiltered = skills.filter(s => s.type === 'skill');
              // Deduplicate: remove DB skills that AI already returned (by name, case-insensitive)
              const aiSkillNames = new Set(aiSkills.map(s => s.name.toLowerCase()));
              const extraDbSkills = dbSkillsFiltered.filter(s => !aiSkillNames.has(s.name.toLowerCase()));
              const hasAiSkills = aiSkills.length > 0;

              const dbToolsFiltered = skills.filter(s => s.type === 'tool');
              const aiToolNames = new Set(aiTools.map(t => t.name.toLowerCase()));
              const extraDbTools = dbToolsFiltered.filter(t => !aiToolNames.has(t.name.toLowerCase()));
              const hasAiTools = aiTools.length > 0;

              return (
                <>
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
                        const val = e.target.value;
                        const allSkills = [...aiSkills, ...dbSkillsFiltered];
                        const skill = allSkills.find((s) => s.id === val);
                        if (skill) addSkill('mandatory_skills', skill);
                        e.target.value = '';
                      }}
                    >
                      <option value="">Add skills</option>
                      {hasAiSkills && (
                        <optgroup label="Recommended for this job">
                          {aiSkills.map((skill) => (
                            <option key={skill.id} value={skill.id}>
                              {skill.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {extraDbSkills.length > 0 && (
                        <optgroup label={hasAiSkills ? "More skills" : "All skills"}>
                          {extraDbSkills.map((skill) => (
                            <option key={skill.id} value={skill.id}>
                              {skill.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
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
                        const allSkills = [...aiSkills, ...dbSkillsFiltered];
                        const skill = allSkills.find((s) => s.id === val);
                        if (skill) addSkill('nice_to_have_skills', skill);
                        e.target.value = '';
                      }}
                    >
                      <option value="">Add skills</option>
                      {hasAiSkills && (
                        <optgroup label="Recommended for this job">
                          {aiSkills.map((skill) => (
                            <option key={skill.id} value={skill.id}>
                              {skill.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {extraDbSkills.length > 0 && (
                        <optgroup label={hasAiSkills ? "More skills" : "All skills"}>
                          {extraDbSkills.map((skill) => (
                            <option key={skill.id} value={skill.id}>
                              {skill.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
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
                        const allTools = [...aiTools, ...dbToolsFiltered];
                        const tool = allTools.find((s) => s.id === val);
                        if (tool) addSkill('tools', tool);
                        e.target.value = '';
                      }}
                    >
                      <option value="">Add tools</option>
                      {hasAiTools && (
                        <optgroup label="Recommended for this job">
                          {aiTools.map((tool) => (
                            <option key={tool.id} value={tool.id}>
                              {tool.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {extraDbTools.length > 0 && (
                        <optgroup label={hasAiTools ? "More tools" : "All tools"}>
                          {extraDbTools.map((tool) => (
                            <option key={tool.id} value={tool.id}>
                              {tool.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                </>
              );
            })()}

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
              category={categories.find(c => c.id === formData.category_id)?.name}
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

              <JobTimelineEstimator
                title={formData.title}
                description={formData.description}
                category={categories.find(c => c.id === formData.category_id)?.name}
                budget={formData.budget_type === 'fixed' ? formData.fixed_price : `${formData.hourly_rate_from}-${formData.hourly_rate_to}`}
                onApply={(estimatedDays) => {
                  // Convert estimated days to duration option
                  if (estimatedDays <= 90) {
                    handleInputChange('duration', '1-3-months');
                  } else if (estimatedDays <= 180) {
                    handleInputChange('duration', '3-6-months');
                  } else {
                    handleInputChange('duration', '6-months-plus');
                  }
                }}
              />

              <div className="form-row">
                <div className="form-group">
                  <label>Duration</label>
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
              {loading ? (
                <>
                  <Loader size={18} className="spin-icon" />
                  {isEditMode ? 'Updating...' : 'Posting...'}
                </>
              ) : isEditMode ? 'Update Job' : 'Post Job'}
            </button>
          )}
        </div>

        {submitError && (
          <div className="job-error-banner">
            <AlertCircle size={18} />
            {submitError}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostJobFormEnhanced;