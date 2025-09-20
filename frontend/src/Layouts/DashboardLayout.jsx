import { Outlet } from "react-router-dom";
import DashboardSidebar from "../components/Dashboard_sidebar";
import DashboardTopbar from "../components/DashboardTopbar"; // <— new
import "../styles/DashboardIndex.css"; // your consolidated dashboard css

export default function DashboardLayout() {
  return (
    <div className="dash-shell dashboard">
      <aside className="dash-aside">
        <DashboardSidebar />
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
