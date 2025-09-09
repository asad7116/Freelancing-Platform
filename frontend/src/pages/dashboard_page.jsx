// src/pages/DashboardPage.jsx
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Dashboard from "../components/dashboard"; // your dashboard.jsx component

export default function DashboardPage() {
  return (
    <>
      <Header />
      <Dashboard />
      <Footer />
    </>
  );
}
