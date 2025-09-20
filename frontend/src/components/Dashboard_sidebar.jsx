import { NavLink } from "react-router-dom";
import {
  Home,
  List,
  BriefcaseBusiness,     // "Gigs"
  ClipboardList,         // "My Orders"
  FileText,              // "My Proposals"
  CreditCard,            // "Subscription"
  MessageSquare,         // "Messages"
  Images,                // "Portfolio"
  Star,                  // "Wishlist"
  Wallet,                // "Payouts"
  UserRound              // "Profile"
} from "lucide-react";

import "../styles/dashboard-sidebar.css";

const Icon = ({ as: As }) => <As className="wz-ic" size={18} strokeWidth={2} />;

export default function DashboardSidebar() {
  const Item = (to, IconCmp, label) => (
    <NavLink
      to={to}
      end
      className={({ isActive }) => "wz-link" + (isActive ? " is-active" : "")}
    >
      <Icon as={IconCmp} />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <div className="wz-sidebar">
      {/* Brand */}
      <div className="wz-brand">
        <div className="wz-brand-logo">
          {/* you can swap this for an <img> logo */}
          <Home size={18} className="wz-ic" />
        </div>
        <div className="wz-brand-text">
          <span className="wz-brand-main">Work</span>
          <span className="wz-brand-sub">zone</span>
        </div>
      </div>

      {/* Menu */}
      <nav className="wz-menu">
        {Item("overview", Home, "Dashboard")}
        {Item("orders", List, "Orders")}
        {Item("gigs", BriefcaseBusiness, "Gigs")}
        {Item("my-orders", ClipboardList, "My Orders")}
        {Item("my-proposals", FileText, "My Proposals")}
        {Item("subscription", CreditCard, "Subscription")}
        {Item("messages", MessageSquare, "Messages")}
        {Item("portfolio", Images, "Portfolio")}
        {Item("wishlist", Star, "Wishlist")}
        {Item("payouts", Wallet, "Payouts")}
        {Item("profile", UserRound, "Profile")}
      </nav>
    </div>
  );
}
