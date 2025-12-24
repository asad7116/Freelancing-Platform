import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Star, Eye } from "lucide-react";
import "../styles/gigs_dashboard.css";

export default function GigsDashboard() {
  const [gigs, setGigs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/gigs');
        setGigs(response.data.gigs);
      } catch (error) {
        console.error("Error fetching gigs:", error);
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
                <img
                  src={`http://localhost:4000/uploads/${gig.thumbnailImage}`}
                  alt={gig.gigTitle}
                  className="gd-card-img"
                />
                <div className="gd-card-body">
                  <div className="gd-price">${gig.price.toLocaleString()}</div>

                  <div className="gd-rating">
                    <Star size={14} fill="currentColor" />
                    {gig.rating ? gig.rating.toFixed(1) : "0"} ({gig.reviews || 0})
                  </div>

                  <h3 className="gd-title">{gig.gigTitle}</h3>

                  <div className="gd-seller">
                    <img
                      src="/assets/avatar.png"
                      alt={gig.seller || "Unknown Seller"}
                      className="gd-avatar"
                    />
                    <span>{gig.seller || "Unknown Seller"}</span>
                  </div>

                  <div className="gd-actions">
                    <label className="gd-status">
                      Status:
                      <input type="checkbox" checked={gig.active} readOnly />
                    </label>
                    <button
                      className="gd-edit"
                      onClick={(e) => handleEditGig(e, gig.id)}
                    >
                      <Edit size={16} />
                      Edit Gig
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
