// src/pages/orders_page.jsx
import React from "react";

import Footer from "../components/Footer";
import MessagesDashboard from "../components/messages_dashbaord";

export default function MessagesDashboardPage() {
  return (
    <>
      <MessagesDashboard />
      <div className="dz-offset">
        <Footer />
      </div>

   
    </>
  );
}
