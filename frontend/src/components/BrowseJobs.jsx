import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, DollarSign, MapPin, Send } from "lucide-react";
import "../styles/browse.css";

export default function BrowseJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedJobType, setSelectedJobType] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchCategories();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/job-posts/browse', {
        credentials: 'include'
      });
      
      const data = await response.json();
      console.log('Jobs response:', data);
      console.log('Response status:', response.status);
      
      if (response.ok && data.success) {
        setJobs(data.data || []);
      } else {
        setError(data.message || `Failed to fetch jobs (Status: ${response.status})`);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Error fetching jobs');
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

  const filterAndSortJobs = useCallback(() => {
    let filtered = [...jobs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills_required?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(job => job.categoryId === parseInt(selectedCategory));
    }

    // Job type filter
    if (selectedJobType !== "all") {
      filtered = filtered.filter(job => job.job_type === selectedJobType);
    }

    // Experience level filter
    if (selectedExperience !== "all") {
      filtered = filtered.filter(job => job.experience_level === selectedExperience);
    }

    // Price range filter
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);
      filtered = filtered.filter(job => {
        const price = parseFloat(job.regular_price || job.fixed_price || 0);
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
        filtered.sort((a, b) => {
          const priceA = parseFloat(a.regular_price || a.fixed_price || 0);
          const priceB = parseFloat(b.regular_price || b.fixed_price || 0);
          return priceA - priceB;
        });
        break;
      case "price-high":
        filtered.sort((a, b) => {
          const priceA = parseFloat(a.regular_price || a.fixed_price || 0);
          const priceB = parseFloat(b.regular_price || b.fixed_price || 0);
          return priceB - priceA;
        });
        break;
      case "applications":
        filtered.sort((a, b) => (a._count?.applications || 0) - (b._count?.applications || 0));
        break;
      case "latest":
      default:
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, selectedCategory, selectedJobType, selectedExperience, priceRange, sortBy]);

  useEffect(() => {
    filterAndSortJobs();
  }, [filterAndSortJobs]);

  const handleJobClick = (jobId) => {
    // Navigate to job details page (freelancer job detail route)
    navigate(`/freelancer/job/${jobId}`);
  };

  const handleApplyClick = (e, jobId) => {
    e.stopPropagation();
    // Navigate to application page or open modal
    navigate(`/freelancer/apply/${jobId}`);
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
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="browse-container">
        <div className="browse-error">
          <p>Error: {error}</p>
          <button onClick={fetchJobs} className="retry-btn">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="browse-container">
      {/* Header Section */}
      <div className="browse-header">
        <div className="browse-title">
          <h1>Browse Jobs</h1>
          <p>Find your next project and grow your freelance career</p>
        </div>
        
        <div className="browse-stats">
          <span>{filteredJobs.length} jobs available</span>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="browse-controls">
        <div className="search-section">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search jobs, skills, or keywords..."
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
              <label>Job Type</label>
              <select 
                value={selectedJobType} 
                onChange={(e) => setSelectedJobType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly</option>
                <option value="milestone">Milestone</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Experience Level</label>
              <select 
                value={selectedExperience} 
                onChange={(e) => setSelectedExperience(e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="entry">Entry Level</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Budget Range</label>
              <select 
                value={priceRange} 
                onChange={(e) => setPriceRange(e.target.value)}
              >
                <option value="all">All Budgets</option>
                <option value="0-100">$0 - $100</option>
                <option value="101-500">$101 - $500</option>
                <option value="501-1000">$501 - $1,000</option>
                <option value="1001-5000">$1,001 - $5,000</option>
                <option value="5001">$5,000+</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="latest">Latest</option>
                <option value="price-low">Budget: Low to High</option>
                <option value="price-high">Budget: High to Low</option>
                <option value="applications">Fewest Applications</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Jobs Grid */}
      <div className="browse-content">
        {filteredJobs.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">💼</div>
            <h3>No jobs found</h3>
            <p>Try adjusting your search criteria or filters</p>
            <button 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedJobType("all");
                setSelectedExperience("all");
                setPriceRange("all");
                setSortBy("latest");
              }}
              className="clear-filters-btn"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="jobs-grid">
            {filteredJobs.map((job) => (
              <div key={job.id} className="job-card" onClick={() => handleJobClick(job.id)}>
                <div className="job-card-inner">
                  <div className="job-card-glass"></div>
                  
                  <div className="job-badge">
                    <span className="job-circle job-circle1"></span>
                    <span className="job-circle job-circle2"></span>
                    <span className="job-circle job-circle3"></span>
                    <span className="job-circle job-circle4"></span>
                    <span className="job-circle job-circle5">
                      <DollarSign size={18} fill="white" />
                    </span>
                  </div>

                  <div className="job-card-body">
                    <div className="job-price">
                      ${parseFloat(job.regular_price || job.fixed_price || 0).toLocaleString()}
                    </div>

                    <div className="job-category-tag">
                      {categories.find(c => c.id === job.categoryId)?.name || 'General'}
                    </div>

                    <h3 className="job-title">{job.title}</h3>

                    <div className="job-description">
                      {job.description && job.description.length > 100 
                        ? `${job.description.substring(0, 100)}...` 
                        : job.description || 'No description available'
                      }
                    </div>
                  </div>

                  <div className="job-footer">
                    <div className="job-date">
                      {formatDate(job.created_at)}
                    </div>
                    <div className="job-actions">
                      <button 
                        className="action-btn"
                        onClick={(e) => handleApplyClick(e, job.id)}
                        title="Apply Now"
                      >
                        <Send size={16} />
                      </button>
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
