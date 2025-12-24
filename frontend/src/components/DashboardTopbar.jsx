// src/components/DashboardTopbar.jsx
import { useNavigate } from "react-router-dom";
import { Heart, Mail, Bell, LogOut, Menu } from "lucide-react";
import { api } from "../lib/api";
import "../styles/DashboardTopbar.css";

export default function DashboardTopbar({ onMenuClick }) {
  const navigate = useNavigate();

  async function handleSignOut() {
    try {
      await api.post("/api/auth/signout", {});
    } catch (_) {
      // ignore errors; we'll still redirect
    }
    localStorage.removeItem("role");
    navigate("/signin", { replace: true });
  }

  return (
    <div className="dash-topbar">
      {/* Mobile menu button */}
      <button
        className="dash-iconbtn mobile-menu-btn"
        onClick={onMenuClick}
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      <div className="dash-topbar-actions">
        <button className="dash-iconbtn" aria-label="Wishlist">
          <Heart size={18} />
        </button>
        <button className="dash-iconbtn has-badge" aria-label="Messages">
          <Mail size={18} />
          <span className="dash-badge">8</span>
        </button>
        <button className="dash-iconbtn has-badge" aria-label="Notifications">
          <Bell size={18} />
          <span className="dash-badge">2</span>
        </button>

        {/* Sign out */}
        <button className="dash-iconbtn" onClick={handleSignOut} title="Sign out">
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}
