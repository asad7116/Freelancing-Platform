// src/pages/orders_page.jsx
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Orders_dashboard from "../components/orders_dashboard"; // your orders.jsx from yesterday

export default function OrdersPage() {
  return (
    <>
      <Header />
      <Orders_dashboard />
      <Footer />
    </>
  );
}
