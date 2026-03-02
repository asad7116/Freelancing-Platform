import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import {
  FileText,
  CheckCircle,
  XCircle,
  Upload,
  ThumbsUp,
  RotateCcw,
  Bell,
} from "lucide-react";
import "../styles/NotificationDropdown.css";

const ICON_MAP = {
  proposal_received: { icon: FileText, color: "#6c5ce7" },
  proposal_accepted: { icon: CheckCircle, color: "#00b894" },
  proposal_rejected: { icon: XCircle, color: "#d63031" },
  work_submitted: { icon: Upload, color: "#0984e3" },
  work_accepted: { icon: ThumbsUp, color: "#00b894" },
  revision_requested: { icon: RotateCcw, color: "#e17055" },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationDropdown({ isOpen, onClose }) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !e.target.closest('[aria-label="Notifications"]')
      ) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const data = await api.get("/api/notifications?limit=15");
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAllRead() {
    try {
      await api.put("/api/notifications/read-all", {});
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  }

  async function handleClick(notif) {
    // Mark as read
    if (!notif.is_read) {
      try {
        await api.put(`/api/notifications/${notif._id}/read`, {});
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notif._id ? { ...n, is_read: true } : n
          )
        );
      } catch (err) {
        console.error("Failed to mark notification read:", err);
      }
    }

    // Navigate if link exists
    if (notif.link) {
      onClose();
      navigate(notif.link);
    }
  }

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="notif-dropdown" ref={dropdownRef}>
      <div className="notif-dropdown-header">
        <h3>Notifications</h3>
        {unreadCount > 0 && (
          <button className="notif-mark-all" onClick={handleMarkAllRead}>
            Mark all read
          </button>
        )}
      </div>

      <div className="notif-dropdown-body">
        {loading ? (
          <div className="notif-empty">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="notif-empty">
            <Bell size={28} strokeWidth={1.5} />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const { icon: IconComp, color } =
              ICON_MAP[notif.type] || { icon: Bell, color: "#636e72" };

            return (
              <div
                key={notif._id}
                className={`notif-item ${notif.is_read ? "" : "notif-unread"}`}
                onClick={() => handleClick(notif)}
              >
                <div
                  className="notif-icon"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  <IconComp size={16} />
                </div>
                <div className="notif-content">
                  <p className="notif-title">{notif.title}</p>
                  <p className="notif-message">{notif.message}</p>
                  <span className="notif-time">
                    {timeAgo(notif.created_at)}
                  </span>
                </div>
                {!notif.is_read && <span className="notif-dot" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
