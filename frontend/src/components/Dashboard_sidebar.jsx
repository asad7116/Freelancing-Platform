// src/components/Dashboard_sidebar.jsx
import { NavLink } from "react-router-dom";
import {
  Home, List, BriefcaseBusiness, ClipboardList, FileText,
  MessageSquare, Wallet, CreditCard, Images, Star, UserRound, Search
} from "lucide-react";

const MENU = {
  client: [
    { to: "overview", label: "Dashboard", icon: Home },
    { to: "browse-gigs", label: "Browse Gigs", icon: Search },
    { to: "orders",   label: "Add Jobs",    icon: List },
    { to: "MyProposals", label: "My Proposals", icon: FileText },
    { to: "messages", label: "Messages",  icon: MessageSquare },
    { to: "billing",  label: "Billing",   icon: CreditCard },
    { to: "profile",  label: "Profile",   icon: UserRound },
  ],
  freelancer: [
    { to: "overview",   label: "Dashboard",  icon: Home },
    { to: "browse-jobs", label: "Browse Jobs", icon: Search },
    { to: "gigs",       label: "Gigs",       icon: BriefcaseBusiness },
    { to: "orders",     label: "My Proposals",  icon: ClipboardList },
    { to: "my-proposals", label: "My Proposals Old", icon: FileText },
    { to: "subscription", label: "Subscription", icon: CreditCard },
    { to: "messages",   label: "Messages",   icon: MessageSquare },
    { to: "portfolio",  label: "Portfolio",  icon: Images },
    { to: "wishlist",   label: "Wishlist",   icon: Star },
    { to: "payouts",    label: "Payouts",    icon: Wallet },
    { to: "profile",    label: "Profile",    icon: UserRound },
  ],
};

export default function DashboardSidebar({ role }) {
  console.log("DashboardSidebar role =", role); // DEBUG: remove later
  const items = MENU[role] || MENU.freelancer;

  return (
    <div className="wz-sidebar">
      <div className="wz-brand">
        <div className="wz-brand-logo"><Home size={18} className="wz-ic" /></div>
        <div className="wz-brand-text">
          <span className="wz-brand-main">Work</span>
          <span className="wz-brand-sub">zone</span>
        </div>
      </div>

      <nav className="wz-menu">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) => "wz-link" + (isActive ? " is-active" : "")}
          >
            <Icon className="wz-ic" size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
