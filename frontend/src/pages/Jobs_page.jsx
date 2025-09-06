import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Jobs from "../components/Jobs";   
import PageHeader from "../components/PageHeader";            // if Jobs.jsx is in /pages
// import Jobs from "../components/Jobs"; // use this path if you put Jobs.jsx in /components

export default function JobsPage() {
  return (
    <>
      <Header />
      <PageHeader title="Jobs" />
      <Jobs />
      <Footer />
    </>
  );
}
