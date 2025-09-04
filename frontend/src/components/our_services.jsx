// frontend/src/pages/our_services.jsx
import React, { useEffect, useMemo, useState } from "react";
import "../styles/our_services.css";

/** ---- Dummy services (no backend) ---- */
const DUMMY_SERVICES = [
  {
    id: "svc_001",
    title: "Mobile App iOS Developer Wanted",
    price: 59,
    rating: 0.0,
    reviews: 0,
    seller: { name: "David Miller", verified: false },
    category: "Mobile Apps",
    subcategory: "iOS",
    image:
      "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "svc_002",
    title: "Content Writer for Blog Articles",
    price: 60,
    rating: 0.0,
    reviews: 0,
    seller: { name: "David Miller", verified: false },
    category: "Writing",
    subcategory: "Blogs",
    image:
      "https://images.unsplash.com/photo-1529336953121-4fdc4a73f13d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "svc_003",
    title: "Digital Marketer for Social Media",
    price: 49,
    rating: 0.0,
    reviews: 0,
    seller: { name: "Naymr Jhon", verified: false },
    category: "Marketing",
    subcategory: "Social Media",
    image:
      "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "svc_004",
    title: "Video Editor for Creative Projects",
    price: 30,
    rating: 4.0,
    reviews: 3,
    seller: { name: "David Richard", verified: true },
    category: "Video & Animation",
    subcategory: "Editing",
    image:
      "https://images.unsplash.com/photo-1522199710521-72d69614c702?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "svc_005",
    title: "Social Media Manager for Engagement",
    price: 15,
    rating: 0.0,
    reviews: 0,
    seller: { name: "David Simmmonsss", verified: true },
    category: "Marketing",
    subcategory: "Community",
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "svc_006",
    title: "Mobile App iOS Developer Wanted",
    price: 25,
    rating: 0.0,
    reviews: 0,
    seller: { name: "Open X Labs", verified: false },
    category: "Mobile Apps",
    subcategory: "iOS",
    image:
      "https://images.unsplash.com/photo-1551281044-8i1efc2c44f3?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "svc_007",
    title: "Illustration for Mobile App UI",
    price: 95,
    rating: 0.0,
    reviews: 0,
    seller: { name: "J. Creative", verified: false },
    category: "Design",
    subcategory: "Illustration",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "svc_008",
    title: "Fitness App Landing Page UI",
    price: 70,
    rating: 0.0,
    reviews: 0,
    seller: { name: "FitLev Studio", verified: false },
    category: "Design",
    subcategory: "UI/UX",
    image:
      "https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "svc_009",
    title: "Financials Dashboard Website UI",
    price: 80,
    rating: 3.0,
    reviews: 1,
    seller: { name: "Growth Fintech", verified: false },
    category: "Design",
    subcategory: "UI/UX",
    image:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function OurServices({ initialServices }) {
  // data
  const [services, setServices] = useState(initialServices || []);
  // UI state
  const [view, setView] = useState("grid"); // 'grid' | 'list'
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [sort, setSort] = useState("relevant");
  const [wishlist, setWishlist] = useState(() => new Set());

  // load dummy data (no backend)
  useEffect(() => {
    if (!initialServices) setServices(DUMMY_SERVICES);
  }, [initialServices]);

  // dropdown options
  const categories = useMemo(
    () => Array.from(new Set(services.map((s) => s?.category).filter(Boolean))).sort(),
    [services]
  );
  const subcategories = useMemo(
    () => Array.from(new Set(services.map((s) => s?.subcategory).filter(Boolean))).sort(),
    [services]
  );

  // filtering + sorting
  const filtered = useMemo(() => {
    let arr = [...services];
    const q = query.trim().toLowerCase();

    if (q) {
      arr = arr.filter(
        (s) =>
          s?.title?.toLowerCase().includes(q) ||
          s?.seller?.name?.toLowerCase().includes(q)
      );
    }
    if (category) arr = arr.filter((s) => s?.category === category);
    if (subcategory) arr = arr.filter((s) => s?.subcategory === subcategory);

    switch (sort) {
      case "priceLow":
        arr.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "priceHigh":
        arr.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "rating":
        arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default: {
        const score = (s) =>
          (q
            ? (s?.title?.toLowerCase().includes(q) ? 2 : 0) +
              (s?.category?.toLowerCase().includes(q) ? 1 : 0)
            : 0) + (s?.rating || 0) / 5;
        arr.sort((a, b) => score(b) - score(a));
      }
    }
    return arr;
  }, [services, query, category, subcategory, sort]);

  // wishlist toggle
  const toggleWish = (id) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <main className="osc-wrap">
      <div className="osc-container">
        <h1 className="osc-title">Browse Services</h1>

        {/* Filters */}
        <div className="osc-filters" role="region" aria-label="Service Filters">
          <input
            className="osc-input"
            placeholder="Search.."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search services"
          />

          <select
            className="osc-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            className="osc-select"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            aria-label="Filter by subcategory"
          >
            <option value="">Sub Categories</option>
            {subcategories.map((sc) => (
              <option key={sc} value={sc}>
                {sc}
              </option>
            ))}
          </select>

          <select
            className="osc-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort services"
          >
            <option value="relevant">Most Relevant</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
            <option value="rating">Rating</option>
          </select>

          <div className="osc-view" aria-label="View mode">
            <button
              className={`osc-btn ${view === "grid" ? "osc-btn--active" : ""}`}
              onClick={() => setView("grid")}
              title="Grid view"
              aria-pressed={view === "grid"}
            >
              ▦
            </button>
            <button
              className={`osc-btn ${view === "list" ? "osc-btn--active" : ""}`}
              onClick={() => setView("list")}
              title="List view"
              aria-pressed={view === "list"}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className={`osc-grid ${view === "list" ? "osc-grid--list" : ""}`}>
          {filtered.map((s) => (
            <article
              className={`osc-card ${view === "list" ? "osc-card--list" : ""}`}
              key={s.id}
            >
              <div className="osc-card__media">
                <img src={s.image} alt={s.title} />
                <button
                  className={`osc-heart ${wishlist.has(s.id) ? "osc-heart--on" : ""}`}
                  onClick={() => toggleWish(s.id)}
                  aria-label="Toggle wishlist"
                >
                  ❤
                </button>
              </div>

              <div className="osc-card__body">
                <div className="osc-price">${Number(s.price || 0).toFixed(2)}</div>

                <h3 className="osc-name" title={s.title}>
                  {s.title}
                </h3>

                <div className="osc-meta">
                  <span className="osc-rating">
                    ★ {Number(s.rating || 0).toFixed(1)} ({s.reviews || 0})
                  </span>
                </div>

                <div className="osc-seller">
                  {s?.seller?.name}
                  {s?.seller?.verified ? " ✔" : ""}
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="osc-empty">No services found. Try adjusting filters.</div>
        )}
      </div>
    </main>
  );
}
