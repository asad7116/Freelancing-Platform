// src/layouts/DashboardLayout.jsx
import { Outlet } from "react-router-dom";
import { useState } from "react";
import DashboardSidebar from "../components/Dashboard_sidebar";
import DashboardTopbar from "../components/DashboardTopbar";
import "../styles/DashboardIndex.css";

export default function DashboardLayout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="dash-shell dashboard">
      {/* Sidebar backdrop for mobile */}
      <div 
        className={`sidebar-backdrop ${sidebarOpen ? 'active' : ''}`}
        onClick={closeSidebar}
      />
      
      <aside className={`dash-aside ${sidebarOpen ? 'mobile-open' : ''}`}>
        <DashboardSidebar role={role} onLinkClick={closeSidebar} />
      </aside>
      
      <main className="dash-main">
        <DashboardTopbar onMenuClick={toggleSidebar} />
        <div className="dash-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
