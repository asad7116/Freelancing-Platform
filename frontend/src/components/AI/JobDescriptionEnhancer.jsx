import React, { useState } from 'react';
import './AIAssistant.css';

/**
 * JobDescriptionEnhancer Component
 * Provides AI-powered description enhancement for job posts
 * Uses the same backend endpoint and styling as gig AIAssistant
 * 
 * @param {Object} props
 * @param {string} props.description - Current job description
 * @param {string} props.title - Job title for context
 * @param {string} props.category - Job category for context
 * @param {Function} props.onApply - Callback when user applies AI suggestion
 */
const JobDescriptionEnhancer = ({ description, title, category, onApply }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleEnhance = async () => {
    if (!description || description.trim().length < 10) {
      setError('Please enter a description with at least 10 characters first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ai/enhance-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          description, 
          title: title || '', 
          category: category || '' 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enhance description');
      }

      // Backend returns: { enhanced: string, tips: string[] }
      setResult(data.data);
      setShowResult(true);
    } catch (err) {
      console.error('Job Description Enhancer Error:', err);
      setError(err.message || 'Failed to connect to AI service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (result && result.enhanced) {
      onApply(result.enhanced);
      setShowResult(false);
      setResult(null);
    }
  };

  const handleRegenerate = () => {
    handleEnhance();
  };

  const handleClose = () => {
    setShowResult(false);
    setError(null);
  };

  return (
    <div className="ai-assistant">
      <button
        type="button"
        className="ai-improve-btn"
        onClick={handleEnhance}
        disabled={isLoading || !description || description.trim().length < 10}
        title="Enhance description with AI"
      >
        {isLoading ? (
          <>
            <span className="spinner"></span> Enhancing...
          </>
        ) : (
          <>
            ✨ Enhance with AI
          </>
        )}
      </button>

      {error && (
        <div className="ai-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button className="close-btn" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {showResult && result && (
        <div className="ai-suggestions-modal">
          <div className="ai-suggestions-overlay" onClick={handleClose}></div>
          <div className="ai-suggestions-content">
            <div className="ai-suggestions-header">
              <h3>✨ AI-Enhanced Description</h3>
              <button className="close-btn" onClick={handleClose}>×</button>
            </div>

            <div className="ai-suggestions-body">
              <div className="suggestion-section">
                <h4>Enhanced Description:</h4>
                <div className="suggestion-card primary">
                  <p className="description-preview" style={{ whiteSpace: 'pre-wrap' }}>
                    {result.enhanced}
                  </p>
                  <button 
                    className="apply-btn"
                    onClick={handleApply}
                  >
                    Apply This
                  </button>
                </div>
              </div>

              {result.tips && result.tips.length > 0 && (
                <div className="suggestion-section">
                  <h4>💡 Tips for Improvement:</h4>
                  <ul className="tips-list">
                    {result.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="ai-suggestions-footer">
              <button className="regenerate-btn" onClick={handleRegenerate}>
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

export default JobDescriptionEnhancer;
