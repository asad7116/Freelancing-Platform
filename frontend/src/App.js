// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ---------- Public pages (keep your existing ones) ----------
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/services";
import JobsPage from "./pages/Jobs_page";
import PricingPage from "./pages/Pricing_page";
import SignIn from "./pages/Signin";
import SignUp from "./pages/signUp";
import Contact from "./pages/contact";
import About from "./pages/About_Page";
import Freelancer from "./pages/Freelancer";
import SellerDetails from "./pages/SellerDetails";

// ---------- Shared dashboard layout & guards ----------
import DashboardLayout from "./Layouts/DashboardLayout";
import RequireRole from "./components/RequireRole"; // created in step 2.1
import MyJobs from "./pages/Dashboard/MyJobs";
import Messages from "./pages/Dashboard/Messages"
import PostJob from "./pages/Dashboard/PostJob";
import JobDetail from "./components/JobDetail";
// ---------- New role-specific overview pages (created in step 1) ----------
import ClientOverview from "./pages/Client/Overview";
import FreelancerOverview from "./pages/Freelancer/Overview";
import Gigs from "./pages/Dashboard/Gigs";
import Payouts from "./pages/Dashboard/Payouts";
import Orders from "./pages/Dashboard/Orders";
import MyProposals from "./pages/Dashboard/MyProposals";
import Subscription from "./pages/Dashboard/Subscription";
import BrowseGigs from "./components/BrowseGigs";
import BrowseJobs from "./components/BrowseJobs";
import Wishlist from "./pages/Dashboard/Wishlist";
import Profile from "./pages/Dashboard/Profile";
import CreateGig from "./pages/Dashboard/CreateGig";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===== Public routes ===== */}
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

        {/* ===== Client dashboard ===== */}
        <Route
          path="/client"
          element={
            <RequireRole role="client">
              <DashboardLayout role="client" />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<ClientOverview />} />{" "}
          {/* <-- this one */}
          <Route path="browse-gigs" element={<BrowseGigs />} />
          <Route path="PostJob" element={<PostJob/>} />
          <Route path="PostJob/edit/:jobId" element={<PostJob/>} />
          <Route path="job/:jobId" element={<JobDetail/>} />
          <Route path="MyProposals" element={<MyProposals/>} />
          <Route path="Orders" element={<MyJobs />} />
          <Route path="Messages" element={<Messages/>}/>

          <Route path="*" element={<div>Client page not found</div>} />
        </Route>

        {/* ===== Freelancer dashboard ===== */}
        {/* FREELANCER DASHBOARD */}
        <Route
          path="/freelancer"
          element={
            <RequireRole role="freelancer">
              <DashboardLayout role="freelancer" />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<FreelancerOverview />} />{" "}
          {/* <-- this one */}
          <Route path="browse-jobs" element={<BrowseJobs />} />
          <Route path="Gigs" element={<Gigs/>} />
          <Route path="CreateGig" element={<CreateGig/>} />
          <Route path="MyProposals" element={<MyProposals/>} />
          <Route path="Subscription" element={<Subscription/>} />
          <Route path="Wishlist" element={<Wishlist/>} />
          <Route path="Payouts" element={<Payouts/>} />
          <Route path="Orders" element={<Orders/>} />
          <Route path="Messages" element={<Messages/>}/>
          <Route path="Profile" element={<Profile/>} />
          <Route path="*" element={<div>Freelancer page not found</div>} />
        </Route>

        {/* ===== Global catch-all ===== */}
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
