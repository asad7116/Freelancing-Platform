import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "./Dashboard_sidebar";
import "../styles/my_jobs_dashboard.css";

export default function MyJobs() {
  const navigate = useNavigate();
  const [jobPosts, setJobPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handlePostJob = () => {
    navigate('/client/PostJob');
  };  useEffect(() => {
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
    if (approved === null) return 'pending';
    if (approved === true) return 'approved';
    return 'rejected';
  };

  const getStatusDisplay = (approved) => {
    if (approved === null) return 'Pending Approval';
    if (approved === true) return 'Approved';
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
            <button className="mj-post-btn" onClick={handlePostJob}>Post a Job</button>
          </div>
          <div style={{padding: '2rem', textAlign: 'center'}}>Loading your job posts...</div>
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
          <div style={{padding: '2rem', textAlign: 'center', color: 'red'}}>
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

        <section className="mj-card">
          {jobPosts.length === 0 ? (
            <div style={{padding: '2rem', textAlign: 'center'}}>
              <p>No job posts found. Click "Post a Job" to create your first job post.</p>
            </div>
          ) : (
            <table className="mj-table">
              <thead>
                <tr>
                  <th className="th-project">Project Name</th>
                  <th className="th-category">Category</th>
                  <th className="th-amount">Amount</th>
                  <th className="th-status">Status</th>
                  <th className="th-prop">Applications</th>
                  <th className="th-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {jobPosts.map((job) => (
                  <tr key={job.id}>
                    <td className="td-project">
                      {job.thumb_image ? (
                        <img 
                          src={`/uploads/job-thumbnails/${job.thumb_image}`} 
                          alt={job.title} 
                          className="mj-logo" 
                        />
                      ) : (
                        <div className="mj-logo mj-logo-placeholder">📄</div>
                      )}
                      <a className="mj-title" href="#!">{job.title}</a>
                    </td>
                    <td className="td-category">{job.category?.name || 'N/A'}</td>
                    <td className="td-amount">${parseFloat(job.regular_price).toFixed(2)}</td>
                    <td className="td-status">
                      <span className={`mj-status ${getStatusClass(job.approved_by_admin)}`}>
                        {getStatusDisplay(job.approved_by_admin)}
                      </span>
                    </td>
                    <td className="td-prop">
                      <span className="mj-pill">{job._count?.applications || 0}</span>
                    </td>
                    <td className="td-action">
                      <button className="mj-icon-btn" title="Edit">🖊️</button>
                      <button className="mj-icon-btn" title="View">👁️</button>
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
