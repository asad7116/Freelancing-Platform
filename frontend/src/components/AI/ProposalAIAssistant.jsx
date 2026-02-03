import React, { useState } from 'react';
import './ProposalAIAssistant.css';

/**
 * ProposalAIAssistant Component
 * Provides AI-powered generation and improvement for proposal cover letters
 * 
 * @param {Object} props
 * @param {string} props.mode - 'generate' or 'improve'
 * @param {string} props.value - Current cover letter text
 * @param {Function} props.onApply - Callback when user applies AI suggestion
 * @param {string} props.jobTitle - Job title for context
 * @param {string} props.jobDescription - Job description for context
 * @param {number} props.jobBudget - Job budget for context
 * @param {string} props.freelancerSkills - Freelancer's skills
 */
const ProposalAIAssistant = ({ 
  mode = 'generate', 
  value, 
  onApply, 
  jobTitle = '', 
  jobDescription = '',
  jobBudget = 0,
  freelancerSkills = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const getEndpoint = () => {
    return mode === 'generate'
      ? '/api/ai/generate-cover-letter'
      : '/api/ai/improve-cover-letter';
  };

  const getRequestBody = () => {
    if (mode === 'generate') {
      return { 
        jobTitle, 
        jobDescription, 
        jobBudget,
        freelancerSkills 
      };
    } else {
      return { 
        draft: value, 
        jobTitle, 
        jobDescription 
      };
    }
  };

  const handleGenerate = async () => {
    if (mode === 'generate' && !jobTitle) {
      setError('Job title is required to generate cover letter');
      return;
    }

    if (mode === 'improve' && (!value || value.trim().length === 0)) {
      setError('Please write a cover letter draft first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

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
        throw new Error(data.error || 'Failed to process cover letter');
      }

      setResult(data.data);
      setShowModal(true);
    } catch (err) {
      console.error('Proposal AI Error:', err);
      setError(err.message || 'Failed to connect to AI service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (text) => {
    onApply(text);
    setShowModal(false);
    setResult(null);
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleClose = () => {
    setShowModal(false);
    setError(null);
  };

  return (
    <div className="proposal-ai-assistant">
      <button
        type="button"
        className={`ai-btn ${mode === 'generate' ? 'generate' : 'improve'}`}
        onClick={handleGenerate}
        disabled={isLoading}
        title={mode === 'generate' ? 'Generate cover letter with AI' : 'Improve cover letter with AI'}
      >
        {isLoading ? (
          <>
            <span className="spinner"></span>
            {mode === 'generate' ? 'Generating...' : 'Improving...'}
          </>
        ) : (
          <>
            {mode === 'generate' ? '✨ Generate with AI' : '✨ Improve with AI'}
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

      {showModal && result && (
        <div className="ai-modal">
          <div className="ai-modal-overlay" onClick={handleClose}></div>
          <div className="ai-modal-content">
            <div className="ai-modal-header">
              <h3>✨ {mode === 'generate' ? 'Generated' : 'Improved'} Cover Letter</h3>
              <button className="close-btn" onClick={handleClose}>×</button>
            </div>

            <div className="ai-modal-body">
              <div className="cover-letter-section">
                <div className="cover-letter-preview">
                  {mode === 'generate' ? result.coverLetter : result.improved}
                </div>
                <button 
                  className="apply-btn primary"
                  onClick={() => handleApply(mode === 'generate' ? result.coverLetter : result.improved)}
                >
                  ✓ Apply This Cover Letter
                </button>
              </div>

              {mode === 'generate' && result.tips && result.tips.length > 0 && (
                <div className="tips-section">
                  <h4>💡 Tips for Your Proposal:</h4>
                  <ul className="tips-list">
                    {result.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {mode === 'improve' && result.improvements && result.improvements.length > 0 && (
                <div className="improvements-section">
                  <h4>📝 Improvements Made:</h4>
                  <ul className="improvements-list">
                    {result.improvements.map((improvement, index) => (
                      <li key={index}>{improvement}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="ai-modal-footer">
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

export default ProposalAIAssistant;
