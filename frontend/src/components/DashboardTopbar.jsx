import { Heart, Mail, Bell, UserRound } from "lucide-react";
import "../styles/DashboardTopbar.css";

const Ico = ({ as: As }) => <As size={18} strokeWidth={2} />;

export default function DashboardTopbar() {
  return (
    <div className="dash-topbar">
      <button className="dash-iconbtn" aria-label="Wishlist">
        <Ico as={Heart} />
      </button>

      <button className="dash-iconbtn has-badge" aria-label="Messages">
        <Ico as={Mail} />
        <span className="dash-badge">8</span>
      </button>

      <button className="dash-iconbtn has-badge" aria-label="Notifications">
        <Ico as={Bell} />
        <span className="dash-badge">2</span>
      </button>

      <div className="dash-avatar" title="Profile">
        {/* If you want a Lucide fallback avatar: */}
        {/* <UserRound size={18} /> */}
        <img src="/assets/avatar.jpg" alt="User" />
      </div>
    </div>
  );
}
