import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  Heart,
  Handshake,
  GraduationCap,
  FileText,
  Bell,
  BarChart3,
  LogOut,
  Settings,
} from "lucide-react";
import "./Sidebar.css";

const menuItems = [
  {
    icon: <LayoutDashboard size={20} />,
    label: "Dashboard",
    path: "/dashboard",
  },
  { icon: <Building2 size={20} />, label: "Daaras", path: "/daaras" },
  { icon: <Users size={20} />, label: "Talibés", path: "/talibes" },
  { icon: <Heart size={20} />, label: "Dons", path: "/dons" },
  { icon: <Handshake size={20} />, label: "Partenaires", path: "/partenaires" },
  {
    icon: <GraduationCap size={20} />,
    label: "Formations",
    path: "/formations",
  },
  { icon: <Users size={20} />, label: "Agents", path: "/agents" },
  { icon: <FileText size={20} />, label: "Rapports", path: "/rapports" },
  { icon: <Bell size={20} />, label: "Notifications", path: "/notifications" },
  {
    icon: <BarChart3 size={20} />,
    label: "Statistiques",
    path: "/statistiques",
  },
];

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <img
          src="/src/assets/logo.png"
          alt="TalibeVoice"
          className="sidebar__logo-img"
        />
        <span className="sidebar__logo-label">Admin</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
          >
            <span className="sidebar__link-icon">{item.icon}</span>
            <span className="sidebar__link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar__footer">
        <NavLink to="/parametres" className="sidebar__link">
          <span className="sidebar__link-icon">
            <Settings size={20} />
          </span>
          <span className="sidebar__link-label">Paramètres</span>
        </NavLink>
        <button className="sidebar__logout" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
