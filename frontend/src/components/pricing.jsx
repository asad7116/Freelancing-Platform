import React, { useMemo, useState } from "react";
import { Check, X, Zap, Shield, Crown, Star } from "lucide-react";
import "../styles/pricing.css";

const MONTHLY = [
  {
    id: "starter",
    name: "Starter",
    price: 5,
    icon: <Zap size={24} />,
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
    icon: <Star size={24} />,
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
    icon: <Crown size={24} />,
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
    icon: <Shield size={24} />,
    perks: [
      { text: "Unlimited Job Posts", ok: true },
      { text: "2% Transaction Fee", ok: true },
      { text: "Unlimited Proposals", ok: true },
      { text: "Full Access to Jobs", ok: true },
      { text: "Advanced Detailed Analytics", ok: true },
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
    <section className="pricing-wrap-new">
      <div className="pricing-inner">
        <div className="pricing-intro">
          <span className="pricing-badge">Simple Pricing</span>
          <h2 className="pricing-main-title">Flexible Plans for Every Budget</h2>
          <p>Choose the plan that's right for you and start your journey today.</p>

          <div className="pricing-toggle-group">
            <span className={billing === "monthly" ? "active" : ""}>Monthly</span>
            <button
              className={`toggle-switch ${billing === "yearly" ? "yearly" : ""}`}
              onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
              aria-label="Toggle billing cycle"
            >
              <span className="switch-knob"></span>
            </button>
            <span className={billing === "yearly" ? "active" : ""}>
              Yearly <span className="discount">-20% Off</span>
            </span>
          </div>
        </div>

        <div className="pricing-cards-grid">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`plan-card-new ${plan.highlight ? "highlighted" : ""}`}
            >
              {plan.highlight && <div className="most-popular">Most Popular</div>}
              <div className="card-top">
                <div className="plan-icon-wrapper">{plan.icon}</div>
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="currency">$</span>
                  <span className="amount">{plan.price}</span>
                  <span className="duration">{billing === "monthly" ? "/mo" : "/yr"}</span>
                </div>
              </div>

              <div className="card-features">
                <ul className="perks-list">
                  {plan.perks.map((p, i) => (
                    <li key={i} className={p.ok ? "feature-ok" : "feature-no"}>
                      {p.ok ? (
                        <Check size={18} className="feat-icon" />
                      ) : (
                        <X size={18} className="feat-icon" />
                      )}
                      <span>{p.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card-bottom">
                <button className={`cta-btn ${plan.highlight ? "cta-solid" : "cta-outline"}`}>
                  Get Started Now
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
