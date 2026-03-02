import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { CheckCircle, XCircle, Loader, ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import "../styles/VerifyEmail.css";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
  const [status, setStatus] = useState("idle"); // idle | verifying | success | error
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = useRef([]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Start cooldown on mount (user just got their code)
  useEffect(() => {
    setCooldown(RESEND_COOLDOWN);
  }, []);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  const handleChange = useCallback(
    (index, value) => {
      // Only allow digits
      if (value && !/^\d$/.test(value)) return;

      setCode((prev) => {
        const next = [...prev];
        next[index] = value;
        return next;
      });
      setMessage("");
      setStatus("idle");

      // Auto-focus next input
      if (value && index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    []
  );

  const handleKeyDown = useCallback(
    (index, e) => {
      if (e.key === "Backspace" && !code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      if (e.key === "ArrowLeft" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [code]
  );

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    const chars = pasted.split("");
    setCode((prev) => {
      const next = [...prev];
      chars.forEach((ch, i) => {
        next[i] = ch;
      });
      return next;
    });
    // Focus the next empty input or the last one
    const focusIdx = Math.min(chars.length, CODE_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  }, []);

  const handleVerify = async (e) => {
    e?.preventDefault();
    const otp = code.join("");
    if (otp.length !== CODE_LENGTH) {
      setStatus("error");
      setMessage("Please enter the complete 6-digit code.");
      return;
    }

    setStatus("verifying");
    setMessage("");

    try {
      const data = await api.post("/api/auth/verify-email", { email, code: otp });
      setStatus("success");
      setMessage(data.message || "Email verified successfully!");

      // User is now logged in (backend set cookie), redirect after short delay
      if (data.user) {
        localStorage.setItem("role", data.user.role);
        setTimeout(() => {
          const dest = data.user.role === "client" ? "/client/overview" : "/freelancer/overview";
          navigate(dest, { replace: true });
        }, 1500);
      }
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Verification failed. Please try again.");
    }
  };

  // Auto-submit when all digits are filled
  useEffect(() => {
    const otp = code.join("");
    if (otp.length === CODE_LENGTH && status === "idle") {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setMessage("");
    try {
      const data = await api.post("/api/auth/resend-verification", { email });
      setMessage(data.message || "New code sent!");
      setStatus("idle");
      setCode(Array(CODE_LENGTH).fill(""));
      setCooldown(RESEND_COOLDOWN);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setMessage(err.message || "Failed to resend code.");
      setStatus("error");
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <div className="verify-email-page">
        <div className="gradient-bg"></div>
        <div className="decorative-circle circle-1"></div>
        <div className="decorative-circle circle-2"></div>
        <div className="decorative-circle circle-3"></div>
        <Link to="/" className="back-button">
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>
        <div className="verify-card">
          <Link to="/">
            <img src="/assets/logo/logo.png" alt="Tixe" className="verify-logo" />
          </Link>
          <div className="verify-status">
            <XCircle size={48} className="verify-icon error" />
            <h2>Missing Email</h2>
            <p>No email address provided. Please sign up or try signing in again.</p>
            <Link to="/signup" className="verify-btn">Sign Up</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-email-page">
      <div className="gradient-bg"></div>
      <div className="decorative-circle circle-1"></div>
      <div className="decorative-circle circle-2"></div>
      <div className="decorative-circle circle-3"></div>

      <Link to="/" className="back-button">
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </Link>

      <div className="verify-card">
        <Link to="/">
          <img src="/assets/logo/logo.png" alt="Tixe" className="verify-logo" />
        </Link>

        {status === "success" ? (
          <div className="verify-status">
            <CheckCircle size={48} className="verify-icon success" />
            <h2>Email Verified!</h2>
            <p>{message}</p>
            <p className="verify-hint">Redirecting you to your dashboard...</p>
          </div>
        ) : (
          <>
            <div className="verify-status">
              <ShieldCheck size={48} className="verify-icon otp-icon" />
              <h2>Enter Verification Code</h2>
              <p>
                We sent a 6-digit code to <strong>{email}</strong>
              </p>
            </div>

            <form className="otp-form" onSubmit={handleVerify}>
              <div className="otp-inputs" onPaste={handlePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`otp-digit ${digit ? "filled" : ""} ${status === "error" ? "shake" : ""}`}
                    disabled={status === "verifying"}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              {message && (
                <div className={`otp-message ${status === "error" ? "error" : "info"}`}>
                  {status === "error" && <XCircle size={16} />}
                  {status === "verifying" && <Loader size={16} className="spinning" />}
                  <span>{message}</span>
                </div>
              )}

              <button
                type="submit"
                className="verify-btn"
                disabled={status === "verifying" || code.join("").length !== CODE_LENGTH}
              >
                {status === "verifying" ? (
                  <>
                    <Loader size={18} className="spinning" /> Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </button>
            </form>

            <div className="resend-section">
              <p className="resend-label">
                <Mail size={16} />
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || resending}
                className="resend-btn"
              >
                {resending
                  ? "Sending..."
                  : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Resend Code"}
              </button>
              <p className="verify-hint">Check your spam folder if you don't see the email.</p>
            </div>

            <Link to="/signin" className="verify-link">
              Back to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
