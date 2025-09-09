// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/"); // ok — inside Router
  };

  const token = localStorage.getItem("token");

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">Tixe</Link>
        <div>
          <Link className="nav-link d-inline me-2" to="/">Home</Link>
          {!token && <Link className="nav-link d-inline me-2" to="/login">Login</Link>}
          {!token && <Link className="btn btn-primary btn-sm" to="/register">Signup</Link>}
          {token && <button className="btn btn-outline-danger btn-sm" onClick={logout}>Logout</button>}
        </div>
      </div>
    </nav>
  );
}
