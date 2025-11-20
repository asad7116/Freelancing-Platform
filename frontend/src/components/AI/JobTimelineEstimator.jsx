import React, { useState } from 'react';
import { Clock, Calendar, Check, X } from 'lucide-react';
import './JobTimelineEstimator.css';

const JobTimelineEstimator = ({ title, description, category, budget, onApply }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);

  const handleEstimate = async () => {
    if (!description && !title) {
      setError('Please enter a title or description first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:4000/api/ai/estimate-project-timeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ title, description, category, budget })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to estimate timeline');
      }

      setResult(data.data);
      setIsOpen(true);
    } catch (err) {
      setError(err.message);
      console.error('Error estimating timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (days) => {
    onApply(days);
    setIsOpen(false);
    setResult(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
  };

  return (
    <div className="job-timeline-estimator">
      <button
        type="button"
        onClick={handleEstimate}
        disabled={loading || (!description && !title)}
        className="estimate-timeline-btn"
        title="Estimate timeline with AI"
      >
        <Clock size={18} />
        {loading ? 'Estimating...' : 'Estimate Timeline with AI'}
      </button>

      {error && (
        <div className="timeline-error-message">
          {error}
        </div>
      )}

      {isOpen && result && (
        <div className="timeline-estimator-modal">
          <div className="timeline-estimator-content">
            <div className="timeline-estimator-header">
              <h3>
                <Calendar size={20} />
                AI Project Timeline Estimate
              </h3>
              <button onClick={handleClose} className="close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="timeline-estimator-body">
              <div className="timeline-estimates">
                <div className="estimate-card main-estimate">
                  <span className="estimate-label">Recommended Duration</span>
                  <div className="estimate-value">
                    <span className="days">{result.estimatedDays}</span>
                    <span className="unit">days</span>
                  </div>
                  <button 
                    onClick={() => handleApply(result.estimatedDays)}
                    className="apply-btn"
                  >
                    <Check size={16} />
                    Apply
                  </button>
                </div>

                <div className="estimate-range">
                  <div className="range-item">
                    <span className="range-label">Minimum</span>
                    <div className="range-value">
                      <span>{result.minDays}</span>
                      <button 
                        onClick={() => handleApply(result.minDays)}
                        className="apply-btn-small"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="range-item">
                    <span className="range-label">Maximum</span>
                    <div className="range-value">
                      <span>{result.maxDays}</span>
                      <button 
                        onClick={() => handleApply(result.maxDays)}
                        className="apply-btn-small"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {result.phases && result.phases.length > 0 && (
                <div className="timeline-phases">
                  <h4>📅 Project Phases</h4>
                  <div className="phases-list">
                    {result.phases.map((phase, index) => (
                      <div key={index} className="phase-item">
                        <div className="phase-header">
                          <span className="phase-name">{phase.name}</span>
                          <span className="phase-duration">{phase.days} days</span>
                        </div>
                        <p className="phase-description">{phase.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.reasoning && (
                <div className="timeline-reasoning">
                  <h4>💡 Reasoning</h4>
                  <p>{result.reasoning}</p>
                </div>
              )}

              {result.considerations && result.considerations.length > 0 && (
                <div className="timeline-considerations">
                  <h4>⚠️ Important Considerations</h4>
                  <ul>
                    {result.considerations.map((consideration, index) => (
                      <li key={index}>{consideration}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="timeline-estimator-footer">
              <button onClick={handleClose} className="cancel-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobTimelineEstimator;
