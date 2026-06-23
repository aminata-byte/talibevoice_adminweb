import "./Sidebar.css";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  Heart,
  Handshake,
  GraduationCap,
  Bell,
  FileText,
  LogOut,
  Settings,
  User,
  AlertTriangle,
  UserCog,
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";

const menuItems = [
  {
    icon: <LayoutDashboard size={20} />,
    label: "Tableau de bord",
    path: "/dashboard",
  },
  { icon: <Building2 size={20} />, label: "Daaras", path: "/daaras" },
  { icon: <Users size={20} />, label: "Talibés", path: "/talibes" },
  { icon: <AlertTriangle size={20} />, label: "Besoins", path: "/besoins" },
  { icon: <Heart size={20} />, label: "Dons", path: "/dons" },
  { icon: <Handshake size={20} />, label: "Partenaires", path: "/partenaires" },
  {
    icon: <GraduationCap size={20} />,
    label: "Formations & Insertions",
    path: "/formations",
  },
  { icon: <Bell size={20} />, label: "Notifications", path: "/notifications" },
  { icon: <FileText size={20} />, label: "Rapports", path: "/rapports" },
  {
    icon: <UserCog size={20} />,
    label: "Utilisateurs",
    path: "/utilisateurs",
  },
];

function Sidebar() {
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <img
          src="/src/assets/logo.jpg"
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
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
          }
        >
          <span className="sidebar__link-icon">
            <User size={20} />
          </span>
          <span className="sidebar__link-label">Profile</span>
        </NavLink>
        <NavLink
          to="/parametres"
          className={({ isActive }) =>
            `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
          }
        >
          <span className="sidebar__link-icon">
            <Settings size={20} />
          </span>
          <span className="sidebar__link-label">Settings</span>
        </NavLink>

        {/* Admin info */}
        <div className="sidebar__admin">
          <div className="sidebar__admin-avatar">
            {admin?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="sidebar__admin-info">
            <p className="sidebar__admin-name">{admin?.name || "Admin"}</p>
            <p className="sidebar__admin-role">ADMINISTRATEUR</p>
          </div>
          <button className="sidebar__admin-logout" onClick={handleLogout}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
