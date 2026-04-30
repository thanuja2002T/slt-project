import { Link } from "react-router-dom";

export default function Sidebar({ open, setOpen }) {
  return (
    <div className={`sidebar ${open ? "open" : ""}`}>

      <h2 className="logo">SLT.Perform</h2>

      <nav>
        <Link to="/dashboard" onClick={() => setOpen(false)}>📊 Dashboard</Link>
        <Link to="/daily" onClick={() => setOpen(false)}>📋 Daily Update</Link>
        <Link to="/summary" onClick={() => setOpen(false)}>📈 Summary</Link>
        <Link to="/analysis" onClick={() => setOpen(false)}>🔍 Analysis</Link>
        <Link to="/notifications" onClick={() => setOpen(false)}>🔔 Notifications</Link>
      </nav>

    </div>
  );
}