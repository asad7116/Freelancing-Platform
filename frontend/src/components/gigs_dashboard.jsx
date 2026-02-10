import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Star, Eye } from "lucide-react";
import { API_BASE_URL } from "../lib/api";
import "../styles/gigs_dashboard.css";

export default function GigsDashboard() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/gigs/my-gigs`, {
          withCredentials: true
        });
        setGigs(response.data.gigs || []);
      } catch (error) {
        console.error("Error fetching gigs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, []);

  const createGigHandler = () => {
    navigate('/freelancer/CreateGig');
  };

  const handleGigClick = (gigId) => {
    navigate(`/freelancer/gig/${gigId}`);
  };

  const handleEditGig = (e, gigId) => {
    e.stopPropagation();
    navigate(`/freelancer/edit-gig/${gigId}`);
  };

  return (
    <div className="dz-with-shell">
      <main className="dz-main dz-shell-main-padding">
        <div className="dz-headerband">
          <h1>Manage Gig</h1>
          <p className="dz-breadcrumb">Dashboard &gt; Manage Gig</p>
          <button
            className="gd-new-gig"
            onClick={createGigHandler}
          >
            <Plus size={18} />
            Create a new Gig
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your gigs...</p>
          </div>
        ) : (
          <section className="gd-cards">
            {gigs.length === 0 ? (
              <p className="gd-empty">No gigs found.</p>
            ) : (
              gigs.map((gig) => (
              <article
                className="gd-card"
                key={gig.id}
                onClick={() => handleGigClick(gig.id)}
              >
                <div className="gd-card-inner">
                  <div className="gd-card-glass"></div>
                  
                  <div className="gd-badge">
                    <span className="gd-circle gd-circle1"></span>
                    <span className="gd-circle gd-circle2"></span>
                    <span className="gd-circle gd-circle3"></span>
                    <span className="gd-circle gd-circle4"></span>
                    <span className="gd-circle gd-circle5">
                      <Star size={18} fill="white" />
                    </span>
                  </div>

                  <div className="gd-card-body">
                    <div className="gd-price">${gig.price.toLocaleString()}</div>

                    <div className="gd-rating">
                      <Star size={14} fill="currentColor" />
                      {gig.rating ? gig.rating.toFixed(1) : "0"} ({gig.reviews || 0})
                    </div>

                    <h3 className="gd-title">{gig.gigTitle}</h3>

                    <div className="gd-seller">
                      <span>{gig.seller || "Unknown Seller"}</span>
                    </div>
                  </div>

                  <div className="gd-footer">
                    <label className="gd-status">
                      <input type="checkbox" checked={gig.active} readOnly />
                      {gig.active ? 'Active' : 'Inactive'}
                    </label>
                    <div className="gd-actions">
                      <button
                        className="gd-action-btn"
                        onClick={(e) => handleEditGig(e, gig.id)}
                        title="Edit Gig"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="gd-action-btn"
                        onClick={(e) => e.stopPropagation()}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
        )}
      </main>
    </div>
  );
}
