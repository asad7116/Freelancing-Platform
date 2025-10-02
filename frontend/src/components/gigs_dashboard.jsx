import React, { useState, useEffect } from "react";
import axios from "axios"; // Import Axios for API calls
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing
import "../styles/gigs_dashboard.css";

export default function GigsDashboard() {
  const [gigs, setGigs] = useState([]); // State to store fetched gigs
  const navigate = useNavigate(); // Initialize the navigate function

  // Fetch gigs from the backend when the component mounts
  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/gigs'); // Full API URL to fetch gigs
        setGigs(response.data.gigs); // Assuming the response contains a 'gigs' field
      } catch (error) {
        console.error("Error fetching gigs:", error);
      }
    };

    fetchGigs(); // Call the function to fetch gigs
  }, []); // Empty dependency array ensures it runs once on component mount

  // Navigate to the CreateGig page
  const createGigHandler = () => {
    navigate('/freelancer/CreateGig'); // Use navigate to redirect to the CreateGig page
  };

  return (
    <div className="dz-with-shell">
      {/* Shared Sidebar + Topbar */}
      {/* <DashboardSidebar user={{ name: "Alex", avatar: "/assets/avatar.png" }} /> */}

      {/* Main */}
      <main className="dz-main dz-shell-main-padding">
        {/* Title band */}
        <div className="dz-headerband">
          <h1>Manage Gig</h1>
          <p className="dz-breadcrumb">Dashboard &gt; Manage Gig</p>
          <button
            className="gd-new-gig"
            onClick={createGigHandler} // Navigate to the CreateGig page
          >
            Create a new Gig
          </button>
        </div>

        {/* Gig cards */}
        <section className="gd-cards">
          {gigs.length === 0 ? (
            <p>No gigs found.</p> // Display message when no gigs are available
          ) : (
            gigs.map((gig) => (
              <article className="gd-card" key={gig.id}>
                {/* Ensure the correct image path */}
                <img
                  src={`http://localhost:4000/uploads/${gig.thumbnailImage}`}
                  alt={gig.gigTitle} // Use gigTitle as alt text
                  className="gd-card-img"
                />
                <div className="gd-card-body">
                  <div className="gd-price">${gig.price.toLocaleString()}</div>

                  {/* Render rating if available */}
                  <div className="gd-rating">
                    ⭐ {gig.rating ? gig.rating.toFixed(1) : "0"} ({gig.reviews || 0})
                  </div>

                  {/* Correctly referencing gigTitle */}
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
                    <button className="gd-edit">Edit Gig</button>
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
