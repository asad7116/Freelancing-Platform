import React from "react";
import { FileText, Eye } from "lucide-react";
import "../styles/my_proposals.css";

const DUMMY_PROPOSALS = [
  {
    id: "p-1060",
    client: { name: "Matthew Anderson", avatar: "/assets/avatar.png" },
    job: "Senior Full-Stack Developer and UX/UI Designer",
    service: "App icon Design For Android And iOS",
    price: 1060,
    revisions: 7,
    deliveryDays: 15,
    status: "Paid",
  },
  {
    id: "p-0370",
    client: { name: "Matthew Anderson", avatar: "/assets/avatar.png" },
    job: "UI/UX Designer and Front-End Developer",
    service: "Custom Typography Design for your Product",
    price: 370,
    revisions: 1,
    deliveryDays: 10,
    status: "Paid",
  },
];

export default function MyProposals() {
  return (
    <div className="dz-with-shell">
      {/* Shared sidebar + topbar */}
      {/* <DashboardSidebar user={{ name: "Alex", avatar: "/assets/avatar.png" }} /> */}

      {/* Main content, properly shifted */}
      <main className="dz-main dz-shell-main-padding">
        <div className="dz-headerband">
          <h1>My Proposals</h1>
          <p className="dz-breadcrumb">Jobs &gt; My Proposals</p>
        </div>

        <section className="proposals-container">
          {DUMMY_PROPOSALS.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FileText size={48} />
              </div>
              <h3>No proposals yet</h3>
              <p>Start submitting proposals to jobs that interest you</p>
            </div>
          ) : (
            <div className="proposals-grid">
              {DUMMY_PROPOSALS.map((p) => (
                <div key={p.id} className="proposal-card">
                  <div className="proposal-card-inner">
                    <div className="proposal-card-glass"></div>
                    
                    {/* Badge System */}
                    <div className="proposal-badge">
                      <span className="proposal-circle proposal-circle1"></span>
                      <span className="proposal-circle proposal-circle2"></span>
                      <span className="proposal-circle proposal-circle3"></span>
                      <span className="proposal-circle proposal-circle4"></span>
                      <span className="proposal-circle proposal-circle5">
                        <FileText size={18} />
                      </span>
                    </div>

                    {/* Proposal Info */}
                    <div className="proposal-info">
                      <div className="proposal-price">
                        ${p.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <h3 className="proposal-job-title">{p.job}</h3>
                      <p className="proposal-service">{p.service}</p>
                      
                      <div className="proposal-meta">
                        <span className="proposal-meta-item">
                          {p.revisions} Revisions
                        </span>
                        <span className="proposal-meta-item">
                          {p.deliveryDays} Days
                        </span>
                      </div>

                      <div className="proposal-client">
                        <img 
                          src={p.client.avatar} 
                          alt={p.client.name}
                          className="proposal-client-avatar"
                        />
                        <span className="proposal-client-name">{p.client.name}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="proposal-footer">
                      <span className={`proposal-status ${p.status.toLowerCase()}`}>
                        {p.status}
                      </span>
                      <div className="proposal-actions">
                        <button className="action-btn" title="View">
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
