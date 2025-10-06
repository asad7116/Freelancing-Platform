import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../styles/job_detail.css';

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Determine user role from route or localStorage
  const userRole = localStorage.getItem("role");
  const isClient = userRole === "client" || location.pathname.startsWith('/client');

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/job-posts/${jobId}`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setJob(data.data);
      } else {
        setError(data.message || 'Failed to fetch job details');
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      setError('Error fetching job details');
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

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'pending': return 'Pending Approval';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Pending';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'pending';
      case 'approved': return 'approved';
      case 'rejected': return 'rejected';
      default: return 'pending';
    }
  };

  const handleEdit = () => {
    navigate(`/client/PostJob/edit/${jobId}`);
  };

  const handleGoBack = () => {
    if (isClient) {
      navigate('/client/Orders'); // Client's My Jobs page
    } else {
      navigate('/freelancer/browse-jobs'); // Freelancer's Browse Jobs page
    }
  };

  if (loading) {
    return (
      <div className="job-detail-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-detail-container">
        <div className="error-state">
          <h3>Error Loading Job</h3>
          <p>{error}</p>
          <button onClick={handleGoBack} className="btn-secondary">
            Go Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-detail-container">
        <div className="error-state">
          <h3>Job Not Found</h3>
          <p>The job you're looking for doesn't exist or you don't have permission to view it.</p>
          <button onClick={handleGoBack} className="btn-secondary">
            Go Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-detail-container">
      {/* Header Section */}
      <div className="job-detail-header">
        <button onClick={handleGoBack} className="back-button">
          ← Back to My Jobs
        </button>
        
        <div className="job-header-content">
          <div className="job-thumbnail-large">
            {job.thumb_image ? (
              <img 
                src={`/uploads/job-thumbnails/${job.thumb_image}`} 
                alt={job.title}
              />
            ) : (
              <div className="placeholder-thumbnail-large">
                <span>📋</span>
              </div>
            )}
          </div>
          
          <div className="job-header-info">
            <h1 className="job-title-large">{job.title}</h1>
            <div className="job-meta-info">
              <span className="job-category-badge">{job.category?.name || 'General'}</span>
              <span className={`job-status-badge status-${getStatusClass(job.approved_by_admin)}`}>
                {getStatusDisplay(job.approved_by_admin)}
              </span>
            </div>
            <div className="job-stats-header">
              <div className="stat">
                <strong>${parseFloat(job.regular_price || job.fixed_price || 0).toFixed(2)}</strong>
                <span>Budget</span>
              </div>
              <div className="stat">
                <strong>{job._count?.applications || 0}</strong>
                <span>Applications</span>
              </div>
              <div className="stat">
                <strong>{formatDate(job.created_at)}</strong>
                <span>Posted</span>
              </div>
            </div>
            {/* Only show edit button for clients viewing their own job */}
            {isClient && (
              <button onClick={handleEdit} className="btn-primary edit-job-btn">
                ✏️ Edit Job
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="job-detail-content">
        <div className="main-content">
          {/* Job Summary */}
          {job.summary && (
            <section className="content-section">
              <h2>Summary</h2>
              <div className="content-text">
                <p>{job.summary}</p>
              </div>
            </section>
          )}

          {/* Job Description */}
          <section className="content-section">
            <h2>Project Description</h2>
            <div className="content-text">
              {job.description.split('\n').map((paragraph, index) => 
                paragraph.trim() && <p key={index}>{paragraph}</p>
              )}
            </div>
          </section>

          {/* Deliverables */}
          {job.deliverables && (
            <section className="content-section">
              <h2>Expected Deliverables</h2>
              <div className="content-text">
                {job.deliverables.split('\n').map((deliverable, index) => 
                  deliverable.trim() && <p key={index}>• {deliverable}</p>
                )}
              </div>
            </section>
          )}

          {/* Skills Required */}
          {(job.mandatory_skills?.length > 0 || job.nice_to_have_skills?.length > 0) && (
            <section className="content-section">
              <h2>Skills Required</h2>
              {job.mandatory_skills?.length > 0 && (
                <div className="skills-group">
                  <h3>Mandatory Skills</h3>
                  <div className="skills-list">
                    {job.mandatory_skills.map((skill, index) => (
                      <span key={index} className="skill-tag mandatory">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {job.nice_to_have_skills?.length > 0 && (
                <div className="skills-group">
                  <h3>Nice to Have</h3>
                  <div className="skills-list">
                    {job.nice_to_have_skills.map((skill, index) => (
                      <span key={index} className="skill-tag optional">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Project Details */}
          <section className="content-section">
            <h2>Project Details</h2>
            <div className="project-details-grid">
              <div className="detail-item">
                <label>Experience Level</label>
                <span className="detail-value">
                  {job.experience_level === 'entry' && '🌱 Entry Level'}
                  {job.experience_level === 'intermediate' && '⭐ Intermediate'}
                  {job.experience_level === 'expert' && '🏆 Expert'}
                </span>
              </div>
              
              <div className="detail-item">
                <label>Project Type</label>
                <span className="detail-value">
                  {job.project_type === 'one-time' ? '📋 One-time Project' : '🔄 Ongoing Project'}
                </span>
              </div>

              {job.duration && (
                <div className="detail-item">
                  <label>Duration</label>
                  <span className="detail-value">{job.duration.replace('-', ' to ')}</span>
                </div>
              )}

              {job.hours_per_week && (
                <div className="detail-item">
                  <label>Hours per Week</label>
                  <span className="detail-value">{job.hours_per_week.replace('-', ' ')}</span>
                </div>
              )}

              <div className="detail-item">
                <label>Budget Type</label>
                <span className="detail-value">
                  {job.budget_type === 'hourly' ? '⏰ Hourly Rate' : '💰 Fixed Price'}
                </span>
              </div>

              {job.freelancers_needed > 1 && (
                <div className="detail-item">
                  <label>Freelancers Needed</label>
                  <span className="detail-value">{job.freelancers_needed}</span>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="job-sidebar">
          <div className="sidebar-card">
            <h3>About this Job</h3>
            <div className="job-meta-list">
              <div className="meta-item">
                <span className="meta-label">Job ID</span>
                <span className="meta-value">#{job.id}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Category</span>
                <span className="meta-value">{job.category?.name || 'General'}</span>
              </div>
              {job.specialty && (
                <div className="meta-item">
                  <span className="meta-label">Specialty</span>
                  <span className="meta-value">{job.specialty}</span>
                </div>
              )}
              {job.city && (
                <div className="meta-item">
                  <span className="meta-label">Location</span>
                  <span className="meta-value">📍 {job.city.name}</span>
                </div>
              )}
              <div className="meta-item">
                <span className="meta-label">Posted</span>
                <span className="meta-value">{formatDate(job.created_at)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Status</span>
                <span className={`meta-value status-${getStatusClass(job.approved_by_admin)}`}>
                  {getStatusDisplay(job.approved_by_admin)}
                </span>
              </div>
            </div>
          </div>

          {job._count?.applications > 0 && (
            <div className="sidebar-card">
              <h3>Applications</h3>
              <div className="applications-summary">
                <div className="app-count">
                  <strong>{job._count.applications}</strong>
                  <span>Total Applications</span>
                </div>
                <button className="btn-secondary view-applications-btn">
                  View Applications
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetail;