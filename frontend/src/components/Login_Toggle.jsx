  import React, { useState } from "react";
  import "../styles/Login_Toggle.css";

  export default function ToggleButtons() {
    const [selected, setSelected] = useState("Buyer");

    return (
      <div className="toggle-container">
        <button
          className={`toggle-btn ${selected === "Buyer" ? "active-buyer" : ""}`}
          onClick={() => setSelected("Buyer")}
        >
          Buyer
        </button>
        <button
          className={`toggle-btn ${selected === "Seller" ? "active-seller" : ""}`}
          onClick={() => setSelected("Seller")}
        >
          Seller
        </button>
      </div>
    );
  }
