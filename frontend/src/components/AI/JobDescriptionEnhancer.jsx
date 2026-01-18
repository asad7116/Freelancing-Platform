import React, { useState } from 'react';
import { Wand2, Check, X, AlertCircle } from 'lucide-react';
import './JobDescriptionEnhancer.css';

const JobDescriptionEnhancer = ({ description, title, category, onApply }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);

  const handleEnhance = async () => {
    if (!description && !title) {
      setError('Please enter a title or description first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:4000/api/ai/enhance-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ description, title, category })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enhance description');
      }

      setResult(data.data);
      setIsOpen(true);
    } catch (err) {
      setError(err.message);
      console.error('Error enhancing description:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    onApply(result.enhanced);
    setIsOpen(false);
    setResult(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
  };

  return (
    <div className="job-description-enhancer">
      <button
        type="button"
        onClick={handleEnhance}
        disabled={loading || (!description && !title)}
        className="enhance-description-btn"
        title="Enhance with AI"
      >
        <Wand2 size={18} />
        {loading ? 'Enhancing...' : 'Enhance with AI'}
      </button>

      {error && (
        <div className="enhance-error-message">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {isOpen && result && (
        <div className="description-enhancer-modal">
          <div className="description-enhancer-content">
            <div className="description-enhancer-header">
              <h3>
                <Wand2 size={20} />
                AI-Enhanced Job Description
              </h3>
              <button onClick={handleClose} className="close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="description-enhancer-body">
              <div className="enhanced-description">
                <label>Enhanced Description</label>
                <div className="description-preview">
                  <p style={{ whiteSpace: 'pre-wrap' }}>{result.enhanced}</p>
                </div>
              </div>

              {result.improvements && result.improvements.length > 0 && (
                <div className="improvements-made">
                  <h4>✨ Improvements Made</h4>
                  <ul>
                    {result.improvements.map((improvement, index) => (
                      <li key={index}>{improvement}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="enhancement-tips">
                <h4>💡 Description Tips</h4>
                <ul>
                  <li>Clear project overview and goals</li>
                  <li>Specific requirements and deliverables</li>
                  <li>Structured and easy to read</li>
                  <li>Professional tone</li>
                </ul>
              </div>
            </div>

            <div className="description-enhancer-footer">
              <button onClick={handleApply} className="apply-enhanced-btn">
                <Check size={16} />
                Apply Enhanced Description
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

export default JobDescriptionEnhancer;
