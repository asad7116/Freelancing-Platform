import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "../components/Dashboard_sidebar";
import "../styles/orders_dashboard.css"; // table styles only

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

  if (loading) {
    return (
      <div className="dz-with-shell">
        <main className="dz-main dz-shell-main-padding">
          <div className="dz-headerband">
            <h1>My Job Posts</h1>
            <p className="dz-breadcrumb">Dashboard &gt; My Job Posts</p>
          </div>
          <div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>
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
          <div style={{padding: '2rem', textAlign: 'center', color: 'red'}}>
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
            Post a Job
          </button>
        </div>

        <section className="orders-container">
          {jobPosts.length === 0 ? (
            <div style={{padding: '2rem', textAlign: 'center'}}>
              <p>No job posts found. <a href="/client/PostJob">Post your first job</a></p>
            </div>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Job Title</th>
                  <th>Category</th>
                  <th>City</th>
                  <th>Posted Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Applications</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {jobPosts.map((job) => (
                  <tr key={job.id}>
                    <td>#{job.id}</td>
                    <td className="product-cell">
                      {job.thumb_image && (
                        <img 
                          src={`/uploads/job-thumbnails/${job.thumb_image}`} 
                          alt={job.title}
                          style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px'}}
                        />
                      )}
                      <span className="product-name">{job.title}</span>
                    </td>
                    <td>{job.category?.name || 'N/A'}</td>
                    <td>{job.city?.name || 'N/A'}</td>
                    <td>{formatDate(job.created_at)}</td>
                    <td>${job.regular_price}</td>
                    <td>
                      <span className={`status ${getStatusClass(job.approved_by_admin)}`}>
                        {getStatusDisplay(job.approved_by_admin)}
                      </span>
                    </td>
                    <td>
                      <span className="applications-count">
                        {job._count?.applications || 0}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button className="view-btn" title="View Details">👁</button>
                      <button className="edit-btn" title="Edit Job">✏️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
