// src/components/Profile_dashboard.jsx
import React, { useState } from "react";
import DashboardSidebar from "./Dashboard_sidebar";
import "../styles/profile_dashboard.css";

export default function ProfileDashboard() {
  const [form, setForm] = useState({
    firstName: "Matthew",
    lastName: "Anderson",
    email: "matthew.anderson@example.com",
    phone: "",
    country: "Egypt",
    city: "",
    postcode: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Profile saved ✅");
  };

  return (
    <div className="dz-with-shell">
      <DashboardSidebar />

      <main className="dz-main dz-shell-main-padding">
        <section className="profile-card">
          <div className="profile-avatar">
            <img src="/assets/avatar.png" alt="User Avatar" />
            <button className="edit-btn">✎</button>
          </div>

          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="row">
              <label>
                First Name*
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Last Name*
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <div className="row">
              <label>
                Email*
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Phone
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className="row">
              <label>
                Country*
                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                >
                  <option value="Egypt">Egypt</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Germany">Germany</option>
                </select>
              </label>
            </div>

            <div className="row">
              <label>
                Town/City*
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                />
              </label>
              <label>
                Postcode*
                <input
                  type="text"
                  name="postcode"
                  value={form.postcode}
                  onChange={handleChange}
                />
              </label>
            </div>

            <button type="submit" className="save-btn">Save Changes</button>
          </form>
        </section>
      </main>
    </div>
  );
}
