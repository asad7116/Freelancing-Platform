// src/components/RequireRole.jsx
import { Navigate, useLocation } from "react-router-dom";

/**
 * Minimal role guard.
 * Expects you to store the user role somewhere.
 * For now we read from localStorage just to wire routes:
 *   localStorage.setItem("role", "client" | "freelancer" | "admin")
 */
export default function RequireRole({ role, children }) {
  const location = useLocation();

  // TODO: replace with your real auth/role source (context/store)
  const userRole = localStorage.getItem("role"); // "client" | "freelancer" | "admin"

  if (!userRole) {
    // If not logged in or no role set, send to signin
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  // Allow admin to view both spaces (optional)
  const allowed = userRole === role || userRole === "admin";

  if (!allowed) {
    // Redirect to appropriate dashboard based on user role
    if (userRole === "client") {
      return <Navigate to="/client" replace />;
    } else if (userRole === "freelancer") {
      return <Navigate to="/freelancer" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
