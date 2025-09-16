import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

// If you saved it in /pages:
import Services from "../components/services";
// If you saved it in /components instead, use:
// import OurServicesComponent from "../components/our_services_component";

export default function services() {
  return (
    <>
      <Header />
      <Services />
      <Footer />
    </>
  );
}
