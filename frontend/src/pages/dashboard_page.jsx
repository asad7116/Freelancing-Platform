// src/pages/DashboardPage.jsx
import React from "react";

import Footer from "../components/Footer";
import Dashboard from "../components/dashboard"; // your dashboard.jsx component

export default function DashboardPage() {
  return (
    <>
      
      <Dashboard />
      <div className="dz-offset">
         <Footer />
      </div>
    </>
  );
}
