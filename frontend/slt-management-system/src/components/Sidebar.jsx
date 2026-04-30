import { Link } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({ open, setOpen }) {
  return (
    <div className={`sidebar ${open ? "open" : ""}`}>

      <div className="sidebar-content">
        <h2 className="logo">SLT.Perform</h2>

        <nav>
          <Link to="/dashboard" onClick={() => setOpen(false)}>📊 Dashboard</Link>
          <Link to="/daily" onClick={() => setOpen(false)}>📋 Daily Update</Link>
          <Link to="/analysis" onClick={() => setOpen(false)}>🔍 Analysis</Link>
          <Link to="/summary" onClick={() => setOpen(false)}>📈 Summary</Link>
          <Link to="/notifications" onClick={() => setOpen(false)}>🔔 Notifications</Link>
        </nav>
      </div>

      {/* 🔥 USER PROFILE (BOTTOM) */}
      <div className="sidebar-user">
        <div className="avatar">AD</div>
        <div>
          <p className="user-name">Admin User</p>
          <p className="user-role">SLT Headquarters</p>
        </div>
      </div>

    </div>
  );
}