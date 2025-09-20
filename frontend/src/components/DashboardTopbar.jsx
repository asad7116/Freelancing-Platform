// src/components/DashboardTopbar.jsx
import { useNavigate } from "react-router-dom";
import { Heart, Mail, Bell, LogOut } from "lucide-react";
import { api } from "../lib/api";          // <-- we already created this
import "../styles/DashboardTopbar.css"; // <-- create this file

export default function DashboardTopbar() {
  const navigate = useNavigate();

  async function handleSignOut() {
    try {
      await api.post("/api/auth/signout", {}); // clears httpOnly cookie
    } catch (_) {
      // ignore errors; we’ll still redirect
    }
    localStorage.removeItem("role"); // TEMP: until we switch guards to /me
    navigate("/signin", { replace: true });
  }

  return (
    <div className="dash-topbar">
      <button className="dash-iconbtn" aria-label="Wishlist"><Heart size={18} /></button>
      <button className="dash-iconbtn has-badge" aria-label="Messages">
        <Mail size={18} /><span className="dash-badge">8</span>
      </button>
      <button className="dash-iconbtn has-badge" aria-label="Notifications">
        <Bell size={18} /><span className="dash-badge">2</span>
      </button>

      {/* Sign out */}
      <button className="dash-iconbtn" onClick={handleSignOut} title="Sign out">
        <LogOut size={18} />
      </button>

      {/* avatar block stays as-is in your code, keep if you already had it */}
    </div>
  );
}
