// frontend/src/pages/pricing.jsx
import React, { useMemo, useState } from "react";
import "../styles/pricing.css";

const MONTHLY = [
  {
    id: "starter",
    name: "Starter",
    price: 5,
    perks: [
      { text: "5 Job Post per Month", ok: true },
      { text: "5 Transaction Fee", ok: true },
      { text: "10 Proposals Per Month", ok: true },
      { text: "limited Access to Jobs", ok: true },
      { text: "basic Analytics", ok: true },
      { text: "Skill Endorsements", ok: false },
      { text: "Featured Job Listings", ok: false },
      { text: "Custom Job Alerts", ok: false },
      { text: "Custom Job Offer", ok: false },
    ],
  },
  {
    id: "basic",
    name: "Basic",
    price: 25,
    perks: [
      { text: "10 Job Post per Month", ok: true },
      { text: "5 Transaction Fee", ok: true },
      { text: "20 Proposals Per Month", ok: true },
      { text: "limited Access to Jobs", ok: true },
      { text: "basic Analytics", ok: true },
      { text: "Skill Endorsements", ok: true },
      { text: "Featured Job Listings", ok: true },
      { text: "Custom Job Alerts", ok: true },
      { text: "Custom Job Offer", ok: false },
    ],
  },
  {
    id: "pro",
    name: "Professional",
    price: 55,
    highlight: true,
    perks: [
      { text: "25 Job Post per Month", ok: true },
      { text: "5 Transaction Fee", ok: true },
      { text: "30 Proposals Per Month", ok: true },
      { text: "basic Access to Jobs", ok: true },
      { text: "advanced Analytics", ok: true },
      { text: "Skill Endorsements", ok: true },
      { text: "Featured Job Listings", ok: true },
      { text: "Custom Job Alerts", ok: true },
      { text: "Custom Job Offer", ok: true },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 99,
    perks: [
      { text: "1 Job Post per Month", ok: true },
      { text: "2 Transaction Fee", ok: true },
      { text: "unlimited Proposals Per Month", ok: true },
      { text: "all Access to Jobs", ok: true },
      { text: "advanced_detailed Analytics", ok: true },
      { text: "Skill Endorsements", ok: true },
      { text: "Featured Job Listings", ok: true },
      { text: "Custom Job Alerts", ok: true },
      { text: "Custom Job Offer", ok: true },
    ],
  },
];

const YEARLY = MONTHLY.map((p) => ({
  ...p,
  price: Math.round(p.price * 10), // simple example discount logic
}));

export default function Pricing() {
  const [billing, setBilling] = useState("monthly"); // 'monthly' | 'yearly'
  const plans = useMemo(() => (billing === "monthly" ? MONTHLY : YEARLY), [billing]);

  return (
    <section className="pricing-wrap">
      <div className="pricing-container">
        <h2 className="pricing-title">Membership Plan</h2>

        {/* Toggle */}
        <div className="billing-toggle" role="tablist" aria-label="Billing period">
          <button
            className={`toggle-btn ${billing === "monthly" ? "active" : ""}`}
            onClick={() => setBilling("monthly")}
            role="tab"
            aria-selected={billing === "monthly"}
          >
            Monthly
          </button>
          <button
            className={`toggle-btn ${billing === "yearly" ? "active" : ""}`}
            onClick={() => setBilling("yearly")}
            role="tab"
            aria-selected={billing === "yearly"}
          >
            Yearly
          </button>
        </div>

        {/* Cards */}
        <div className="pricing-grid">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`plan-card ${plan.highlight ? "plan--highlight" : ""}`}
            >
              <header className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="amount">{plan.price.toFixed(2)}৳</span>
                  <span className="term">/mo</span>
                  <img src="/assets/logo/logo-icon.png" alt="" className="plan-mark" />
                </div>
              </header>

              <ul className="plan-perks">
                {plan.perks.map((p, i) => (
                  <li key={i} className={p.ok ? "ok" : "no"}>
                    <span className="dot" aria-hidden="true" />
                    {p.text}
                  </li>
                ))}
              </ul>

              <footer>
                <button className="plan-cta">
                  Get Started <span>→</span>
                </button>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
