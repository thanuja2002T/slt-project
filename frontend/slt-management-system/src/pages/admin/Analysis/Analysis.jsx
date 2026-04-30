import "./FaultAnalysis.css";
import { useState } from "react";

export default function FaultAnalysis() {

  const [month, setMonth] = useState("Jan 2026");
  const [faultType, setFaultType] = useState("All");
  const [team, setTeam] = useState("All Teams");

  const [data, setData] = useState([
    {
      id: "001",
      team: "JA1",
      type: "FTTH",
      values: ["09:14", "01:18", "10:32", "15:45", "17:20"],
      final: "01:18"
    },
    {
      id: "001",
      team: "JA2",
      type: "PSTN",
      values: ["09:14", "01:32", "10:46", "16:10", "17:30"],
      final: "01:32"
    }
  ]);

  // 🔥 FILTER LOGIC
  const filteredData = data.filter((row) => {
    return (
      (faultType === "All" || row.type === faultType) &&
      (team === "All Teams" || row.team === team)
    );
  });

  // 🔥 CSV UPLOAD
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split("\n").slice(1);

      const parsed = rows.map((row) => {
        const cols = row.split(",");

        return {
          id: cols[0],
          team: cols[1],
          type: cols[2],
          values: cols.slice(3, 8),
          final: cols[8]
        };
      });

      setData(parsed);
    };

    reader.readAsText(file);
  };

  return (
    <div className="analysis-page">

      {/* HEADER */}
      <h1>Fault Analysis</h1>
      <p className="sub">
        Detailed time metrics per service number — {month}
      </p>

      {/* 🔥 FILTER BAR */}
      <div className="top-controls">

        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option>Jan 2026</option>
          <option>Feb 2026</option>
        </select>

        <select value={faultType} onChange={(e) => setFaultType(e.target.value)}>
          <option>All</option>
          <option>FTTH</option>
          <option>PSTN</option>
        </select>

        <select value={team} onChange={(e) => setTeam(e.target.value)}>
          <option>All Teams</option>
          <option>JA1</option>
          <option>JA2</option>
        </select>

        <label className="upload-btn">
          Upload CSV
          <input type="file" accept=".csv" hidden onChange={handleCSVUpload} />
        </label>

      </div>

      {/* 🔥 GRID */}
      <div className="analysis-grid">

        {/* TABLE */}
        <div className="card">
          <h3>FAULT ANALYSIS BY SERVICE NUMBER</h3>

          <table>
            <thead>
              <tr>
                <th>Service No</th>
                <th>Fault Type</th>
                <th>Out</th>
                <th>1st</th>
                <th>Attend</th>
                <th>Last</th>
                <th>In</th>
                <th>Final</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((row, i) => (
                <tr key={i}>
                  <td>{row.id}</td>

                  <td>
                    <span className={`tag ${row.type === "FTTH" ? "blue" : "purple"}`}>
                      {row.type}
                    </span>
                  </td>

                  {row.values.map((v, index) => (
                    <td key={index}>{v}</td>
                  ))}

                  <td className="green">{row.final}</td>
                </tr>
              ))}

              {/* AVG */}
              <tr className="avg-row">
                <td colSpan="2">MONTHLY AVERAGE</td>
                <td>09:05</td>
                <td>01:30</td>
                <td>10:35</td>
                <td>15:40</td>
                <td>17:10</td>
                <td>01:28</td>
              </tr>

            </tbody>
          </table>
        </div>

        {/* RIGHT PANEL */}
        <div className="side-card">

          <h3>OVERALL FAULT DETAILS</h3>

          <div className="metric">
            <p>Vehicle Out → 1st Fault</p>
            <h2>1h 30m <span>avg</span></h2>
            <div className="bar yellow"><div style={{ width: "70%" }} /></div>
          </div>

          <div className="metric">
            <p>Last Fault → Vehicle In</p>
            <h2>1h 32m <span>avg</span></h2>
            <div className="bar orange"><div style={{ width: "75%" }} /></div>
          </div>

          <div className="metric">
            <p>Avg per fault</p>
            <h2>1h 28m <span className="good">good</span></h2>
            <div className="bar green"><div style={{ width: "85%" }} /></div>
          </div>

        </div>

      </div>
    </div>
  );
}
/*
service,type,out,first,attend,last,in,final
001,FTTH,09:14,01:18,10:32,15:45,17:20,01:18
002,PSTN,09:00,01:48,10:48,16:30,18:00,01:48
*/