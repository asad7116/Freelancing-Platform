// frontend/src/pages/Login.jsx
import React, { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <main className="container py-5" style={{maxWidth:480}}>
      <h2>Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={submit} className="vstack gap-3">
        <input className="form-control" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="form-control" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="btn btn-primary">Login</button>
      </form>
      <p className="mt-3">No account? <Link to="/register">Register</Link></p>
    </main>
  );
}
