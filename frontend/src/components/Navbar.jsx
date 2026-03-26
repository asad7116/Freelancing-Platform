// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/"); // ok — inside Router
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">Tixe</Link>
        <div>
          <Link className="nav-link d-inline me-2" to="/">Home</Link>
          {!isAuthenticated && <Link className="nav-link d-inline me-2" to="/login">Login</Link>}
          {!isAuthenticated && <Link className="btn btn-primary btn-sm" to="/register">Signup</Link>}
          {isAuthenticated && <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Logout</button>}
        </div>
      </div>
    </nav>
  );
}
