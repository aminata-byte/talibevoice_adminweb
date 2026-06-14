import { Bell, Search, User } from "lucide-react";
import "./Header.css";

function Header({ titre }) {
  const admin = JSON.parse(localStorage.getItem("admin") || "{}");

  return (
    <header className="header">
      <div className="header__left">
        <h1 className="header__titre">{titre}</h1>
      </div>

      <div className="header__right">
        {/* Recherche */}
        <div className="header__search">
          <Search size={16} className="header__search-icon" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="header__search-input"
          />
        </div>

        {/* Notifications */}
        <button className="header__notif">
          <Bell size={20} />
          <span className="header__notif-badge">3</span>
        </button>

        {/* Profil admin */}
        <div className="header__profile">
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
