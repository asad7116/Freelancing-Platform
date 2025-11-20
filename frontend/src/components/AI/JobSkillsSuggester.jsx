import React, { useState } from 'react';
import { Code, Sparkles, Check, X } from 'lucide-react';
import './JobSkillsSuggester.css';

const JobSkillsSuggester = ({ title, description, category, onApply }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);

  const handleSuggest = async () => {
    if (!description || description.trim().length < 30) {
      setError('Please provide a job description (at least 30 characters) to suggest skills');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ai/suggest-required-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, category })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to suggest skills');
      }

      setResult(data.data);
      setIsOpen(true);
    } catch (err) {
      setError(err.message);
      console.error('Error suggesting skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    // Combine all skills into a single array
    const allSkills = [
      ...(result.required || []),
      ...(result.preferred || [])
    ];
    onApply(allSkills);
    setIsOpen(false);
    setResult(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
  };

  return (
    <div className="job-skills-suggester">
      <button
        type="button"
        onClick={handleSuggest}
        disabled={loading || !description || description.trim().length < 30}
        className="suggest-skills-btn"
        title={!description || description.trim().length < 30 ? 'Add a job description first' : 'Suggest skills with AI'}
      >
        <Code size={18} />
        {loading ? 'Analyzing...' : 'Suggest Skills with AI'}
      </button>

      {error && (
        <div className="skills-error-message">
          {error}
        </div>
      )}

      {isOpen && result && (
        <div className="skills-suggester-modal">
          <div className="skills-suggester-content">
            <div className="skills-suggester-header">
              <h3>
                <Sparkles size={20} />
                AI-Suggested Required Skills
              </h3>
              <button onClick={handleClose} className="close-btn">
                <X size={20} />
              </button>
            </div>

            <div className="skills-suggester-body">
              {result.technicalSkills && result.technicalSkills.length > 0 && (
                <div className="skill-category">
                  <h4>🔧 Technical Skills</h4>
                  <div className="skills-list">
                    {result.technicalSkills.map((skill, index) => (
                      <span key={index} className="skill-tag technical">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.softSkills && result.softSkills.length > 0 && (
                <div className="skill-category">
                  <h4>💬 Soft Skills</h4>
                  <div className="skills-list">
                    {result.softSkills.map((skill, index) => (
                      <span key={index} className="skill-tag soft">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.required && result.required.length > 0 && (
                <div className="skill-category">
                  <h4>✅ Required Skills</h4>
                  <div className="skills-list">
                    {result.required.map((skill, index) => (
                      <span key={index} className="skill-tag required">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.preferred && result.preferred.length > 0 && (
                <div className="skill-category">
                  <h4>⭐ Preferred Skills</h4>
                  <div className="skills-list">
                    {result.preferred.map((skill, index) => (
                      <span key={index} className="skill-tag preferred">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.reasoning && (
                <div className="skills-reasoning">
                  <h4>💡 Reasoning</h4>
                  <p>{result.reasoning}</p>
                </div>
              )}
            </div>

            <div className="skills-suggester-footer">
              <button onClick={handleApply} className="apply-skills-btn">
                <Check size={16} />
                Apply All Skills
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

export default JobSkillsSuggester;
