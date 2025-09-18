// src/pages/orders_page.jsx
import React from "react";

import Footer from "../components/Footer";
import PayoutDashboard from "../components/payout_dashboard";

export default function PayoutDashboardPage() {
  return (
    <>
      <PayoutDashboard />
      <div className="dz-offset">
        <Footer />
      </div>

   
    </>
  );
}
