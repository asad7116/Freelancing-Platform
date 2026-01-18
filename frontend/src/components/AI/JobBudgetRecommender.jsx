import React, { useState } from 'react';
import './PriceRecommendation.css';

/**
 * JobBudgetRecommender Component
 * Provides AI-powered budget recommendations for job posts
 * Uses the same backend endpoint and styling as gig PriceRecommendation
 * 
 * @param {Object} props
 * @param {string} props.title - Job title
 * @param {string} props.description - Job description
 * @param {string} props.category - Job category
 * @param {string} props.complexity - Job complexity (job_size)
 * @param {string} props.duration - Project duration
 * @param {Function} props.onApplyBudget - Callback when user applies budget (optional)
 */
const JobBudgetRecommender = ({ title, description, category, complexity, duration, onApplyBudget }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState(null);
  const [showRecommendation, setShowRecommendation] = useState(false);

  const canRecommend = () => {
    return (title && title.trim().length > 0) || 
           (description && description.trim().length > 0);
  };

  const handleGetRecommendation = async () => {
    if (!canRecommend()) {
      setError('Please fill in title or description first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      // Map duration to delivery time number
      const deliveryTimeMap = {
        '1-3-months': 60,
        '3-6-months': 120,
        '6-months-plus': 180,
        '': 30
      };

      const response = await fetch('http://localhost:4000/api/ai/recommend-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          gigTitle: title || '',
          shortDescription: description || '',
          category: category || 'General',
          deliveryTime: deliveryTimeMap[duration] || 30
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get budget recommendation');
      }

      // Backend returns: { recommendedPrice, priceRange: { min, max }, reasoning, marketInsights }
      setRecommendation(data.data);
      setShowRecommendation(true);
    } catch (err) {
      console.error('Budget Recommendation Error:', err);
      setError(err.message || 'Failed to connect to AI service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPrice = (price) => {
    if (onApplyBudget) {
      onApplyBudget(price);
    }
    setShowRecommendation(false);
  };

  return (
    <div className="price-recommendation">
      <button
        type="button"
        className="recommend-price-btn"
        onClick={handleGetRecommendation}
        disabled={isLoading || !canRecommend()}
        title="Get AI budget recommendation"
      >
        {isLoading ? (
          <>
            <span className="spinner"></span> Analyzing Market...
          </>
        ) : (
          <>
            💰 Get AI Budget Recommendation
          </>
        )}
      </button>

      {error && (
        <div className="price-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button className="close-btn" onClick={() => setError(null)}>×</button>
        </div>
      )}

      {showRecommendation && recommendation && (
        <div className="price-recommendation-modal">
          <div className="price-overlay" onClick={() => setShowRecommendation(false)}></div>
          <div className="price-content">
            <div className="price-header">
              <h3>💰 AI Budget Recommendation</h3>
              <button className="close-btn" onClick={() => setShowRecommendation(false)}>×</button>
            </div>

            <div className="price-body">
              <div className="recommended-price-section">
                <div className="price-label">Recommended Budget</div>
                <div className="price-value">${recommendation.recommendedPrice}</div>
                <div className="price-range">
                  Competitive Range: ${recommendation.priceRange?.min || recommendation.recommendedPrice * 0.8} - ${recommendation.priceRange?.max || recommendation.recommendedPrice * 1.2}
                </div>
                {onApplyBudget && (
                  <button 
                    className="apply-price-btn"
                    onClick={() => handleApplyPrice(recommendation.recommendedPrice)}
                  >
                    Use This Budget
                  </button>
                )}
              </div>

              {recommendation.reasoning && (
                <div className="reasoning-section">
                  <h4>📊 Why This Budget?</h4>
                  <p>{recommendation.reasoning}</p>
                </div>
              )}

              {recommendation.marketInsights && recommendation.marketInsights.length > 0 && (
                <div className="insights-section">
                  <h4>💡 Market Insights</h4>
                  <ul>
                    {recommendation.marketInsights.map((insight, index) => (
                      <li key={index}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}

              {onApplyBudget && recommendation.priceRange && (
                <div className="price-options">
                  <button 
                    className="apply-btn min-price"
                    onClick={() => handleApplyPrice(recommendation.priceRange.min)}
                  >
                    Use Min: ${recommendation.priceRange.min}
                  </button>
                  <button 
                    className="apply-btn max-price"
                    onClick={() => handleApplyPrice(recommendation.priceRange.max)}
                  >
                    Use Max: ${recommendation.priceRange.max}
                  </button>
                </div>
              )}
            </div>

            <div className="price-footer">
              <button 
                className="regenerate-btn"
                onClick={handleGetRecommendation}
              >
                🔄 Regenerate
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setShowRecommendation(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobBudgetRecommender;
