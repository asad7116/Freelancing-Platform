// src/pages/gigs_dashboard_page.jsx
import React from "react";

import Footer from "../components/Footer";
import GigsDashboard from "../components/gigs_dashboard"; // the component you built

export default function GigsDashboardPage() {
  return (
    <>
      
      <GigsDashboard />
      <div className="dz-offset">
        <Footer />
      </div>

    </>
  );
}
