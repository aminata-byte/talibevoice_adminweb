import Sidebar from "./Sidebar";
import Header from "./Header";
import "./AdminLayout.css";

function AdminLayout({ children, titre }) {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-layout__main">
        <Header titre={titre} />
        <main className="admin-layout__content">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
