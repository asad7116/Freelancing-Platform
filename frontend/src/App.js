// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./Layouts/DashboardLayout";

//Public pages
import HomePage from "./pages/HomePage";
import SignIn from "./pages/Signin";
import SignUp from "./pages/signUp";
import Contact from "./pages/contact";
import About from "./pages/About_Page";
import ServicesPage from "./pages/services";  
import JobsPage from "./pages/Jobs_page";
import PricingPage from "./pages/Pricing_page";
import Freelancer from "./pages/Freelancer";
import SellerDetails from "./pages/SellerDetails";

// Dashboard children
import Overview from "./pages/Dashboard/Overview";
import Orders from "./pages/Dashboard/Orders";
import MyOrders from "./pages/Dashboard/MyOrders";
import Gigs from "./pages/Dashboard/Gigs";
import MyJobs from "./pages/Dashboard/MyJobs";
import MyProposals from "./pages/Dashboard/MyProposals";
import Subscription from "./pages/Dashboard/Subscription";
import Messages from "./pages/Dashboard/Messages";
import Portfolio from "./pages/Dashboard/Portfolio";
import Wishlist from "./pages/Dashboard/Wishlist";
import Payouts from "./pages/Dashboard/Payouts";
import Profile from "./pages/Dashboard/Profile";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/freelancers" element={<Freelancer />} />
        <Route path="/seller/:username" element={<SellerDetails />} />

        {/* dashboard parent + nested children */}
        <Route path="/Dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="orders" element={<Orders />} />
          <Route path="my-orders" element={<MyOrders />} />
          <Route path="gigs" element={<Gigs />} />
          <Route path="my-jobs" element={<MyJobs />} />
          <Route path="my-proposals" element={<MyProposals />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="messages" element={<Messages />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="payouts" element={<Payouts />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<div>Dashboard page not found</div>} />
        </Route>

        {/* global catch-all */}
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}