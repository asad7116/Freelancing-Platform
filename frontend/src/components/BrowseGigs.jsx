import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Star, Heart } from "lucide-react";
import "../styles/browse.css";

export default function BrowseGigs() {
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]);
  const [filteredGigs, setFilteredGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchGigs();
    fetchCategories();
  }, []);

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gigs', {
        credentials: 'include'
      });
      
      const data = await response.json();
      console.log('Gigs response:', data);
      
      if (data.success !== false) {
        // Handle both {success: true, gigs: [...]} and {gigs: [...]} formats
        const gigsArray = data.gigs || data || [];
        setGigs(gigsArray);
      } else {
        setError(data.message || 'Failed to fetch gigs');
      }
    } catch (error) {
      console.error('Error fetching gigs:', error);
      setError('Error fetching gigs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterAndSortGigs = useCallback(() => {
    let filtered = [...gigs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(gig =>
        gig.gigTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gig.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gig.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(gig => gig.categoryId === parseInt(selectedCategory));
    }

    // Price range filter
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);
      filtered = filtered.filter(gig => {
        const price = parseFloat(gig.price || 0);
        if (max) {
          return price >= min && price <= max;
        } else {
          return price >= min;
        }
      });
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0));
        break;
      case "price-high":
        filtered.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "latest":
      default:
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    setFilteredGigs(filtered);
  }, [gigs, searchTerm, selectedCategory, priceRange, sortBy]);

  useEffect(() => {
    filterAndSortGigs();
  }, [filterAndSortGigs]);

  const handleGigClick = (gigId) => {
    // Navigate to gig details page
    navigate(`/gig/${gigId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="browse-container">
        <div className="browse-loading">
          <div className="loading-spinner"></div>
          <p>Loading gigs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="browse-container">
        <div className="browse-error">
          <p>Error: {error}</p>
          <button onClick={fetchGigs} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="browse-container">
      {/* Header Section */}
      <div className="browse-header">
        <div className="browse-title">
          <h1>Browse Gigs</h1>
          <p>Discover talented freelancers and their services</p>
        </div>
        
        <div className="browse-stats">
          <span>{filteredGigs.length} gigs found</span>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="browse-controls">
        <div className="search-section">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search gigs, skills, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <button 
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="filter-panel">
            <div className="filter-group">
              <label>Category</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range</label>
              <select 
                value={priceRange} 
                onChange={(e) => setPriceRange(e.target.value)}
              >
                <option value="all">All Prices</option>
                <option value="0-50">$0 - $50</option>
                <option value="51-100">$51 - $100</option>
                <option value="101-250">$101 - $250</option>
                <option value="251-500">$251 - $500</option>
                <option value="501">$500+</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="latest">Latest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Gigs Grid */}
      <div className="browse-content">
        {filteredGigs.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No gigs found</h3>
            <p>Try adjusting your search criteria or filters</p>
            <button 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setPriceRange("all");
                setSortBy("latest");
              }}
              className="clear-filters-btn"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="gigs-grid">
            {filteredGigs.map((gig) => (
              <div key={gig.id} className="gig-card" onClick={() => handleGigClick(gig.id)}>
                {/* Gig Thumbnail */}
                <div className="gig-thumbnail">
                  {gig.thumbnailImage ? (
                    <img 
                      src={`/uploads/${gig.thumbnailImage}`} 
                      alt={gig.gigTitle}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="placeholder-thumbnail" style={{ display: gig.thumbnailImage ? 'none' : 'flex' }}>
                    <span>🎨</span>
                  </div>
                  
                  <div className="gig-overlay">
                    <button 
                      className="favorite-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to favorites functionality
                      }}
                    >
                      <Heart size={18} />
                    </button>
                  </div>
                </div>

                {/* Gig Info */}
                <div className="gig-info">
                  <div className="gig-header">
                    <h3 className="gig-title">{gig.gigTitle}</h3>
                    <div className="gig-price">${parseFloat(gig.price || 0).toFixed(2)}</div>
                  </div>

                  <div className="gig-meta">
                    <div className="gig-rating">
                      <Star className="star-icon" size={14} />
                      <span>{gig.rating ? gig.rating.toFixed(1) : '0.0'}</span>
                      <span className="reviews-count">({gig.reviews || 0})</span>
                    </div>
                    
                    <div className="gig-category">
                      {categories.find(c => c.id === gig.categoryId)?.name || 'General'}
                    </div>
                  </div>

                  <div className="gig-description">
                    {gig.description && gig.description.length > 100 
                      ? `${gig.description.substring(0, 100)}...` 
                      : gig.description || 'No description available'
                    }
                  </div>

                  <div className="gig-footer">
                    <div className="seller-info">
                      <img 
                        src="/assets/avatar.png" 
                        alt="Seller" 
                        className="seller-avatar"
                      />
                      <span className="seller-name">
                        {gig.seller || gig.user?.name || 'Anonymous'}
                      </span>
                    </div>
                    
                    <div className="gig-date">
                      {formatDate(gig.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}