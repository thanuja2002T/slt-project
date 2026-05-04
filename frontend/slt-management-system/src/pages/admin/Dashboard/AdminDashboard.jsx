import "./AdminDashboard.css";

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">

      {/* HEADER */}
      <div className="header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Overview of all field teams and performance metrics today</p>
        </div>
      </div>

      {/* STATS */}
      <div className="Dashboard-stats">
        <div className="Dashboard-stat-card green">
          <h4>Avg Completion</h4>
          <h2>84%</h2>
          <p>↑ 6% from last month</p>
        </div>

        <div className="Dashboard-stat-card orange">
          <h4>Faults Today</h4>
          <h2>47</h2>
          <p>39 attended • 8 pending</p>
        </div>

        <div className="Dashboard-stat-card purple">
          <h4>Teams Active</h4>
          <h2>6</h2>
          <p>FTTH ×3 • PSTN ×3</p>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="main-grid">

        {/* LEFT TABLE */}
        <div className="card table-card">
          <h3>Team Performance Overview</h3>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Members</th>
                  <th>Type</th>
                  <th>Assigned</th>
                  <th>Attended</th>
                  <th>Completion</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>JA1</td>
                  <td>001,005</td>
                  <td><span className="tag blue">FTTH</span></td>
                  <td>6</td>
                  <td>6</td>
                  <td className="green-text">100%</td>
                  <td><span className="status good">On track</span></td>
                </tr>

                <tr>
                  <td>JA2</td>
                  <td>003,004</td>
                  <td><span className="tag purple">PSTN</span></td>
                  <td>6</td>
                  <td>5</td>
                  <td className="yellow-text">84%</td>
                  <td><span className="status warn">Review</span></td>
                </tr>

                <tr>
                  <td>JA4</td>
                  <td>007,008</td>
                  <td><span className="tag purple">PSTN</span></td>
                  <td>8</td>
                  <td>5</td>
                  <td className="red-text">63%</td>
                  <td><span className="status bad">Behind</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>


    </div>
  );
}