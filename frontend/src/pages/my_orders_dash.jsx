// src/pages/orders_page.jsx
import React from "react";

import Footer from "../components/Footer";
import MyOrdersDash from "../components/my_orders_dash";

export default function OrdersPage() {
  return (
    <>
      <MyOrdersDash />
      <div className="dz-offset">
        <Footer />
      </div>

   
    </>
  );
}
