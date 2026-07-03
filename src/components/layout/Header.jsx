import { useState, useEffect } from "react";
import { Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import adminService from "../../services/adminService";
import "./Header.css";

function Header({ titre }) {
  const admin = JSON.parse(localStorage.getItem("admin") || "{}");
  const navigate = useNavigate();
  const [nonLues, setNonLues] = useState(0);

  useEffect(() => {
    fetchNonLues();
  }, []);

  const fetchNonLues = async () => {
    try {
      const data = await adminService.getNotifications();
      const count = Array.isArray(data)
        ? data.filter((n) => !n.est_lue).length
        : 0;
      setNonLues(count);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="header">
      <div className="header__left">
        <h1 className="header__titre">{titre}</h1>
      </div>

      <div className="header__right">
        <button
          className="header__notif"
          onClick={() => navigate("/notifications")}
        >
          <Bell size={20} />
          {nonLues > 0 && (
            <span className="header__notif-badge">{nonLues}</span>
          )}
        </button>

        <div
          className="header__profile"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/profile")}
        >
          <div className="header__profile-avatar">
            <User size={18} />
          </div>
          <div className="header__profile-info">
            <p className="header__profile-name">
              {admin.name || "Administrateur"}
            </p>
            <p className="header__profile-role">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
