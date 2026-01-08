import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, ClipboardList } from "lucide-react";
import "../styles/my_jobs_dashboard.css";
import "../styles/job_cards.css";

export default function MyJobs() {
  const navigate = useNavigate();
  const [jobPosts, setJobPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handlePostJob = () => {
    navigate('/client/PostJob');
  };

  const handleEditJob = (jobId) => {
    navigate(`/client/PostJob/edit/${jobId}`);
  };

  const handleViewJob = (jobId) => {
    navigate(`/client/job/${jobId}`);
  }; useEffect(() => {
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
        console.error('Failed to fetch job posts:', data.message);
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

  const getStatusClass = (approved) => {
    if (approved === 'pending' || approved === null) return 'pending';
    if (approved === 'approved' || approved === true) return 'completed';
    return 'revision';
  };

  const getStatusDisplay = (approved) => {
    if (approved === 'pending' || approved === null) return 'Pending';
    if (approved === 'approved' || approved === true) return 'Approved';
    return 'Rejected';
  };

  if (loading) {
    return (
      <div className="dz-with-shell">
        <main className="dz-main dz-shell-main-padding">
          <div className="dz-headerband">
            <div>
              <h1>My jobs</h1>
              <p className="dz-breadcrumb">Dashboard &gt; My jobs</p>
            </div>
            <button className="mj-post-btn" onClick={handlePostJob}>
              <Plus size={18} />
              Post a Job
            </button>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your job posts...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dz-with-shell">
        <main className="dz-main dz-shell-main-padding">
          <div className="dz-headerband">
            <div>
              <h1>My jobs</h1>
              <p className="dz-breadcrumb">Dashboard &gt; My jobs</p>
            </div>
            <button className="mj-post-btn" onClick={handlePostJob}>Post a Job</button>
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
      {/* shared sidebar + topbar (logo, icons, avatar) */}
      {/* <DashboardSidebar user={{ name: "Alex", avatar: "/assets/avatar.png" }} /> */}

      {/* main */}
      <main className="dz-main dz-shell-main-padding">
        <div className="dz-headerband">
          <div>
            <h1>My jobs</h1>
            <p className="dz-breadcrumb">Dashboard &gt; My jobs</p>
          </div>
          <button className="mj-post-btn" onClick={handlePostJob}>Post a Job</button>
        </div>

        <section className="jobs-container">
          {jobPosts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <ClipboardList size={48} />
              </div>
              <h3>No job posts yet</h3>
              <p>Start by posting your first job to find the perfect freelancer</p>
              <button className="mj-post-btn" onClick={handlePostJob}>
                Post Your First Job
              </button>
            </div>
          ) : (
            <div className="jobs-grid">
              {jobPosts.map((job) => (
                <div key={job.id} className="job-card" onClick={() => handleViewJob(job.id)}>
                  <div className="job-card-inner">
                    <div className="job-card-glass"></div>
                    
                    {/* Badge System */}
                    <div className="job-badge">
                      <span className="job-circle job-circle1"></span>
                      <span className="job-circle job-circle2"></span>
                      <span className="job-circle job-circle3"></span>
                      <span className="job-circle job-circle4"></span>
                      <span className="job-circle job-circle5">
                        <ClipboardList size={18} />
                      </span>
                    </div>

                    {/* Job Info Section */}
                    <div className="job-info">
                      <div className="job-price">
                        ${parseFloat(job.regular_price || job.fixed_price || 0).toFixed(2)}
                      </div>
                      <h3 className="job-title">{job.title}</h3>
                      <div className="job-meta">
                        <span className="job-category">{job.category?.name || 'General'}</span>
                        <span className="applications-count">
                          {job._count?.applications || 0} applications
                        </span>
                      </div>
                      <div className={`job-status-badge status-${getStatusClass(job.approved_by_admin)}`}>
                        {getStatusDisplay(job.approved_by_admin)}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="job-footer">
                      <div className="job-date">
                        {formatDate(job.created_at)}
                      </div>
                      <div className="job-actions">
                        <button
                          className="action-btn"
                          title="Edit Job"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditJob(job.id);
                          }}
                        >
                          <Edit size={16} />
                        </button>
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
