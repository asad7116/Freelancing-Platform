import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, 
  DollarSign, 
  Clock, 
  FileText, 
  AlertCircle,
  CheckCircle,
  ArrowLeft 
} from 'lucide-react';
import '../styles/submit_proposal.css';
import ProposalAIAssistant from '../components/AI/ProposalAIAssistant';
import ProposalQualityChecker from '../components/AI/ProposalQualityChecker';
import BidAnalyzer from '../components/AI/BidAnalyzer';
import MilestoneGenerator from '../components/AI/MilestoneGenerator';

const SubmitProposal = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [proposal, setProposal] = useState({
    cover_letter: '',
    proposed_price: '',
    delivery_time: '',
    attachments: [],
    milestones: []
  });

  const [milestone, setMilestone] = useState({
    description: '',
    amount: '',
    duration: ''
  });

  const fetchJobDetails = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/job-posts/${jobId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        // API returns { success: true, data: { ...jobPost } }
        setJobDetails(result.data || result);
      } else {
        setError('Failed to load job details');
      }
    } catch (err) {
      console.error('Error fetching job:', err);
      setError('Error loading job details');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProposal(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addMilestone = () => {
    if (milestone.description && milestone.amount && milestone.duration) {
      setProposal(prev => ({
        ...prev,
        milestones: [...prev.milestones, { ...milestone }]
      }));
      setMilestone({ description: '', amount: '', duration: '' });
    }
  };

  const removeMilestone = (index) => {
    setProposal(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Validation
    if (!proposal.cover_letter.trim()) {
      setError('Please write a cover letter');
      setSubmitting(false);
      return;
    }

    if (!proposal.proposed_price || proposal.proposed_price <= 0) {
      setError('Please enter a valid bid amount');
      setSubmitting(false);
      return;
    }

    if (!proposal.delivery_time || proposal.delivery_time <= 0) {
      setError('Please enter a valid delivery time');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          job_post_id: jobId,
          ...proposal
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/freelancer/my-orders');
        }, 2000);
      } else {
        setError(data.message || 'Failed to submit proposal');
      }
    } catch (err) {
      console.error('Error submitting proposal:', err);
      setError('Error submitting proposal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="submit-proposal-container">
        <div className="loading-spinner">Loading job details...</div>
      </div>
    );
  }

  if (!jobDetails) {
    return (
      <div className="submit-proposal-container">
        <div className="error-message">
          <AlertCircle size={24} />
          <p>Job not found</p>
          <button onClick={() => navigate(-1)} className="btn-back">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="submit-proposal-container">
        <div className="success-message">
          <CheckCircle size={64} className="success-icon" />
          <h2>Proposal Submitted Successfully!</h2>
          <p>Redirecting to My Orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="submit-proposal-container">
      <button onClick={() => navigate(-1)} className="btn-back-inline">
        <ArrowLeft size={20} />
        Back to Jobs
      </button>

      <div className="proposal-header">
        <h1>Submit Proposal</h1>
        <p className="subtitle">Send your proposal for this project</p>
      </div>

      {/* Job Details Card */}
      {jobDetails && (
        <div className="job-details-card">
          <h2>{jobDetails.title}</h2>
          <div className="job-meta">
            <span className="meta-item">
              <DollarSign size={16} />
              Budget: ${jobDetails.budget}
            </span>
            <span className="meta-item">
              <Clock size={16} />
              Duration: {jobDetails.duration}
            </span>
          </div>
          <p className="job-description">{jobDetails.description}</p>
        </div>
      )}

      {error && (
        <div className="error-alert">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Proposal Form */}
      {jobDetails && (
        <form onSubmit={handleSubmit} className="proposal-form">
        {/* Cover Letter */}
        <div className="form-section">
          <label className="form-label">
            <FileText size={20} />
            Cover Letter *
          </label>
          <textarea
            name="cover_letter"
            value={proposal.cover_letter}
            onChange={handleChange}
            placeholder="Explain why you're the best fit for this project..."
            rows="8"
            className="form-textarea"
            required
          />
          <div className="char-count">{proposal.cover_letter.length} characters</div>
          
          {/* AI Assistants for Cover Letter */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <ProposalAIAssistant
              mode="generate"
              value={proposal.cover_letter}
              onApply={(text) => setProposal(prev => ({ ...prev, cover_letter: text }))}
              jobTitle={jobDetails?.title}
              jobDescription={jobDetails?.description}
              jobBudget={jobDetails?.budget}
              freelancerSkills=""
            />
            {proposal.cover_letter.trim().length > 0 && (
              <ProposalAIAssistant
                mode="improve"
                value={proposal.cover_letter}
                onApply={(text) => setProposal(prev => ({ ...prev, cover_letter: text }))}
                jobTitle={jobDetails?.title}
                jobDescription={jobDetails?.description}
              />
            )}
          </div>
        </div>

        {/* Bid Amount */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              <DollarSign size={20} />
              Your Bid Amount ($) *
            </label>
            <input
              type="number"
              name="proposed_price"
              value={proposal.proposed_price}
              onChange={handleChange}
              placeholder="0.00"
              min="1"
              step="0.01"
              className="form-input"
              required
            />
            <small className="form-hint">
              Client's budget: ${jobDetails.budget}
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Clock size={20} />
              Delivery Time (days) *
            </label>
            <input
              type="number"
              name="delivery_time"
              value={proposal.delivery_time}
              onChange={handleChange}
              placeholder="7"
              min="1"
              className="form-input"
              required
            />
            <small className="form-hint">
              Expected project duration
            </small>
          </div>
        </div>

        {/* AI Bid Analyzer */}
        <BidAnalyzer
          jobDescription={jobDetails?.description}
          jobBudget={jobDetails?.budget}
          currentBid={proposal.proposed_price}
          deliveryTime={proposal.delivery_time}
          milestonesCount={proposal.milestones.length}
        />

        {/* Milestones (Optional) */}
        <div className="form-section">
          <label className="form-label">
            Milestones (Optional)
          </label>
          <p className="form-description">
            Break down your project into milestones for better project management
          </p>

          {/* AI Milestone Generator */}
          <MilestoneGenerator
            jobDescription={jobDetails?.description}
            deliveryTime={proposal.delivery_time}
            totalBid={proposal.proposed_price}
            onApplyMilestones={(milestones) => {
              setProposal(prev => ({
                ...prev,
                milestones: milestones
              }));
            }}
          />

          {proposal.milestones.length > 0 && (
            <div className="milestones-list">
              {proposal.milestones.map((m, index) => (
                <div key={index} className="milestone-item">
                  <div className="milestone-content">
                    <strong>{m.description}</strong>
                    <span>${m.amount} • {m.duration} days</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMilestone(index)}
                    className="btn-remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="milestone-form">
            <input
              type="text"
              placeholder="Milestone description"
              value={milestone.description}
              onChange={(e) => setMilestone({...milestone, description: e.target.value})}
              className="form-input"
            />
            <input
              type="number"
              placeholder="Amount ($)"
              value={milestone.amount}
              onChange={(e) => setMilestone({...milestone, amount: e.target.value})}
              className="form-input"
              min="1"
            />
            <input
              type="number"
              placeholder="Duration (days)"
              value={milestone.duration}
              onChange={(e) => setMilestone({...milestone, duration: e.target.value})}
              className="form-input"
              min="1"
            />
            <button
              type="button"
              onClick={addMilestone}
              className="btn-add-milestone"
              disabled={!milestone.description || !milestone.amount || !milestone.duration}
            >
              Add Milestone
            </button>
          </div>
        </div>

        {/* AI Proposal Quality Checker */}
        <ProposalQualityChecker
          proposalData={{
            coverLetter: proposal.cover_letter,
            proposedPrice: proposal.proposed_price,
            deliveryTime: proposal.delivery_time,
            jobBudget: jobDetails?.budget,
            jobDuration: jobDetails?.duration
          }}
        />

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-cancel"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={submitting}
          >
            {submitting ? (
              'Submitting...'
            ) : (
              <>
                <Send size={20} />
                Submit Proposal
              </>
            )}
          </button>
        </div>
      </form>
      )}
    </div>
  );
};

export default SubmitProposal;
