import React, { useRef } from "react";
import "../styles/CardListing.css";
import Card from "./Card";

export default function CardListing({
  title,        // Section title (h2)
  subtitle,     // Section subtitle (p)
  data = [],    // Default empty array
  renderCard,   // Function to render each card
}) {
  const rowRef = useRef(null);

  const scroll = (direction = "right") => {
    const el = rowRef.current;
    if (!el) return;
    const card = el.querySelector(".card");
    const gap = parseInt(getComputedStyle(el).columnGap || 20, 10) || 20;
    const step = (card?.offsetWidth || 200) + gap;

    el.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  return (
    <section className="cardlisting-section">
      <div className="cardlisting-inner">
        {/* Heading */}
        <div className="cardlisting-heading">
          <div>
            <h2>{title}</h2>
            {subtitle && <p className="muted">{subtitle}</p>}
          </div>
          <div className="cards-arrows">
            <button className="arrow-btn" onClick={() => scroll("left")}>
              &lt;
            </button>
            <button className="arrow-btn" onClick={() => scroll("right")}>
              &gt;
            </button>
          </div>
        </div>

        {/* Cards Row */}
        <div className="cardlisting-row" ref={rowRef}>
          {data.length > 0 ? (
            data.map((item, index) => renderCard(item, index))
          ) : (
            <p className="muted">No items available</p>
          )}
        </div>
      </div>
    </section>
  );
}
