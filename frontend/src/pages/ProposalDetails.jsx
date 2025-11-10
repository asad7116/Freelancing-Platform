import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  User,
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Mail,
  MapPin,
  Briefcase,
  Award,
  GraduationCap,
  Link as LinkIcon,
  Github,
  Linkedin,
  Globe
} from 'lucide-react';
import '../styles/proposal_details.css';

const ProposalDetails = () => {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProposalDetails();
  }, [proposalId]);

  const fetchProposalDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/api/proposals/${proposalId}`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setProposal(data.proposal);
      } else {
        setError(data.message || 'Failed to fetch proposal');
      }
    } catch (err) {
      console.error('Error fetching proposal:', err);
      setError('Error loading proposal details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    if (!window.confirm(`Are you sure you want to ${status} this proposal?`)) {
      return;
    }

    try {
      setActionLoading(true);
      setError('');

      const response = await fetch(`http://localhost:4000/api/proposals/${proposalId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(`Proposal ${status} successfully!`);
        setProposal(prev => ({ ...prev, status }));
        
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      } else {
        setError(data.message || `Failed to ${status} proposal`);
      }
    } catch (err) {
      console.error('Error updating proposal:', err);
      setError('Error updating proposal status');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="proposal-details-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading proposal details...</p>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="proposal-details-container">
        <div className="error-state">
          <AlertCircle size={64} className="error-icon" />
          <h3>Proposal Not Found</h3>
          <button onClick={() => navigate(-1)} className="btn-back-error">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const freelancer = proposal.freelancer;
  const profile = freelancer?.profile;

  return (
    <div className="proposal-details-container">
      <button onClick={() => navigate(-1)} className="btn-back-inline">
        <ArrowLeft size={20} />
        Back
      </button>

      {successMessage && (
        <div className="success-banner">
          <CheckCircle size={20} />
          {successMessage}
        </div>
      )}

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="proposal-details-layout">
        {/* Main Content */}
        <div className="proposal-main-content">
          {/* Job Info Card */}
          <div className="job-info-card">
            <h2>{proposal.job?.title}</h2>
            <div className="job-meta-info">
              <span className="meta-badge">
                <DollarSign size={16} />
                Budget: ${proposal.job?.budget}
              </span>
              <span className="meta-badge">
                <Clock size={16} />
                Duration: {proposal.job?.duration}
              </span>
            </div>
          </div>

          {/* Proposal Details */}
          <div className="proposal-content-card">
            <div className="card-section">
              <h3>Proposal Details</h3>
              <div className="proposal-stats-grid">
                <div className="stat-box">
                  <span className="stat-label">Bid Amount</span>
                  <span className="stat-value-large">${proposal.proposed_price}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Delivery Time</span>
                  <span className="stat-value-large">{proposal.delivery_time} days</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Submitted</span>
                  <span className="stat-value-small">{formatDate(proposal.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="card-section">
              <h3>Cover Letter</h3>
              <div className="cover-letter-full">
                {proposal.cover_letter}
              </div>
            </div>

            {proposal.milestones && proposal.milestones.length > 0 && (
              <div className="card-section">
                <h3>Milestones ({proposal.milestones.length})</h3>
                <div className="milestones-list-full">
                  {proposal.milestones.map((milestone, index) => (
                    <div key={index} className="milestone-item-full">
                      <div className="milestone-number">{index + 1}</div>
                      <div className="milestone-content-full">
                        <h4>{milestone.description}</h4>
                        <div className="milestone-meta-full">
                          <span>
                            <DollarSign size={14} />
                            ${milestone.amount}
                          </span>
                          <span>
                            <Clock size={14} />
                            {milestone.duration} days
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {proposal.status === 'pending' && (
            <div className="action-buttons">
              <button 
                className="btn-reject"
                onClick={() => handleStatusUpdate('rejected')}
                disabled={actionLoading}
              >
                <XCircle size={20} />
                Reject Proposal
              </button>
              <button 
                className="btn-approve"
                onClick={() => handleStatusUpdate('approved')}
                disabled={actionLoading}
              >
                <CheckCircle size={20} />
                Accept Proposal
              </button>
            </div>
          )}

          {proposal.status !== 'pending' && (
            <div className="status-info-banner">
              {proposal.status === 'approved' && (
                <>
                  <CheckCircle size={24} className="status-icon approved" />
                  <div>
                    <h4>This proposal has been approved</h4>
                    <p>You can now proceed to work with this freelancer</p>
                  </div>
                </>
              )}
              {proposal.status === 'rejected' && (
                <>
                  <XCircle size={24} className="status-icon rejected" />
                  <div>
                    <h4>This proposal has been rejected</h4>
                    <p>The freelancer has been notified</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Freelancer Profile */}
        <div className="proposal-sidebar">
          <div className="freelancer-profile-card">
            <div className="freelancer-avatar-large">
              {profile?.profile_image ? (
                <img 
                  src={`http://localhost:4000${profile.profile_image}`} 
                  alt={freelancer.name}
                />
              ) : (
                <User size={40} />
              )}
            </div>
            
            <h3>{freelancer.name}</h3>
            
            {profile?.title && (
              <p className="freelancer-title-sidebar">{profile.title}</p>
            )}

            <div className="freelancer-quick-stats">
              {profile?.years_of_experience > 0 && (
                <div className="quick-stat-item">
                  <Briefcase size={16} />
                  <span>{profile.years_of_experience} years</span>
                </div>
              )}
              {profile?.hourly_rate && (
                <div className="quick-stat-item">
                  <DollarSign size={16} />
                  <span>${profile.hourly_rate}/hr</span>
                </div>
              )}
            </div>

            {freelancer.email && (
              <div className="contact-info-item">
                <Mail size={16} />
                <span>{freelancer.email}</span>
              </div>
            )}

            {/* Social Links */}
            {(profile?.linkedin_url || profile?.github_url || profile?.website_url) && (
              <div className="social-links">
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="social-link">
                    <Linkedin size={18} />
                  </a>
                )}
                {profile.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="social-link">
                    <Github size={18} />
                  </a>
                )}
                {profile.website_url && (
                  <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="social-link">
                    <Globe size={18} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Skills */}
          {profile?.skills && profile.skills.length > 0 && (
            <div className="sidebar-section">
              <h4>
                <Award size={18} />
                Skills
              </h4>
              <div className="skills-grid-sidebar">
                {profile.skills.map((skill, index) => (
                  <span key={index} className="skill-tag-sidebar">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {profile?.education && profile.education.length > 0 && (
            <div className="sidebar-section">
              <h4>
                <GraduationCap size={18} />
                Education
              </h4>
              {profile.education.map((edu, index) => (
                <div key={index} className="education-item">
                  <strong>{edu.degree}</strong>
                  <p>{edu.institution}</p>
                  {edu.year && <span className="edu-year">{edu.year}</span>}
                </div>
              ))}
            </div>
          )}

          {/* Experience */}
          {profile?.experience && profile.experience.length > 0 && (
            <div className="sidebar-section">
              <h4>
                <Briefcase size={18} />
                Experience
              </h4>
              {profile.experience.slice(0, 3).map((exp, index) => (
                <div key={index} className="experience-item">
                  <strong>{exp.title}</strong>
                  <p>{exp.company}</p>
                  {exp.duration && <span className="exp-duration">{exp.duration}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalDetails;
