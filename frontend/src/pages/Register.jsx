// frontend/src/pages/Register.jsx
import React, { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register(){
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <main className="container py-5" style={{maxWidth:480}}>
      <h2>Create account</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={submit} className="vstack gap-3">
        <input className="form-control" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} required />
        <input className="form-control" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="form-control" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} />
        <button className="btn btn-primary">Register</button>
      </form>
      <p className="mt-3">Already have an account? <Link to="/login">Login</Link></p>
    </main>
  );
}
