// src/pages/gigs_dashboard_page.jsx
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import GigsDashboard from "../components/gigs_dashboard"; // the component you built

export default function GigsDashboardPage() {
  return (
    <>
      <Header />
      <GigsDashboard />
      <Footer />
    </>
  );
}
