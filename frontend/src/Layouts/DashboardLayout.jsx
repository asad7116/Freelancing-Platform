// src/layouts/DashboardLayout.jsx
import { Outlet } from "react-router-dom";
import DashboardSidebar from "../components/Dashboard_sidebar";
import DashboardTopbar from "../components/DashboardTopbar";
import "../styles/DashboardIndex.css";

export default function DashboardLayout({ role }) {
  // DEBUG: remove later — lets us confirm the role is reaching the layout
  console.log("DashboardLayout role =", role);

  return (
    <div className="dash-shell dashboard">
      <aside className="dash-aside">
        {/* pass role down to the sidebar */}
        <DashboardSidebar role={role} />
      </aside>
      <main className="dash-main">
        <DashboardTopbar />
        <div className="dash-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
