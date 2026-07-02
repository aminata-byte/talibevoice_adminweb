import "./Sidebar.css";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  Heart,
  Handshake,
  GraduationCap,
  Briefcase,
  Bell,
  FileText,
  LogOut,
  ClipboardList,
  User,
  AlertTriangle,
  UserCog,
  Target,
  UserCheck,
} from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";

const menuCategories = [
  {
    items: [
      {
        icon: <LayoutDashboard size={20} />,
        label: "Tableau de bord",
        path: "/dashboard",
      },
    ],
  },
  {
    label: "Recensement",
    items: [
      { icon: <Users size={20} />, label: "Talibés", path: "/talibes" },
      { icon: <Building2 size={20} />, label: "Daaras", path: "/daaras" },
    ],
  },
  {
    label: "Terrain",
    items: [
      {
        icon: <ClipboardList size={20} />,
        label: "Missions",
        path: "/missions",
      },
      { icon: <Target size={20} />, label: "Objectifs", path: "/objectifs" },
      { icon: <AlertTriangle size={20} />, label: "Besoins", path: "/besoins" },
    ],
  },
  {
    label: "Dons & Partenaires",
    items: [
      { icon: <Heart size={20} />, label: "Dons", path: "/dons" },
      {
        icon: <Handshake size={20} />,
        label: "Partenaires",
        path: "/partenaires",
      },
    ],
  },
  {
    label: "Formation & Insertion",
    items: [
      {
        icon: <GraduationCap size={20} />,
        label: "Formations",
        path: "/formations",
      },
      {
        icon: <Briefcase size={20} />,
        label: "Insertions",
        path: "/insertions",
      },
    ],
  },
  {
    label: "Communication",
    items: [
      {
        icon: <Bell size={20} />,
        label: "Notifications",
        path: "/notifications",
      },
      { icon: <FileText size={20} />, label: "Rapports", path: "/rapports" },
    ],
  },
  {
    label: "Administration",
    items: [
      { icon: <UserCheck size={20} />, label: "Agents", path: "/agents" },
      {
        icon: <UserCog size={20} />,
        label: "Utilisateurs",
        path: "/utilisateurs",
      },
    ],
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
      <div className="sidebar__logo">
        <img
          src="/src/assets/logo.jpg"
          alt="TalibeVoice"
          className="sidebar__logo-img"
        />
        <span className="sidebar__logo-label">Admin</span>
      </div>

      <nav className="sidebar__nav">
        {menuCategories.map((category, catIndex) => (
          <div key={catIndex} className="sidebar__category">
            {category.label && (
              <p className="sidebar__category-label">{category.label}</p>
            )}
            {category.items.map((item, itemIndex) => (
              <NavLink
                key={itemIndex}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
                }
              >
                <span className="sidebar__link-icon">{item.icon}</span>
                <span className="sidebar__link-label">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

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
