import React, { useState } from 'react';
import './AIAssistant.css';

/**
 * JobTitleGenerator Component
 * Provides AI-powered title improvements for job posts
 * Uses the same backend endpoint and styling as gig AIAssistant
 * 
 * @param {Object} props
 * @param {string} props.currentTitle - Current job title
 * @param {string} props.category - Job category for context
 * @param {Function} props.onApply - Callback when user applies AI suggestion
 */
const JobTitleGenerator = ({ currentTitle, category, onApply }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleImprove = async () => {
    if (!currentTitle || currentTitle.trim().length < 3) {
      setError('Please enter a title with at least 3 characters first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestions(null);

    try {
      const response = await fetch('http://localhost:4000/api/ai/improve-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ title: currentTitle, category: category || '' })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to improve title');
      }

      // Backend returns: { improved: string, suggestions: string[] }
      setSuggestions(data.data);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Job Title Generator Error:', err);
      setError(err.message || 'Failed to connect to AI service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySuggestion = (suggestion) => {
    onApply(suggestion);
    setShowSuggestions(false);
    setSuggestions(null);
  };

  const handleRegenerate = () => {
    handleImprove();
  };

  const handleClose = () => {
    setShowSuggestions(false);
    setError(null);
  };

  return (
    <div className="ai-assistant">
      <button
        type="button"
        className="ai-improve-btn"
        onClick={handleImprove}
        disabled={isLoading || !currentTitle || currentTitle.trim().length < 3}
        title="Improve title with AI"
      >
        {isLoading ? (
          <>
            <span className="spinner"></span> Improving...
          </>
        ) : (
          <>
            ✨ Improve Title with AI
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

      {showSuggestions && suggestions && (
        <div className="ai-suggestions-modal">
          <div className="ai-suggestions-overlay" onClick={handleClose}></div>
          <div className="ai-suggestions-content">
            <div className="ai-suggestions-header">
              <h3>✨ AI-Improved Job Titles</h3>
              <button className="close-btn" onClick={handleClose}>×</button>
            </div>

            <div className="ai-suggestions-body">
              <div className="suggestion-section">
                <h4>Recommended Title:</h4>
                <div className="suggestion-card primary">
                  <p>{suggestions.improved}</p>
                  <button 
                    className="apply-btn"
                    onClick={() => handleApplySuggestion(suggestions.improved)}
                  >
                    Apply This
                  </button>
                </div>
              </div>

              {suggestions.suggestions && suggestions.suggestions.length > 0 && (
                <div className="suggestion-section">
                  <h4>Alternative Options:</h4>
                  {suggestions.suggestions.map((suggestion, index) => (
                    <div key={index} className="suggestion-card">
                      <p>{suggestion}</p>
                      <button 
                        className="apply-btn secondary"
                        onClick={() => handleApplySuggestion(suggestion)}
                      >
                        Use This
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="suggestion-section tips">
                <h4>💡 Title Tips:</h4>
                <ul className="tips-list">
                  <li>Keep it clear and specific</li>
                  <li>Include key skills or role type</li>
                  <li>Avoid vague or generic terms</li>
                  <li>Make it professional and searchable</li>
                </ul>
              </div>
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

export default JobTitleGenerator;
