import React, { useState } from 'react';
import './PriceRecommendation.css';

/**
 * PriceRecommendation Component
 * Provides AI-powered price recommendations based on gig details
 * 
 * @param {Object} props
 * @param {Object} props.gigData - Gig data for price analysis
 * @param {Function} props.onApplyPrice - Callback to apply recommended price
 */
const PriceRecommendation = ({ gigData, onApplyPrice }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState(null);
  const [showRecommendation, setShowRecommendation] = useState(false);

  const canRecommend = () => {
    return gigData.gigTitle && gigData.gigTitle.trim().length > 0 &&
           gigData.shortDescription && gigData.shortDescription.trim().length > 0 &&
           gigData.category && gigData.category.trim().length > 0;
  };

  const handleGetRecommendation = async () => {
    if (!canRecommend()) {
      setError('Please fill in title, description, and category first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      const response = await fetch('/api/ai/recommend-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(gigData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get price recommendation');
      }

      setRecommendation(data.data);
      setShowRecommendation(true);
    } catch (err) {
      console.error('Price Recommendation Error:', err);
      setError(err.message || 'Failed to connect to AI service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPrice = (price) => {
    onApplyPrice(price);
    setShowRecommendation(false);
  };

  return (
    <div className="price-recommendation">
      <button
        type="button"
        className="recommend-price-btn"
        onClick={handleGetRecommendation}
        disabled={isLoading || !canRecommend()}
        title="Get AI price recommendation"
      >
        {isLoading ? (
          <>
            <span className="spinner"></span> Analyzing Market...
          </>
        ) : (
          <>
            💰 Get Price Recommendation
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
              <h3>💰 AI Price Recommendation</h3>
              <button className="close-btn" onClick={() => setShowRecommendation(false)}>×</button>
            </div>

            <div className="price-body">
              <div className="recommended-price-section">
                <div className="price-label">Recommended Price</div>
                <div className="price-value">${recommendation.recommendedPrice}</div>
                <div className="price-range">
                  Competitive Range: ${recommendation.priceRange.min} - ${recommendation.priceRange.max}
                </div>
                <button 
                  className="apply-price-btn"
                  onClick={() => handleApplyPrice(recommendation.recommendedPrice)}
                >
                  Use This Price
                </button>
              </div>

              <div className="reasoning-section">
                <h4>📊 Why This Price?</h4>
                <p>{recommendation.reasoning}</p>
              </div>

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
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceRecommendation;
