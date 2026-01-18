import React, { useState } from 'react';
import { Sparkles, RefreshCw, Check, X } from 'lucide-react';
import './JobTitleGenerator.css';

const JobTitleGenerator = ({ currentTitle, category, onApply }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImprove = async () => {
    if (!currentTitle || currentTitle.trim().length < 5) {
      setError('Please enter a title with at least 5 characters first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:4000/api/ai/improve-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ title: currentTitle, category })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to improve title');
      }

      setResult(data.data);
      setIsOpen(true);
    } catch (err) {
      setError(err.message);
      console.error('Error improving title:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (title) => {
    onApply(title);
    setIsOpen(false);
    setResult(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
  };

  return (
    <div className="job-title-generator">
      <button
        type="button"
        onClick={handleImprove}
        disabled={loading || !currentTitle || currentTitle.trim().length < 5}
        className="generate-title-btn"
        title="Improve title with AI"
      >
        <Sparkles size={18} />
        {loading ? 'Improving...' : 'Improve Title with AI'}
      </button>

      {error && (
        <div className="title-error-message">
          {error}
        </div>
      )}

      {isOpen && result && (
        <div className="title-generator-modal">
          <div className="title-generator-content">
            <div className="title-generator-header">
              <h3>
                <Sparkles size={20} />
                AI-Improved Job Titles
              </h3>
              <button onClick={handleClose} className="close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="title-generator-body">
              <div className="recommended-title">
                <label>Recommended Title</label>
                <div className="title-option main-title">
                  <p>{result.title}</p>
                  <button 
                    onClick={() => handleApply(result.title)}
                    className="apply-btn"
                  >
                    <Check size={16} />
                    Apply
                  </button>
                </div>
              </div>

              {result.alternatives && result.alternatives.length > 0 && (
                <div className="alternative-titles">
                  <label>Alternative Options</label>
                  {result.alternatives.map((alt, index) => (
                    <div key={index} className="title-option">
                      <p>{alt}</p>
                      <button 
                        onClick={() => handleApply(alt)}
                        className="apply-btn secondary"
                      >
                        <Check size={16} />
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="title-tips">
                <h4>💡 Title Tips</h4>
                <ul>
                  <li>Keep it clear and specific</li>
                  <li>Include key skills or role type</li>
                  <li>Avoid vague terms</li>
                  <li>Make it professional and searchable</li>
                </ul>
              </div>
            </div>

            <div className="title-generator-footer">
              <button onClick={handleImprove} className="regenerate-btn">
                <RefreshCw size={16} />
                Re-improve
              </button>
              <button onClick={handleClose} className="cancel-btn">
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
