// src/pages/orders_page.jsx
import React from "react";

import Footer from "../components/Footer";
import MyJobs from "../components/my_jobs_dashboard";

export default function OrdersPage() {
  return (
    <>
      <MyJobs />
      <div className="dz-offset">
          <Footer />
      </div>

      
    </>
  );
}
