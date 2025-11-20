import React, { useState } from 'react';
import { Sparkles, RefreshCw, Check, X } from 'lucide-react';
import './JobTitleGenerator.css';

const JobTitleGenerator = ({ description, category, onApply }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!description || description.trim().length < 10) {
      setError('Please provide a brief job description (at least 10 characters) to generate a title');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ai/generate-job-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ description, category })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate title');
      }

      setResult(data.data);
      setIsOpen(true);
    } catch (err) {
      setError(err.message);
      console.error('Error generating title:', err);
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
        onClick={handleGenerate}
        disabled={loading || !description || description.trim().length < 10}
        className="generate-title-btn"
        title={!description || description.trim().length < 10 ? 'Add a brief job description first (at least 10 characters)' : 'Generate AI title'}
      >
        <Sparkles size={18} />
        {loading ? 'Generating...' : 'Generate Title with AI'}
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
                AI-Generated Job Titles
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
              <button onClick={handleGenerate} className="regenerate-btn">
                <RefreshCw size={16} />
                Regenerate
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
