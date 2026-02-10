import React, { useState } from 'react';
import { API_BASE_URL } from '../../lib/api';
import './MilestoneGenerator.css';

/**
 * MilestoneGenerator Component
 * Auto-generates project milestones based on job description
 * 
 * @param {Object} props
 * @param {string} props.jobDescription - Job description for context
 * @param {number} props.deliveryTime - Total delivery time in days
 * @param {number} props.totalBid - Total bid amount
 * @param {Function} props.onApplyMilestones - Callback to apply generated milestones
 */
const MilestoneGenerator = ({ 
  jobDescription, 
  deliveryTime, 
  totalBid, 
  onApplyMilestones 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const canGenerate = () => {
    return jobDescription && jobDescription.trim().length > 0 &&
           deliveryTime && deliveryTime > 0 &&
           totalBid && totalBid > 0;
  };

  const handleGenerate = async () => {
    if (!canGenerate()) {
      setError('Please fill in job description, delivery time, and bid amount first');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/generate-milestones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          jobDescription,
          deliveryTime,
          totalBid
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate milestones');
      }

      setResult(data.data);
      setShowModal(true);
    } catch (err) {
      console.error('Milestone Generator Error:', err);
      setError(err.message || 'Failed to connect to AI service');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (result && result.milestones) {
      onApplyMilestones(result.milestones);
      setShowModal(false);
      setResult(null);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setError(null);
  };

  return (
    <div className="milestone-generator">
      <button
        type="button"
        className="generate-btn"
        onClick={handleGenerate}
        disabled={isGenerating || !canGenerate()}
        title="Generate milestones with AI"
      >
        {isGenerating ? (
          <>
            <span className="spinner"></span>
            Generating...
          </>
        ) : (
          <>
            ✨ Generate Milestones with AI
          </>
        )}
      </button>

      {error && (
        <div className="generator-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button className="close-btn" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {showModal && result && (
        <div className="generator-modal">
          <div className="generator-modal-overlay" onClick={handleClose}></div>
          <div className="generator-modal-content">
            <div className="generator-modal-header">
              <h3>✨ Generated Milestones</h3>
              <button className="close-btn" onClick={handleClose}>×</button>
            </div>

            <div className="generator-modal-body">
              {result.milestones && result.milestones.length > 0 ? (
                <>
                  <div className="milestones-preview">
                    <h4>Project Breakdown ({result.milestones.length} milestones)</h4>
                    {result.milestones.map((milestone, index) => (
                      <div key={index} className="milestone-preview-card">
                        <div className="milestone-number">{index + 1}</div>
                        <div className="milestone-details">
                          <div className="milestone-description">
                            {milestone.description}
                          </div>
                          <div className="milestone-meta">
                            <span className="meta-item">
                              💵 ${milestone.amount}
                            </span>
                            <span className="meta-item">
                              ⏱️ {milestone.duration} days
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {result.tips && result.tips.length > 0 && (
                    <div className="tips-section">
                      <h4>💡 Milestone Planning Tips:</h4>
                      <ul className="tips-list">
                        {result.tips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button 
                    className="apply-milestones-btn"
                    onClick={handleApply}
                  >
                    ✓ Apply These Milestones
                  </button>
                </>
              ) : (
                <div className="no-milestones">
                  <p>No milestones were generated. Try again.</p>
                </div>
              )}
            </div>

            <div className="generator-modal-footer">
              <button className="regenerate-btn" onClick={handleGenerate}>
                🔄 Regenerate
              </button>
              <button className="cancel-btn" onClick={handleClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneGenerator;
