import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

/**
 * AuthContext provides authentication state management that's properly isolated per tab
 * Uses sessionStorage instead of localStorage for role to keep state per tab
 * Also listens for storage changes across tabs to sync state
 */
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [role, setRole] = useState(() => {
    // Initialize from sessionStorage (per-tab) instead of localStorage
    return sessionStorage.getItem("role") || null;
  });

  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const setAuthRole = useCallback((newRole) => {
    if (newRole) {
      sessionStorage.setItem("role", newRole);
    } else {
      sessionStorage.removeItem("role");
    }
    setRole(newRole);
  }, []);

  const setAuthUser = useCallback((newUser) => {
    if (newUser) {
      sessionStorage.setItem("user", JSON.stringify(newUser));
    } else {
      sessionStorage.removeItem("user");
    }
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    setRole(null);
    setUser(null);
  }, []);

  // Listen for storage changes in other tabs (for cross-tab sync if needed)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "role") {
        setRole(e.newValue);
      } else if (e.key === "user") {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const value = {
    role,
    user,
    setRole: setAuthRole,
    setUser: setAuthUser,
    logout,
    isAuthenticated: !!role && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
