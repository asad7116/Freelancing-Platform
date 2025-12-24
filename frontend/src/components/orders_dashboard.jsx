import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, ClipboardList, MapPin } from "lucide-react";
import DashboardSidebar from "../components/Dashboard_sidebar";
import "../styles/orders_dashboard.css";
import "../styles/job_cards.css";

export default function Orders() {
  const navigate = useNavigate();
  const [jobPosts, setJobPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobPosts();
  }, []);

  const fetchJobPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/job-posts/my-jobs', {
        credentials: 'include' // Include cookies for authentication
      });

      const data = await response.json();
      console.log('Job posts response:', data);

      if (data.success) {
        setJobPosts(data.data);
      } else {
        setError(data.message || 'Failed to fetch job posts');
      }
    } catch (error) {
      console.error('Error fetching job posts:', error);
      setError('Error fetching job posts');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'pending';
      case 'approved': return 'completed';
      case 'rejected': return 'revision';
      default: return 'pending';
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Pending';
    }
  };

  const handlePostJob = () => {
    navigate('/client/PostJob');
  };

  const handleEditJob = (jobId) => {
    navigate(`/client/PostJob/edit/${jobId}`);
  };

  const handleViewJob = (jobId) => {
    // For now, we can navigate to the edit page or create a separate view page later
    navigate(`/client/PostJob/edit/${jobId}`);
  };

  if (loading) {
    return (
      <div className="dz-with-shell">
        <main className="dz-main dz-shell-main-padding">
          <div className="dz-headerband">
            <h1>My Job Posts</h1>
            <p className="dz-breadcrumb">Dashboard &gt; My Job Posts</p>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dz-with-shell">
        <main className="dz-main dz-shell-main-padding">
          <div className="dz-headerband">
            <h1>My Job Posts</h1>
            <p className="dz-breadcrumb">Dashboard &gt; My Job Posts</p>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
            Error: {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dz-with-shell">
      {/* Fixed sidebar + topbar (shared) */}
      {/* <DashboardSidebar user={{ name: "Alex", avatar: "/assets/avatar.png" }} /> */}

      {/* Main content area shifted by sidebar & topbar */}
      <main className="dz-main dz-shell-main-padding">
        {/* Title band to match your screenshot */}
        <div className="dz-headerband">
          <div>
            <h1>My Job Posts</h1>
            <p className="dz-breadcrumb">Dashboard &gt; My Job Posts</p>
          </div>
          <button className="post-job-btn" onClick={handlePostJob}>
            <Plus size={18} />
            Post a Job
          </button>
        </div>

        <section className="jobs-container">
          {jobPosts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <ClipboardList size={48} />
              </div>
              <h3>No job posts yet</h3>
              <p>Start by posting your first job to find the perfect freelancer</p>
              <button className="post-job-btn" onClick={handlePostJob}>
                Post Your First Job
              </button>
            </div>
          ) : (
            <div className="jobs-grid">
              {jobPosts.map((job) => (
                <div key={job.id} className="job-card">
                  {/* Thumbnail Section */}
                  <div className="job-thumbnail">
                    {job.thumb_image ? (
                      <img
                        src={`/uploads/job-thumbnails/${job.thumb_image}`}
                        alt={job.title}
                      />
                    ) : (
                      <div className="placeholder-thumbnail">
                        <ClipboardList size={32} />
                      </div>
                    )}
                    <div className="job-actions">
                      <button
                        className="action-btn edit-btn"
                        title="Edit Job"
                        onClick={() => handleEditJob(job.id)}
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Job Info Section */}
                  <div className="job-info">
                    <div className="job-header">
                      <h3 className="job-title">{job.title}</h3>
                      <div className="job-meta">
                        <span className="job-category">{job.category?.name || 'General'}</span>
                        {job.city && (
                          <span className="job-location">
                            <MapPin size={14} />
                            {job.city.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="job-stats">
                      <div className="stat-item">
                        <span className="stat-label">Price:</span>
                        <span className="stat-value price">${job.regular_price || job.fixed_price || 'TBD'}</span>
                      </div>

                      <div className="stat-item">
                        <span className="stat-label">Applications:</span>
                        <span className="stat-value applications">
                          {job._count?.applications || 0}
                        </span>
                      </div>
                    </div>

                    <div className="job-footer">
                      <div className="job-date">
                        Posted: {formatDate(job.created_at)}
                      </div>
                      <div className={`job-status status-${getStatusClass(job.approved_by_admin)}`}>
                        {getStatusDisplay(job.approved_by_admin)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
