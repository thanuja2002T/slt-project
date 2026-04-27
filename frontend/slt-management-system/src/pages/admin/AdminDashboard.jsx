import "./AdminDashboard.css";
import Sidebar from "../../components/Sidebar";
import StatCard from "../../components/StatCard";

export default function AdminDashboard() {
  return (
    <div className="admin-layout">

      <Sidebar />

      <div className="dashboard">

        <h1 className="page-title">Admin Dashboard</h1>

        {/* 🔹 STAT CARDS */}
        <div className="stats">
          <StatCard title="Total Technicians" value="18" />
          <StatCard title="Completion %" value="84%" />
          <StatCard title="Faults Today" value="47" />
          <StatCard title="Teams Active" value="6" />
        </div>

        {/* 🔹 TABLE */}
        <div className="table-section">
          <h2>Team Performance</h2>

          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>Assigned</th>
                <th>Completed</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>JA1</td>
                <td>6</td>
                <td>6</td>
                <td className="green">100%</td>
              </tr>
              <tr>
                <td>JA2</td>
                <td>6</td>
                <td>5</td>
                <td className="yellow">84%</td>
              </tr>
              <tr>
                <td>JA4</td>
                <td>8</td>
                <td>5</td>
                <td className="red">63%</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}