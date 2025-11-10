import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Users, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  Eye,
  FileText
} from 'lucide-react';
import '../styles/client_proposals_list.css';

const ClientProposalsList = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobsWithProposals();
  }, []);

  const fetchJobsWithProposals = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/proposals/client', {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setJobs(data.jobs);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalProposals = jobs.reduce((sum, job) => sum + job.totalProposals, 0);
  const totalPending = jobs.reduce((sum, job) => sum + job.pendingProposals, 0);

  if (loading) {
    return (
      <div className="client-proposals-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-proposals-container">
      <div className="proposals-header">
        <div>
          <h1>Received Proposals</h1>
          <p className="subtitle">Review and manage proposals from freelancers</p>
        </div>
        <button 
          className="btn-post-job"
          onClick={() => navigate('/client/PostJob')}
        >
          <Briefcase size={18} />
          Post New Job
        </button>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card-large">
          <div className="stat-icon-large jobs">
            <Briefcase size={28} />
          </div>
          <div className="stat-content-large">
            <h2>{jobs.length}</h2>
            <p>Jobs with Proposals</p>
          </div>
        </div>

        <div className="stat-card-large">
          <div className="stat-icon-large proposals">
            <FileText size={28} />
          </div>
          <div className="stat-content-large">
            <h2>{totalProposals}</h2>
            <p>Total Proposals</p>
          </div>
        </div>

        <div className="stat-card-large">
          <div className="stat-icon-large pending">
            <Clock size={28} />
          </div>
          <div className="stat-content-large">
            <h2>{totalPending}</h2>
            <p>Pending Review</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="empty-state">
          <Users size={64} className="empty-icon" />
          <h3>No Proposals Yet</h3>
          <p>
            You haven't received any proposals yet. Post a job to start receiving proposals from talented freelancers!
          </p>
          <button 
            className="btn-post"
            onClick={() => navigate('/client/PostJob')}
          >
            <Briefcase size={18} />
            Post a Job
          </button>
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <div key={job.id} className="job-proposals-card">
              <div className="job-card-header">
                <div className="job-title-section">
                  <h3>{job.title}</h3>
                  <span className="job-date">Posted {formatDate(job.created_at)}</span>
                </div>
                <div className="job-budget">
                  <DollarSign size={16} />
                  ${job.budget}
                </div>
              </div>

              <div className="proposals-stats">
                <div className="stat-item">
                  <div className="stat-icon-small total">
                    <Users size={20} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-number">{job.totalProposals}</span>
                    <span className="stat-label">Total Proposals</span>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon-small pending-small">
                    <Clock size={20} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-number">{job.pendingProposals}</span>
                    <span className="stat-label">Pending</span>
                  </div>
                </div>

                <div className="stat-item">
                  <div className="stat-icon-small approved">
                    <CheckCircle size={20} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-number">{job.totalProposals - job.pendingProposals}</span>
                    <span className="stat-label">Reviewed</span>
                  </div>
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="btn-view-proposals"
                  onClick={() => navigate(`/client/proposals/job/${job.id}`)}
                >
                  <Eye size={18} />
                  View Proposals
                </button>
                <button 
                  className="btn-view-job"
                  onClick={() => navigate(`/client/job/${job.id}`)}
                >
                  View Job Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientProposalsList;
