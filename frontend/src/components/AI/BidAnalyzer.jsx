import React, { useState, useEffect } from 'react';
import './BidAnalyzer.css';

/**
 * BidAnalyzer Component
 * Analyzes bid amount and provides smart pricing recommendations
 * 
 * @param {Object} props
 * @param {string} props.jobDescription - Job description for context
 * @param {number} props.jobBudget - Client's budget
 * @param {number} props.currentBid - Current bid amount entered
 * @param {number} props.deliveryTime - Proposed delivery time
 * @param {number} props.milestonesCount - Number of milestones
 */
const BidAnalyzer = ({ 
  jobDescription, 
  jobBudget, 
  currentBid, 
  deliveryTime,
  milestonesCount = 0 
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Auto-analyze when bid changes (debounced)
  useEffect(() => {
    if (currentBid && currentBid > 0 && jobDescription) {
      const timer = setTimeout(() => {
        handleAnalyze();
      }, 1500); // Debounce 1.5 seconds

      return () => clearTimeout(timer);
    }
  }, [currentBid]);

  const canAnalyze = () => {
    return jobDescription && jobDescription.trim().length > 0;
  };

  const handleAnalyze = async () => {
    if (!canAnalyze()) {
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:4000/api/ai/analyze-bid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          jobDescription,
          jobBudget,
          currentBid,
          deliveryTime,
          milestones: milestonesCount
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze bid');
      }

      setAnalysis(data.data);
      setShowResults(true);
    } catch (err) {
      console.error('Bid Analyzer Error:', err);
      setError(err.message || 'Failed to connect to AI service');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCompetitivenessColor = (competitiveness) => {
    if (competitiveness === 'Competitive') return '#10b981';
    if (competitiveness === 'High but Justified') return '#f59e0b';
    if (competitiveness === 'Too Low') return '#ef4444';
    if (competitiveness === 'Too High') return '#ef4444';
    return '#6b7280';
  };

  const getCompetitivenessIcon = (competitiveness) => {
    if (competitiveness === 'Competitive') return '✓';
    if (competitiveness === 'High but Justified') return '⚠️';
    if (competitiveness === 'Too Low') return '⬇️';
    if (competitiveness === 'Too High') return '⬆️';
    return '•';
  };

  return (
    <div className="bid-analyzer">
      <div className="analyzer-header">
        <h4>💰 AI Bid Analysis</h4>
        {isAnalyzing && <span className="analyzing-badge">Analyzing...</span>}
      </div>

      {error && (
        <div className="analyzer-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {showResults && analysis && (
        <div className="analysis-card">
          {/* Competitiveness Badge */}
          <div 
            className="competitiveness-badge" 
            style={{ 
              backgroundColor: `${getCompetitivenessColor(analysis.competitiveness)}15`,
              borderColor: getCompetitivenessColor(analysis.competitiveness)
            }}
          >
            <span className="badge-icon">
              {getCompetitivenessIcon(analysis.competitiveness)}
            </span>
            <span 
              className="badge-text"
              style={{ color: getCompetitivenessColor(analysis.competitiveness) }}
            >
              {analysis.competitiveness}
            </span>
          </div>

          {/* Recommended Bid */}
          <div className="recommended-section">
            <div className="recommended-label">Recommended Bid</div>
            <div className="recommended-amount">${analysis.recommendedBid}</div>
            {analysis.bidRange && (
              <div className="recommended-range">
                Range: ${analysis.bidRange.min} - ${analysis.bidRange.max}
              </div>
            )}
          </div>

          {/* Reasoning */}
          {analysis.reasoning && (
            <div className="reasoning-section">
              <strong>Why:</strong> {analysis.reasoning}
            </div>
          )}

          {/* Insights */}
          {analysis.insights && analysis.insights.length > 0 && (
            <div className="insights-section">
              <strong>💡 Insights:</strong>
              <ul>
                {analysis.insights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!showResults && canAnalyze() && !isAnalyzing && (
        <button
          type="button"
          className="analyze-trigger-btn"
          onClick={handleAnalyze}
        >
          💰 Analyze Bid Amount
        </button>
      )}
    </div>
  );
};

export default BidAnalyzer;
