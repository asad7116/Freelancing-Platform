import React, { useState } from 'react';
import './AIAssistant.css';

/**
 * AIAssistant Component
 * Provides AI-powered improvements for gig fields
 * 
 * @param {Object} props
 * @param {string} props.type - Type of assistance: 'title' or 'description'
 * @param {string} props.value - Current field value
 * @param {Function} props.onApply - Callback when user applies AI suggestion
 * @param {string} props.category - Gig category for context
 * @param {string} props.title - Gig title (for description enhancement)
 */
const AIAssistant = ({ type, value, onApply, category = '', title = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const getEndpoint = () => {
    return type === 'title' 
      ? '/api/ai/improve-title'
      : '/api/ai/enhance-description';
  };

  const getRequestBody = () => {
    if (type === 'title') {
      return { title: value, category };
    } else {
      return { description: value, title, category };
    }
  };

  const handleImprove = async () => {
    if (!value || value.trim().length === 0) {
      setError(`Please enter a ${type} first`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestions(null);

    try {
      const response = await fetch(getEndpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(getRequestBody())
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI suggestions');
      }

      setSuggestions(data.data);
      setShowSuggestions(true);
    } catch (err) {
      console.error('AI Assistant Error:', err);
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
        disabled={isLoading || !value}
        title={`Improve ${type} with AI`}
      >
        {isLoading ? (
          <>
            <span className="spinner"></span> Improving...
          </>
        ) : (
          <>
            ✨ Improve with AI
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
              <h3>✨ AI Suggestions</h3>
              <button className="close-btn" onClick={handleClose}>×</button>
            </div>

            <div className="ai-suggestions-body">
              {type === 'title' && (
                <>
                  <div className="suggestion-section">
                    <h4>Best Suggestion:</h4>
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
                      <h4>More Options:</h4>
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
                </>
              )}

              {type === 'description' && (
                <>
                  <div className="suggestion-section">
                    <h4>Enhanced Description:</h4>
                    <div className="suggestion-card primary">
                      <p className="description-preview">{suggestions.enhanced}</p>
                      <button 
                        className="apply-btn"
                        onClick={() => handleApplySuggestion(suggestions.enhanced)}
                      >
                        Apply This
                      </button>
                    </div>
                  </div>

                  {suggestions.tips && suggestions.tips.length > 0 && (
                    <div className="suggestion-section">
                      <h4>💡 Tips for Improvement:</h4>
                      <ul className="tips-list">
                        {suggestions.tips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
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

export default AIAssistant;
