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

        <div className="header-actions">
          <button className="btn-outline">Export CSV</button>
        </div>
      </div>

      {/* STATS */}
      <div className="stats">
        <div className="stat-card blue">
          <h4>Total Technicians</h4>
          <h2>18</h2>
          <p>JA1 – JA18 active</p>
        </div>

        <div className="stat-card green">
          <h4>Avg Completion</h4>
          <h2>84%</h2>
          <p>↑ 6% from last month</p>
        </div>

        <div className="stat-card orange">
          <h4>Faults Today</h4>
          <h2>47</h2>
          <p>39 attended • 8 pending</p>
        </div>

        <div className="stat-card purple">
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

        {/* RIGHT SIDE */}
        <div className="right-panel">

          {/* ACTIONS */}
          <div className="card">
            <h3>Quick Actions</h3>

            <button className="action-btn primary">📊 View Summary Table</button>
            <button className="action-btn">📋 Manager Daily Update</button>
            <button className="action-btn">📉 Fault Analysis Report</button>
            <button className="action-btn">🏆 Final Comparison</button>
          </div>

          {/* BARS */}
          <div className="card">
            <h3>Today's Fault Breakdown</h3>

            <p>FTTH Faults</p>
            <div className="bar blue"><div style={{ width: "85%" }}></div></div>

            <p>PSTN Faults</p>
            <div className="bar purple"><div style={{ width: "70%" }}></div></div>

            <p>Data Faults</p>
            <div className="bar green"><div style={{ width: "20%" }}></div></div>
          </div>

        </div>
      </div>

      {/* 🔻 FULL WIDTH ACTIVITY */}
      <div className="card activity-card">
        <h3>Recent Activity Log</h3>

        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Technician</th>
              <th>Team</th>
              <th>Action</th>
              <th>Fault Type</th>
              <th>Vehicle</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>09:14</td>
              <td>JA1 • Member 001</td>
              <td><span className="tag blue">FTTH</span></td>
              <td>Vehicle Out</td>
              <td>—</td>
              <td>WP-AB-1234</td>
            </tr>

            <tr>
              <td>10:32</td>
              <td>JA1 • Member 001</td>
              <td><span className="tag blue">FTTH</span></td>
              <td>1st Fault Attended</td>
              <td>FTTH</td>
              <td>WP-AB-1234</td>
            </tr>

            <tr>
              <td>11:05</td>
              <td>JA2 • Member 003</td>
              <td><span className="tag purple">PSTN</span></td>
              <td>Vehicle Out</td>
              <td>—</td>
              <td>WP-CD-5678</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}