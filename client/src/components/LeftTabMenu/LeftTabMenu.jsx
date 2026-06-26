import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./LeftTabMenu.css";

function LeftTabMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const allMenuItems = [
    { path: "/admin-dashboard", icon: "🏠", label: "Dashboard", role: "Admin" },
    { path: "/language", icon: "🌐", label: "Language", role: "Admin" },
    { path: "/project", icon: "📁", label: "Project", role: "Admin" },
    { path: "/module", icon: "🧩", label: "Module", role: "Admin" },
    { path: "/dbconnect", icon: "🗄️", label: "Db Connection", role: "Admin" },
    { path: "/lov", icon: "📋", label: "List of Values", role: "Admin" },
    {
      path: "/lov-det",
      icon: "🔍",
      label: "List of Values Details",
      role: "Admin",
    },
    { path: "/err-msg", icon: "❗", label: "Error Messages", role: "Admin" },
    { path: "/product", icon: "📦", label: "Product", role: "Admin" },
    { path: "/user", icon: "👤", label: "Users", role: "Admin" },
    {
      path: "/user-project",
      icon: "🔗",
      label: "User Project Map",
      role: "Admin",
    },
    {
      path: "/developer-dashboard",
      icon: "🏠",
      label: "Dashboard",
      role: "Developer",
    },

    { path: "/gen-page", icon: "⚙️", label: "Gen Page", role: "Developer" },
  ];

  const menuItems = allMenuItems.filter(
    (item) => !item.role || item.role === user?.Role,
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="left-tab-menu">
      {/* Header */}
      <div className="menu-header">
        <div className="menu-title">⚡ ACGS Pro</div>
      </div>

      {/* Menu List */}
      <ul className="menu-list">
        {menuItems.map((item) => (
          <li key={item.path} className="menu-item">
            <Link
              to={item.path}
              className={`nav-link ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Footer / User Profile */}
      <div className="menu-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.Username?.[0].toUpperCase()}</div>
          <div className="user-details">
            <div className="user-name">{user?.Username}</div>
            <div className="user-role">{user?.Role}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <span>🚪</span>
        </button>
      </div>
    </aside>
  );
}

export default LeftTabMenu;
