// src/components/DashboardTopbar.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Mail, Bell, LogOut, Menu } from "lucide-react";
import { api } from "../lib/api";
import NotificationDropdown from "./NotificationDropdown";
import "../styles/DashboardTopbar.css";

export default function DashboardTopbar({ onMenuClick, role }) {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await api.get("/api/notifications/unread-count");
      setUnreadCount(data.count || 0);
    } catch {
      // handled globally by api.js (401 → redirect to /auth)
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Re-fetch count when dropdown closes
  const handleNotifClose = useCallback(() => {
    setNotifOpen(false);
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  function handleMessagesClick() {
    const base = role === "freelancer" ? "/freelancer" : "/client";
    navigate(`${base}/Messages`);
  }

  async function handleSignOut() {
    try {
      await api.post("/api/auth/signout", {});
    } catch (_) {
      // ignore errors; we'll still redirect
    }
    localStorage.removeItem("role");
    navigate("/auth", { replace: true });
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

        <button
          className="dash-iconbtn has-badge"
          aria-label="Messages"
          onClick={handleMessagesClick}
        >
          <Mail size={18} />
        </button>

        <div className="notif-wrapper">
          <button
            className={`dash-iconbtn ${unreadCount > 0 ? "has-badge" : ""}`}
            aria-label="Notifications"
            onClick={() => setNotifOpen((prev) => !prev)}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="dash-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
          <NotificationDropdown isOpen={notifOpen} onClose={handleNotifClose} />
        </div>

        {/* Sign out */}
        <button className="dash-iconbtn" onClick={handleSignOut} title="Sign out">
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}
