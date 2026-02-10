import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../lib/api';
import { 
  FileText, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Send,
  Eye
} from 'lucide-react';
import '../styles/my_proposals_freelancer.css';

const MyProposalsFreelancer = () => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/proposals/freelancer`, {
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
      pending: { icon: <Clock size={16} />, class: 'badge-pending', text: 'Pending' },
      approved: { icon: <CheckCircle size={16} />, class: 'badge-approved', text: 'Approved' },
      rejected: { icon: <XCircle size={16} />, class: 'badge-rejected', text: 'Rejected' },
      withdrawn: { icon: <AlertCircle size={16} />, class: 'badge-withdrawn', text: 'Withdrawn' }
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

  const filteredProposals = proposals.filter(proposal => {
    if (filter === 'all') return true;
    return proposal.status === filter;
  });

  const stats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === 'pending').length,
    approved: proposals.filter(p => p.status === 'approved').length,
    rejected: proposals.filter(p => p.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="my-proposals-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-proposals-container">
      <div className="proposals-header">
        <div>
          <h1>My Proposals</h1>
          <p className="subtitle">Track all your submitted job proposals</p>
        </div>
        <button 
          className="btn-browse-jobs"
          onClick={() => navigate('/freelancer/browse-jobs')}
        >
          <Send size={18} />
          Browse Jobs
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon all">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Proposals</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon approved">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.approved}</h3>
            <p>Approved</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rejected">
            <XCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({stats.total})
        </button>
        <button 
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({stats.pending})
        </button>
        <button 
          className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Approved ({stats.approved})
        </button>
        <button 
          className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({stats.rejected})
        </button>
      </div>

      {error && (
        <div className="error-alert">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <div className="empty-state">
          <Send size={64} className="empty-icon" />
          <h3>No proposals found</h3>
          <p>
            {filter === 'all' 
              ? "You haven't submitted any proposals yet. Browse jobs and start applying!"
              : `No ${filter} proposals at the moment.`
            }
          </p>
          {filter === 'all' && (
            <button 
              className="btn-browse"
              onClick={() => navigate('/freelancer/browse-jobs')}
            >
              Browse Jobs
            </button>
          )}
        </div>
      ) : (
        <div className="proposals-list">
          {filteredProposals.map((proposal) => (
            <div key={proposal.id} className="proposal-card">
              <div className="proposal-header-row">
                <div className="proposal-title-section">
                  <h3>{proposal.job?.title || 'Job Title'}</h3>
                  {getStatusBadge(proposal.status)}
                </div>
                <div className="proposal-meta">
                  <span className="meta-date">
                    Submitted {formatDate(proposal.created_at)}
                  </span>
                </div>
              </div>

              <div className="proposal-details">
                <div className="detail-item">
                  <DollarSign size={16} className="detail-icon" />
                  <span className="detail-label">Your Bid:</span>
                  <span className="detail-value">${proposal.proposed_price}</span>
                </div>

                <div className="detail-item">
                  <Clock size={16} className="detail-icon" />
                  <span className="detail-label">Delivery:</span>
                  <span className="detail-value">{proposal.delivery_time} days</span>
                </div>

                <div className="detail-item">
                  <DollarSign size={16} className="detail-icon" />
                  <span className="detail-label">Job Budget:</span>
                  <span className="detail-value">${proposal.job?.budget || 'N/A'}</span>
                </div>
              </div>

              <div className="proposal-cover-preview">
                <p className="cover-label">Cover Letter:</p>
                <p className="cover-text">
                  {proposal.cover_letter.length > 150 
                    ? `${proposal.cover_letter.substring(0, 150)}...` 
                    : proposal.cover_letter
                  }
                </p>
              </div>

              {proposal.milestones && proposal.milestones.length > 0 && (
                <div className="milestones-info">
                  <FileText size={14} />
                  <span>{proposal.milestones.length} milestone(s) included</span>
                </div>
              )}

              <div className="proposal-actions">
                <button 
                  className="btn-view-proposal"
                  onClick={() => navigate(`/freelancer/job/${proposal.job_post_id}`)}
                >
                  <Eye size={16} />
                  View Job
                </button>
                
                {proposal.status === 'approved' && (
                  <button 
                    className="btn-submit-work"
                    onClick={() => navigate(`/freelancer/submit-work/${proposal._id}`)}
                  >
                    <Send size={16} />
                    Submit Work
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProposalsFreelancer;
