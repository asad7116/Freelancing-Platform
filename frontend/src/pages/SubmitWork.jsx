import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, FileText, Link as LinkIcon, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import '../styles/submit_work.css';
import { API_BASE_URL } from "../lib/api";

const SubmitWork = () => {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    submission_note: '',
    deliverable_links: ['']
  });

  useEffect(() => {
    fetchProposal();
  }, [proposalId]);

  const fetchProposal = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/proposals/${proposalId}`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setProposal(data.proposal);
        
        // Check if already submitted
        if (data.proposal.submission_status === 'submitted' || data.proposal.status === 'completed') {
          setError('This work has already been submitted');
        }
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.submission_note.trim()) {
      setError('Please provide submission notes');
      return;
    }

    const validLinks = formData.deliverable_links.filter(link => link.trim());
    if (validLinks.length === 0) {
      setError('Please provide at least one deliverable link');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/api/proposals/${proposalId}/submit-work`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          submission_note: formData.submission_note,
          deliverable_links: validLinks
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Work submitted successfully! The client will review your submission.');
        setTimeout(() => {
          navigate('/freelancer/orders');
        }, 2000);
      } else {
        setError(data.message || 'Failed to submit work');
      }
    } catch (err) {
      console.error('Error submitting work:', err);
      setError('Error submitting work');
    } finally {
      setSubmitting(false);
    }
  };

  const addLinkField = () => {
    setFormData(prev => ({
      ...prev,
      deliverable_links: [...prev.deliverable_links, '']
    }));
  };

  const removeLinkField = (index) => {
    setFormData(prev => ({
      ...prev,
      deliverable_links: prev.deliverable_links.filter((_, i) => i !== index)
    }));
  };

  const updateLink = (index, value) => {
    setFormData(prev => ({
      ...prev,
      deliverable_links: prev.deliverable_links.map((link, i) => 
        i === index ? value : link
      )
    }));
  };

  if (loading) {
    return (
      <div className="submit-work-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading proposal details...</p>
        </div>
      </div>
    );
  }

  if (error && !proposal) {
    return (
      <div className="submit-work-container">
        <div className="error-state">
          <AlertCircle size={64} className="error-icon" />
          <h3>Error Loading Proposal</h3>
          <p>{error}</p>
          <button className="btn-back" onClick={() => navigate('/freelancer/orders')}>
            <ArrowLeft size={16} />
            Back to My Proposals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="submit-work-container">
      <button className="btn-back-inline" onClick={() => navigate('/freelancer/orders')}>
        <ArrowLeft size={16} />
        Back to My Proposals
      </button>

      {success && (
        <div className="success-banner">
          <CheckCircle2 size={20} />
          {success}
        </div>
      )}

      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="submit-work-card">
        <div className="card-header">
          <FileText size={28} className="header-icon" />
          <div>
            <h1>Submit Your Work</h1>
            <p className="subtitle">Upload deliverables for: {proposal?.job?.title}</p>
          </div>
        </div>

        <div className="job-info-section">
          <h3>Job Details</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Your Bid:</span>
              <span className="info-value">${proposal?.proposed_price}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Delivery Time:</span>
              <span className="info-value">{proposal?.delivery_time} days</span>
            </div>
            <div className="info-item">
              <span className="info-label">Milestones:</span>
              <span className="info-value">{proposal?.milestones?.length || 0}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="submit-form">
          <div className="form-group">
            <label htmlFor="submission_note">
              Submission Notes <span className="required">*</span>
            </label>
            <textarea
              id="submission_note"
              value={formData.submission_note}
              onChange={(e) => setFormData(prev => ({ ...prev, submission_note: e.target.value }))}
              placeholder="Describe what you've delivered, any notes for the client, instructions, etc..."
              rows={8}
              required
            />
            <span className="char-count">{formData.submission_note.length} characters</span>
          </div>

          <div className="form-group">
            <label>
              Deliverable Links <span className="required">*</span>
            </label>
            <p className="field-hint">
              Provide links to your deliverables (Google Drive, Dropbox, GitHub, etc.)
            </p>
            
            {formData.deliverable_links.map((link, index) => (
              <div key={index} className="link-input-group">
                <LinkIcon size={18} className="link-icon" />
                <input
                  type="url"
                  value={link}
                  onChange={(e) => updateLink(index, e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="link-input"
                />
                {formData.deliverable_links.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLinkField(index)}
                    className="btn-remove-link"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addLinkField}
              className="btn-add-link"
            >
              + Add Another Link
            </button>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/freelancer/orders')}
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
                <>
                  <div className="spinner-small"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Work
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitWork;
