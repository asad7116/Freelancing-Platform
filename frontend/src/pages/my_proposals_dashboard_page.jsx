// src/pages/orders_page.jsx
import React from "react";

import Footer from "../components/Footer";
import MyProposals from "../components/my_proposals_dashboard";

export default function MyProposalsPage() {
  return (
    <>
      <MyProposals />
      <div className="dz-offset">
          <Footer />
      </div>

      
    </>
  );
}
