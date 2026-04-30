import "./Summary.css";
import { useState } from "react";

export default function Summary() {
  const [view, setView] = useState("team");
  const [month, setMonth] = useState("Jan 2026");
  const [team, setTeam] = useState("All Teams");

  // 🔥 NEW STATE
  const [showAll, setShowAll] = useState(false);

  // 🔹 TEAM DATA
  const teamData = [
    {
      id: "JA1",
      days: Array(31).fill(100),
      avg: 100
    },
    {
      id: "JA2",
      days: [75, 90, 70, 85, 80, 75, 88, 90, 85, 70, 88, 92, 80, 75, 85, 90, 80, 78, 88, 90, 85, 87, 80, 75, 90, 88, 84, 86, 90, 85, 88],
      avg: 84
    },
    {
      id: "JA3",
      days: [60, 80, 85, 80, 100, 80, 60, 75, 82, 78, 90, 85, 88, 80, 70, 60, 75, 85, 90, 80, 70, 65, 80, 85, 90, 88, 84, 82, 78, 75, 80],
      avg: 82
    }
  ];

  // 🔹 INDIVIDUAL DATA
  const individualData = [
    {
      id: "001",
      days: Array(31).fill(100),
      avg: 100
    },
    {
      id: "002",
      days: [75, 100, 50, 100, 80, 75, 100, 90, 85, 80, 78, 82, 88, 90, 70, 75, 80, 85, 88, 90, 100, 95, 90, 85, 80, 78, 82, 84, 86, 88, 90],
      avg: 84
    },
    {
      id: "003",
      days: [60, 80, 100, 80, 100, 80, 60, 70, 75, 80, 85, 90, 95, 85, 80, 70, 60, 75, 80, 85, 90, 95, 100, 85, 80, 78, 82, 84, 86, 88, 90],
      avg: 82
    }
  ];

  const data = view === "team" ? teamData : individualData;

  const getColor = (val) => {
    if (val >= 90) return "green";
    if (val >= 70) return "yellow";
    return "red";
  };

  // 🔥 SHOW ONLY 15 OR ALL
  const visibleDays = showAll ? 31 : 15;

  return (
    <div className="summary-page">

      {/* HEADER */}
      <div className="header">
        <div>
          <h1>Summary Table</h1>
          <p>Monthly completion analysis by service number — {month}</p>
        </div>

        <button className="export-btn">⬇ Export</button>
      </div>

      {/* FILTERS */}
      <div className="filters">

        <div className="tabs">
          <button 
            className={view === "team" ? "active" : ""}
            onClick={() => setView("team")}
          >
            Team Analysis
          </button>

          <button 
            className={view === "individual" ? "active" : ""}
            onClick={() => setView("individual")}
          >
            Individual Analysis
          </button>
        </div>

        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option>Jan 2026</option>
          <option>Feb 2026</option>
        </select>

        <select value={team} onChange={(e) => setTeam(e.target.value)}>
          <option>All Teams</option>
          <option>JA1</option>
          <option>JA2</option>
        </select>

      </div>

      {/* STATS */}
      <div className="stats">

        <div className="stat-card green">
          <p>MONTHLY AVG</p>
          <h2>87%</h2>
          <span>Completion rate</span>
        </div>

        <div className="stat-card blue">
          <p>TOTAL FAULTS</p>
          <h2>1,284</h2>
          <span>Assigned this month</span>
        </div>

        <div className="stat-card orange">
          <p>ATTENDED</p>
          <h2>1,117</h2>
          <span>87% completion</span>
        </div>

        <div className="stat-card purple">
          <p>BEST TEAM</p>
          <h2>JA1</h2>
          <span>100% completion</span>
        </div>

      </div>

      {/* TABLE */}
      <div className="card">

        <table>
          <thead>
            <tr>
              <th>{view === "team" ? "Team" : "Service No."}</th>

              {[...Array(visibleDays)].map((_, i) => (
                <th key={i}>
                  {(i + 1).toString().padStart(2, "0")}/01
                </th>
              ))}

              <th>Monthly Avg</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td>{row.id}</td>

                {row.days.slice(0, visibleDays).map((d, index) => (
                  <td key={index}>
                    <span className={`pill ${getColor(d)}`}>
                      {d}%
                    </span>
                  </td>
                ))}

                <td>
                  <span className={`pill ${getColor(row.avg)}`}>
                    {row.avg}%
                  </span>
                </td>
              </tr>
            ))}

            {/* AVG ROW */}
            <tr className="avg-row">
              <td>AVERAGE</td>
              <td colSpan={visibleDays}></td>
              <td>87%</td>
            </tr>

          </tbody>
        </table>

        <div className="load-more">
      <button onClick={() => setShowAll(!showAll)}>
         {showAll ? "← Show Less (First 15 Days)" : "Show Remaining Days →"}
       </button>
     </div>

      </div>

    </div>
  );
}