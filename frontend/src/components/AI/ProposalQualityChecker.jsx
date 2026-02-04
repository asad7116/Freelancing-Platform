import React, { useState } from 'react';
import './ProposalQualityChecker.css';

/**
 * ProposalQualityChecker Component
 * Analyzes the complete proposal and provides quality score with feedback
 * 
 * @param {Object} props
 * @param {Object} props.proposalData - Complete proposal data { coverLetter, proposedPrice, deliveryTime, jobBudget, jobDuration }
 */
const ProposalQualityChecker = ({ proposalData }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const canAnalyze = () => {
    return proposalData.coverLetter && proposalData.coverLetter.trim().length > 0 &&
           proposalData.proposedPrice && proposalData.proposedPrice > 0 &&
           proposalData.deliveryTime && proposalData.deliveryTime > 0;
  };

  const handleAnalyze = async () => {
    if (!canAnalyze()) {
      setError('Please fill in cover letter, bid amount, and delivery time first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch('/api/ai/analyze-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(proposalData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze proposal');
      }

      setAnalysis(data.data);
      setShowResults(true);
    } catch (err) {
      console.error('Proposal Quality Checker Error:', err);
      setError(err.message || 'Failed to connect to AI service');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="proposal-quality-checker">
      <div className="checker-header">
        <h3>🎯 AI Proposal Quality Checker</h3>
        <p>Get AI-powered feedback on your proposal quality before submitting</p>
      </div>

      <button
        type="button"
        className="analyze-btn"
        onClick={handleAnalyze}
        disabled={isAnalyzing || !canAnalyze()}
        title="Analyze your proposal with AI"
      >
        {isAnalyzing ? (
          <>
            <span className="spinner"></span> Analyzing...
          </>
        ) : (
          <>
            🔍 Check Proposal Quality
          </>
        )}
      </button>

      {error && (
        <div className="checker-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button className="close-btn" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {showResults && analysis && (
        <div className="analysis-results">
          <div className="score-section">
            <div className="score-circle" style={{ borderColor: getScoreColor(analysis.score) }}>
              <div className="score-value" style={{ color: getScoreColor(analysis.score) }}>
                {analysis.score}
              </div>
              <div className="score-label">{getScoreLabel(analysis.score)}</div>
            </div>
          </div>

          {analysis.strengths && analysis.strengths.length > 0 && (
            <div className="feedback-section strengths">
              <h4>✅ Strengths</h4>
              <ul>
                {analysis.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.improvements && analysis.improvements.length > 0 && (
            <div className="feedback-section improvements">
              <h4>📈 Areas for Improvement</h4>
              <ul>
                {analysis.improvements.map((improvement, index) => (
                  <li key={index}>{improvement}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.feedback && analysis.feedback.length > 0 && (
            <div className="feedback-section detailed">
              <h4>💡 Detailed Feedback</h4>
              <ul>
                {analysis.feedback.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            className="reanalyze-btn"
            onClick={handleAnalyze}
          >
            🔄 Re-analyze
          </button>
        </div>
      )}
    </div>
  );
};

export default ProposalQualityChecker;
