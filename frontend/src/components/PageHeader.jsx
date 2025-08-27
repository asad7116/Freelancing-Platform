import React from "react";
import "../styles/SignIn_PageHeader.css";
// If the image is in 'public/assets/img/Login/Login_Header.png', use a public URL reference:
const headerImage = process.env.PUBLIC_URL + "/assets/img/Login/Login_Header.png";

export default function PageHeader({ title }) {
  return (
    <div
      className="page-header"
      style={{ backgroundImage: `url(${headerImage})` }}
    >
      <div className="overlay">
        <h1>{title}</h1>
        <p>
          Home / <span>{title}</span>
        </p>
      </div>
    </div>
  );
}