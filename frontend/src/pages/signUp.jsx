import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageHeader from "../components/PageHeader";
import ToggleButtons from "../components/Login_Toggle"; // import toggle
import "../styles/Signup.css";

export default function SignUp() {
  const [role, setRole] = useState("Buyer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Role:", role, "Name:", name, "Email:", email, "Password:", password);
  };

  return (
    <>
      <Header />
      <PageHeader title="Sign Up" />
      <div className="signup-container">
        <div className="signup-box">
          {/* Left - Form */}
          <div className="signup-form">
            <h2>Sign Up</h2>
            <p className="welcome-text">Welcome to Work Zone</p>

            {/* 🔥 Toggle outside the form */}
            <ToggleButtons onSelect={(role) => setRole(role)} />

            {/* SignUp Form */}
            <form onSubmit={handleSubmit} className="signup-form-inner">
              <label>Name *</label>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <label>Email *</label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <label>Password *</label>
              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <label>Confirm Password *</label>
              <input
                type="password"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <button type="submit" className="signup-btn">
                Sign Up
              </button>
            </form>

            <div className="divider">OR</div>

            <div className="social-login">
              <button className="social-btn">f</button>
              <button className="social-btn">G</button>
            </div>

            <p className="already-account">
              Already have an account? <a href="/signin">Sign In</a>
            </p>
          </div>

          {/* Right - Image */}
          <div className="signup-image">
            <img src="assets/img/Login/1.png" alt="Sign up" />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
