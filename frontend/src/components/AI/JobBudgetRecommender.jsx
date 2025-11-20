import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';
import './JobBudgetRecommender.css';

const JobBudgetRecommender = ({ title, description, category, complexity, duration }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Auto-analyze when there's enough context (debounced)
  useEffect(() => {
    if (!description || description.trim().length < 20) {
      setResult(null);
      setHasAnalyzed(false);
      return;
    }

    const timer = setTimeout(() => {
      if (!hasAnalyzed) {
        handleAnalyze();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [description, title, category, complexity, duration]);

  const handleAnalyze = async () => {
    if (!description || description.trim().length < 20) {
      setError('Please provide a job description (at least 20 characters) to get budget recommendations');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ai/recommend-job-budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, category, complexity, duration })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to recommend budget');
      }

      setResult(data.data);
      setHasAnalyzed(true);
    } catch (err) {
      setError(err.message);
      console.error('Error recommending budget:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReAnalyze = () => {
    setHasAnalyzed(false);
    handleAnalyze();
  };

  if (loading) {
    return (
      <div className="job-budget-recommender loading">
        <div className="budget-loading">
          <DollarSign className="spinner" size={24} />
          <p>Analyzing project scope and recommending budget...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-budget-recommender error">
        <div className="budget-error">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="job-budget-recommender">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!description || description.trim().length < 20}
          className="analyze-budget-btn"
        >
          <DollarSign size={18} />
          Get AI Budget Recommendation
        </button>
      </div>
    );
  }

  return (
    <div className="job-budget-recommender active">
      <div className="budget-recommendation-card">
        <div className="budget-header">
          <div className="budget-icon">
            <DollarSign size={24} />
          </div>
          <div className="budget-title">
            <h4>AI Budget Recommendation</h4>
            <p>Based on project scope and market rates</p>
          </div>
        </div>

        <div className="budget-amounts">
          <div className="budget-range">
            <span className="range-label">Recommended Range</span>
            <div className="range-values">
              <span className="min-value">${result.recommendedMin}</span>
              <span className="separator">-</span>
              <span className="max-value">${result.recommendedMax}</span>
            </div>
          </div>

          <div className="suggested-budget">
            <span className="suggested-label">Suggested Budget</span>
            <span className="suggested-value">${result.suggested}</span>
          </div>
        </div>

        <div className="budget-reasoning">
          <h5><TrendingUp size={16} /> Reasoning</h5>
          <p>{result.reasoning}</p>
        </div>

        {result.marketRate && (
          <div className="market-context">
            <h5>📊 Market Context</h5>
            <p>{result.marketRate}</p>
          </div>
        )}

        {result.insights && result.insights.length > 0 && (
          <div className="budget-insights">
            <h5><Lightbulb size={16} /> Key Insights</h5>
            <ul>
              {result.insights.map((insight, index) => (
                <li key={index}>{insight}</li>
              ))}
            </ul>
          </div>
        )}

        <button onClick={handleReAnalyze} className="reanalyze-btn">
          Re-analyze Budget
        </button>
      </div>
    </div>
  );
};

export default JobBudgetRecommender;
