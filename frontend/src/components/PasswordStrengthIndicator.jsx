import React, { useMemo } from "react";
import "../styles/PasswordStrengthIndicator.css";

export default function PasswordStrengthIndicator({ password, showRequirements = false }) {
  // Calculate password strength
  const strength = useMemo(() => {
    if (!password) return { score: 0, level: "empty", label: "", color: "" };

    let score = 0;
    const feedback = {
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      isLong: password.length >= 8,
      isVeryLong: password.length >= 12,
    };

    // Score calculation
    if (feedback.hasLower) score += 1;
    if (feedback.hasUpper) score += 1;
    if (feedback.hasNumber) score += 1;
    if (feedback.hasSpecial) score += 1;
    if (feedback.isLong) score += 1;
    if (feedback.isVeryLong) score += 1;

    let level = "weak";
    let label = "Weak";
    let color = "#e74c3c";

    if (score <= 2) {
      level = "weak";
      label = "Weak";
      color = "#e74c3c";
    } else if (score <= 4) {
      level = "fair";
      label = "Fair";
      color = "#f39c12";
    } else if (score <= 5) {
      level = "good";
      label = "Good";
      color = "#3498db";
    } else {
      level = "strong";
      label = "Strong";
      color = "#27ae60";
    }

    return {
      score,
      level,
      label,
      color,
      feedback,
    };
  }, [password]);

  if (!password) {
    return null;
  }

  const percentage = (strength.score / 6) * 100;

  return (
    <div className="password-strength-container">
      <div className="strength-bar-wrapper">
        <div
          className={`strength-bar strength-${strength.level}`}
          style={{
            width: `${percentage}%`,
            backgroundColor: strength.color,
          }}
        ></div>
      </div>
      <div className="strength-label" style={{ color: strength.color }}>
        {strength.label}
      </div>

      {showRequirements && strength.feedback && (
        <div className="password-requirements">
          <div className={`requirement ${strength.feedback.hasLower ? "met" : "unmet"}`}>
            <span className="requirement-icon">
              {strength.feedback.hasLower ? "✓" : "○"}
            </span>
            <span>At least one lowercase letter</span>
          </div>
          <div className={`requirement ${strength.feedback.hasUpper ? "met" : "unmet"}`}>
            <span className="requirement-icon">
              {strength.feedback.hasUpper ? "✓" : "○"}
            </span>
            <span>At least one uppercase letter</span>
          </div>
          <div className={`requirement ${strength.feedback.hasNumber ? "met" : "unmet"}`}>
            <span className="requirement-icon">
              {strength.feedback.hasNumber ? "✓" : "○"}
            </span>
            <span>At least one number</span>
          </div>
          <div className={`requirement ${strength.feedback.hasSpecial ? "met" : "unmet"}`}>
            <span className="requirement-icon">
              {strength.feedback.hasSpecial ? "✓" : "○"}
            </span>
            <span>At least one special character (!@#$%^&*)</span>
          </div>
          <div className={`requirement ${strength.feedback.isLong ? "met" : "unmet"}`}>
            <span className="requirement-icon">
              {strength.feedback.isLong ? "✓" : "○"}
            </span>
            <span>At least 8 characters</span>
          </div>
        </div>
      )}
    </div>
  );
}
