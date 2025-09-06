// frontend/src/pages/Jobs.jsx
import React, { useState, useMemo } from "react";
import "../styles/jobs.css";

const JOBS = [
  {
    id: 1,
    title: "Technical Writer and Documentation Specialist",
    salary: 550,
    urgent: true,
    category: "Writing",
  },
  {
    id: 2,
    title: "Marketing Automation Specialist and Email Coordinator",
    salary: 120,
    urgent: false,
    category: "Marketing",
  },
  {
    id: 3,
    title: "Full-Stack Developer and Data Analyst",
    salary: 290,
    urgent: true,
    category: "Development",
  },
  {
    id: 4,
    title: "Graphic Designer and Brand Strategist",
    salary: 290,
    urgent: false,
    category: "Design",
  },
  {
    id: 5,
    title: "Marketing Copywriter and Social Media Manager",
    salary: 340,
    urgent: false,
    category: "Marketing",
  },
  {
    id: 6,
    title: "Mobile App Developer and Designer",
    salary: 770,
    urgent: true,
    category: "Development",
  },
  {
    id: 7,
    title: "Digital Marketing and Content Creation Specialist",
    salary: 340,
    urgent: false,
    category: "Marketing",
  },
  {
    id: 8,
    title: "UI/UX Designer and Front-End Developer",
    salary: 340,
    urgent: false,
    category: "Design",
  },
  {
    id: 9,
    title: "Senior Web Developer and SEO Specialist",
    salary: 550,
    urgent: false,
    category: "Development",
  },
  {
    id: 10,
    title: "Senior Manager, Finance and Administration",
    salary: 290,
    urgent: true,
    category: "Finance",
  },
];

export default function Jobs() {
  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 6;

  const categories = useMemo(
    () => Array.from(new Set(JOBS.map((j) => j.category))),
    []
  );

  const filtered = useMemo(() => {
    let arr = [...JOBS];
    if (query) arr = arr.filter((j) => j.title.toLowerCase().includes(query.toLowerCase()));
    if (category) arr = arr.filter((j) => j.category === category);
    return arr;
  }, [query, category]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <main className="jobs-wrap">
      <div className="jobs-container">
        {/* Filters */}
        <div className="jobs-filters">
          <input
            type="text"
            className="jobs-input"
            placeholder="Job Title or Keywords"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="jobs-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button className="jobs-btn">Find Job</button>

          <div className="jobs-view">
            <button
              className={`jobs-view-btn ${view === "grid" ? "active" : ""}`}
              onClick={() => setView("grid")}
              title="Grid view"
            >
              ▦
            </button>
            <button
              className={`jobs-view-btn ${view === "list" ? "active" : ""}`}
              onClick={() => setView("list")}
              title="List view"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className={`jobs-grid ${view === "list" ? "list" : ""}`}>
          {paginated.map((job) => (
            <div className={`job-card ${view}`} key={job.id}>
              {job.urgent && <span className="badge">Urgent</span>}
              <div className="job-icon">{job.title.charAt(0)}</div>
              <div className="job-salary">{job.salary}.00৳</div>
              <h3 className="job-title">{job.title}</h3>
              <button className="apply-btn">Apply Now →</button>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="jobs-pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i + 1}
              className={page === i + 1 ? "active" : ""}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}
