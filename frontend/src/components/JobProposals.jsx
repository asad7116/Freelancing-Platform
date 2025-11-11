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
  Eye,
  Star,
  Briefcase
} from 'lucide-react';
import '../styles/job_proposals.css';

const JobProposals = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProposals();
  }, [jobId]);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/api/proposals/job/${jobId}`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setProposals(data.proposals);
      } else {
        setError(data.message || 'Failed to fetch proposals');
      }
    } catch (err) {
      console.error('Error fetching proposals:', err);
      setError('Error loading proposals');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: <Clock size={14} />, class: 'badge-pending', text: 'Pending' },
      approved: { icon: <CheckCircle size={14} />, class: 'badge-approved', text: 'Approved' },
      rejected: { icon: <XCircle size={14} />, class: 'badge-rejected', text: 'Rejected' }
    };

    const badge = badges[status] || badges.pending;

    return (
      <span className={`status-badge ${badge.class}`}>
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const stats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === 'pending').length,
    approved: proposals.filter(p => p.status === 'approved').length,
    rejected: proposals.filter(p => p.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="job-proposals-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="job-proposals-container">
      <button onClick={() => navigate('/client/MyProposals')} className="btn-back">
        <ArrowLeft size={20} />
        Back to Proposals
      </button>

      <div className="page-header">
        <h1>Proposals for this Job</h1>
        <p className="subtitle">Review and select the best freelancer for your project</p>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="quick-stat">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="quick-stat pending">
          <span className="stat-value">{stats.pending}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="quick-stat approved">
          <span className="stat-value">{stats.approved}</span>
          <span className="stat-label">Approved</span>
        </div>
        <div className="quick-stat rejected">
          <span className="stat-value">{stats.rejected}</span>
          <span className="stat-label">Rejected</span>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Proposals List */}
      {proposals.length === 0 ? (
        <div className="empty-state">
          <User size={64} className="empty-icon" />
          <h3>No Proposals Yet</h3>
          <p>No freelancers have submitted proposals for this job yet. Check back later!</p>
        </div>
      ) : (
        <div className="proposals-list">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="proposal-card-detailed">
              <div className="proposal-header">
                <div className="freelancer-info">
                  <div className="freelancer-avatar">
                    {proposal.freelancer?.profile?.profile_image ? (
                      <img 
                        src={`http://localhost:4000${proposal.freelancer.profile.profile_image}`} 
                        alt={proposal.freelancer.name}
                      />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                  <div className="freelancer-details">
                    <h3>{proposal.freelancer?.name || 'Freelancer'}</h3>
                    {proposal.freelancer?.profile?.title && (
                      <p className="freelancer-title">{proposal.freelancer.profile.title}</p>
                    )}
                    <div className="freelancer-meta">
                      {proposal.freelancer?.profile?.years_of_experience > 0 && (
                        <span className="meta-item">
                          <Briefcase size={14} />
                          {proposal.freelancer.profile.years_of_experience} years exp
                        </span>
                      )}
                      {proposal.freelancer?.profile?.hourly_rate && (
                        <span className="meta-item">
                          <DollarSign size={14} />
                          ${proposal.freelancer.profile.hourly_rate}/hr
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="proposal-status-section">
                  {getStatusBadge(proposal.status)}
                  {proposal.submission_status === 'submitted' && (
                    <span className="submission-badge">
                      <CheckCircle size={14} />
                      Work Submitted
                    </span>
                  )}
                  <span className="proposal-date">
                    {formatDate(proposal.created_at)}
                  </span>
                </div>
              </div>

              <div className="proposal-bid-info">
                <div className="bid-item">
                  <span className="bid-label">Bid Amount</span>
                  <span className="bid-value">${proposal.proposed_price}</span>
                </div>
                <div className="bid-item">
                  <span className="bid-label">Delivery Time</span>
                  <span className="bid-value">{proposal.delivery_time} days</span>
                </div>
                {proposal.milestones && proposal.milestones.length > 0 && (
                  <div className="bid-item">
                    <span className="bid-label">Milestones</span>
                    <span className="bid-value">{proposal.milestones.length} defined</span>
                  </div>
                )}
              </div>

              <div className="proposal-cover-section">
                <h4>Cover Letter</h4>
                <p className="cover-letter-preview">
                  {proposal.cover_letter.length > 200 
                    ? `${proposal.cover_letter.substring(0, 200)}...` 
                    : proposal.cover_letter
                  }
                </p>
              </div>

              {proposal.freelancer?.profile?.skills && proposal.freelancer.profile.skills.length > 0 && (
                <div className="skills-section">
                  <h4>Skills</h4>
                  <div className="skills-list">
                    {proposal.freelancer.profile.skills.slice(0, 5).map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                    {proposal.freelancer.profile.skills.length > 5 && (
                      <span className="skill-tag more">+{proposal.freelancer.profile.skills.length - 5} more</span>
                    )}
                  </div>
                </div>
              )}

              <div className="proposal-actions">
                <button 
                  className="btn-view-full"
                  onClick={() => navigate(`/client/proposals/${proposal.id}`)}
                >
                  <Eye size={18} />
                  View Full Proposal
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobProposals;
