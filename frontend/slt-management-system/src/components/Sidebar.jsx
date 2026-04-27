import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="logo">SLT.Perform</h2>

      <nav>
        <Link to="/dashboard">📊 Dashboard</Link>
        <Link to="/daily">📋 Daily Update</Link>
        <Link to="/summary">📈 Summary</Link>
        <Link to="/analysis">🔍 Analysis</Link>
        <Link to="/notifications">🔔 Notifications</Link>
      </nav>
    </div>
  );
}