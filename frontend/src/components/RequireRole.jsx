// src/components/RequireRole.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Role guard that verifies user role.
 * Authentication is handled via httpOnly cookies.
 * This component only checks if the user has the correct role for the route.
 */
export default function RequireRole({ role, children }) {
  const location = useLocation();
  const { role: userRole } = useAuth();

  // If no role set, user is not authenticated - redirect to signin
  if (!userRole) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
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
