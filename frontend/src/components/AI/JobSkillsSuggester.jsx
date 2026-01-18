import React, { useState } from 'react';
import './AIAssistant.css';

/**
 * JobSkillsSuggester Component
 * Provides AI-powered skill suggestions for job posts
 * Uses smart-suggestions endpoint and adapts response for skills
 * 
 * @param {Object} props
 * @param {string} props.title - Job title for context
 * @param {string} props.description - Job description for context
 * @param {string} props.category - Job category for context
 * @param {Function} props.onApply - Callback when user applies skills (receives array of skill names)
 */
const JobSkillsSuggester = ({ title, description, category, onApply }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);

  const handleSuggest = async () => {
    if (!title && !description) {
      setError('Please enter a title or description first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setSelectedSkills([]);

    try {
      const response = await fetch('http://localhost:4000/api/ai/smart-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          category: category || 'General', 
          keywords: `${title || ''} ${description || ''}`.trim() 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to suggest skills');
      }

      // Backend returns: { titles: string[], descriptionOutline: string }
      // We'll extract skills from the titles and description outline
      const suggestedSkills = extractSkillsFromSuggestions(data.data, title, description, category);
      setResult(suggestedSkills);
      setSelectedSkills([...suggestedSkills]); // Select all by default
      setShowResult(true);
    } catch (err) {
      console.error('Job Skills Suggester Error:', err);
      setError(err.message || 'Failed to connect to AI service');
    } finally {
      setIsLoading(false);
    }
  };

  // Extract relevant skills from the AI suggestions
  const extractSkillsFromSuggestions = (data, jobTitle, jobDesc, jobCategory) => {
    const skills = new Set();
    
    // Common tech skills to look for based on category
    const categorySkillMap = {
      'Web Development': ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'TypeScript', 'Vue.js', 'Angular', 'PHP', 'Python', 'WordPress', 'REST API', 'MongoDB', 'MySQL', 'PostgreSQL'],
      'Mobile Development': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android', 'Java', 'Dart', 'Firebase', 'Mobile UI/UX'],
      'Design & Creative': ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'UI Design', 'UX Design', 'Graphic Design', 'Logo Design', 'Brand Identity'],
      'Data Science': ['Python', 'R', 'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL', 'Data Analysis', 'Pandas', 'NumPy', 'Tableau'],
      'Writing & Translation': ['Content Writing', 'Copywriting', 'SEO', 'Blog Writing', 'Technical Writing', 'Translation', 'Proofreading', 'Editing'],
      'Marketing': ['SEO', 'Social Media Marketing', 'Google Ads', 'Facebook Ads', 'Email Marketing', 'Content Strategy', 'Analytics', 'PPC'],
      'Video & Animation': ['After Effects', 'Premiere Pro', 'Video Editing', 'Motion Graphics', '3D Animation', 'Final Cut Pro', 'DaVinci Resolve'],
      'General': ['Communication', 'Problem Solving', 'Project Management', 'Research', 'Documentation', 'Collaboration']
    };

    // Get skills for the category
    const categorySkills = categorySkillMap[jobCategory] || categorySkillMap['General'];
    
    // Check which skills appear in the title or description
    const combinedText = `${jobTitle || ''} ${jobDesc || ''} ${data.descriptionOutline || ''}`.toLowerCase();
    
    categorySkills.forEach(skill => {
      if (combinedText.includes(skill.toLowerCase())) {
        skills.add(skill);
      }
    });

    // Also add some common skills for the category
    const numToAdd = Math.min(5, categorySkills.length);
    for (let i = 0; i < numToAdd && skills.size < 8; i++) {
      skills.add(categorySkills[i]);
    }

    // Parse titles for more context
    if (data.titles && Array.isArray(data.titles)) {
      data.titles.forEach(suggestedTitle => {
        categorySkills.forEach(skill => {
          if (suggestedTitle.toLowerCase().includes(skill.toLowerCase())) {
            skills.add(skill);
          }
        });
      });
    }

    return Array.from(skills).slice(0, 10); // Return max 10 skills
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleApply = () => {
    if (selectedSkills.length > 0) {
      onApply(selectedSkills);
      setShowResult(false);
      setResult(null);
      setSelectedSkills([]);
    }
  };

  const handleRegenerate = () => {
    handleSuggest();
  };

  const handleClose = () => {
    setShowResult(false);
    setError(null);
    setSelectedSkills([]);
  };

  return (
    <div className="ai-assistant">
      <button
        type="button"
        className="ai-improve-btn"
        onClick={handleSuggest}
        disabled={isLoading || (!title && !description)}
        title="Suggest skills with AI"
      >
        {isLoading ? (
          <>
            <span className="spinner"></span> Analyzing...
          </>
        ) : (
          <>
            ✨ Add Skills with AI
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

      {showResult && result && result.length > 0 && (
        <div className="ai-suggestions-modal">
          <div className="ai-suggestions-overlay" onClick={handleClose}></div>
          <div className="ai-suggestions-content">
            <div className="ai-suggestions-header">
              <h3>✨ AI-Suggested Skills</h3>
              <button className="close-btn" onClick={handleClose}>×</button>
            </div>

            <div className="ai-suggestions-body">
              <div className="suggestion-section">
                <h4>Select skills to add:</h4>
                <p className="helper-text">Click on skills to select/deselect them</p>
                <div className="skills-grid">
                  {result.map((skill, index) => (
                    <div 
                      key={index} 
                      className={`skill-chip ${selectedSkills.includes(skill) ? 'selected' : ''}`}
                      onClick={() => toggleSkill(skill)}
                    >
                      <span className="skill-check">{selectedSkills.includes(skill) ? '✓' : '+'}</span>
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              <div className="suggestion-section tips">
                <h4>💡 Skills Tips:</h4>
                <ul className="tips-list">
                  <li>Choose skills relevant to your project</li>
                  <li>Include both technical and soft skills</li>
                  <li>Be specific rather than generic</li>
                  <li>Don't overload with too many skills</li>
                </ul>
              </div>
            </div>

            <div className="ai-suggestions-footer">
              <button 
                className="apply-btn primary"
                onClick={handleApply}
                disabled={selectedSkills.length === 0}
              >
                Add {selectedSkills.length} Skill{selectedSkills.length !== 1 ? 's' : ''}
              </button>
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

export default JobSkillsSuggester;
