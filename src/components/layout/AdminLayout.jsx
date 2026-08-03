import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./AdminLayout.css";

function AdminLayout({ children, titre }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-layout__main">
        <Header titre={titre} onMenuClick={() => setSidebarOpen(true)} />
        <main className="admin-layout__content">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
