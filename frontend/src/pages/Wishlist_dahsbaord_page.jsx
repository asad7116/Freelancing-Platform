// src/pages/orders_page.jsx
import React from "react";

import Footer from "../components/Footer";
import WishlistDashboard from "../components/Wishlist_dashboard";

export default function WishlistDashboardPage() {
  return (
    <>
      <WishlistDashboard />
      <div className="dz-offset">
        <Footer />
      </div>

   
    </>
  );
}
