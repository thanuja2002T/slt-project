import Sidebar from "../components/Sidebar";
import "../pages/Admin/AdminDashboard.css";

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="dashboard">
        {children}
      </div>
    </div>
  );
}