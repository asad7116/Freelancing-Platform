import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageHeader from "../components/PageHeader";
import "../styles/SellerDetails.css";

export default function SellerDetails() {
  
  return (
    <>
      <Header />
      <PageHeader title="Seller Details" />
      <div className="seller-details-sidebar">

      </div>
      <div className="seller-details-main">

      </div>
      <Footer />
    </>
  );
}