  import React, { useState } from "react";
  import "../styles/Login_Toggle.css";

  // src/components/Login_Toggle.jsx
// Controlled two-option toggle: Buyer / Seller
// Props:
//   selected: "Buyer" | "Seller" | ""
//   onSelect: (value: "Buyer" | "Seller") => void
export default function ToggleButtons({ selected = "", onSelect }) {
  const value = selected || "";

  const choose = (v) => {
    if (typeof onSelect === "function") onSelect(v);
  };

  return (
    <div className="toggle-buttons" role="tablist" aria-label="Account type">
      <button
        type="button"
        className={`toggle-btn ${value === "Buyer" ? "active" : ""}`}
        aria-pressed={value === "Buyer"}
        onClick={() => choose("Buyer")}
      >
        Buyer
      </button>

      <button
        type="button"
        className={`toggle-btn ${value === "Seller" ? "active" : ""}`}
        aria-pressed={value === "Seller"}
        onClick={() => choose("Seller")}
      >
        Seller
      </button>
    </div>
  );
}

