import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageHeader from "../components/PageHeader";
import Pricing from "../components/pricing"; // your pricing.jsx from earlier

export default function PricingPage() {
  return (
    <>
      <Header />
      <PageHeader title="Pricing" />
      <Pricing />
      <Footer />
    </>
  );
}
