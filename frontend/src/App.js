import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import DashboardPage from "./pages/dashboard_page";
import OrdersPage from "./pages/orders_dash_page";
import GigsDashboardPage from "./pages/gigs_dashboard_page";
import MyJobs from "./pages/my_jobs_dasboard_page";
import MyProposals from "./pages/my_proposals_dashboard_page";
import MyOrdersDash from "./pages/my_orders_dash";

// ...


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/orders" element={<OrdersPage />} />
        <Route path="/dashboard/my-orders" element={<MyOrdersDash />} />
        <Route path="/dashboard/gigs" element={<GigsDashboardPage />} />
        <Route path="/dashboard/my-jobs" element={<MyJobs />} />
        <Route path="/dashboard/my-proposals" element={<MyProposals />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/Freelancers" element={<Freelancer />}/>
        <Route path="/seller/:username" element={<SellerDetails />} />
      </Routes>
    </Router>
  );
}
