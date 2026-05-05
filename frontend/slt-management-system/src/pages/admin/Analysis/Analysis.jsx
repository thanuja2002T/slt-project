import "./FaultAnalysis.css";

export default function FaultAnalysis() {

  const data = [
    {
      service: "16855",
      date: "2026/01/01",
      day: "Thursday",
      inTime: "07:52",
      outTime: "18:15",
      vehicleNo: "GD 3705",
      vehicleOut: "9:05",
      firstFault: "12:28",
      lastFault: "17:24",
      summary: "10/8",
      percentage: "80%",
    },
    {
      service: "16855",
      date: "2026/01/02",
      day: "Friday",
      inTime: "07:52",
      outTime: "19:02",
      vehicleNo: "GD 3705",
      vehicleOut: "9:10",
      firstFault: "12:24",
      lastFault: "16:46",
      summary: "6/6",
      percentage: "100%",
    },
    {
      service: "16855",
      date: "2026/01/01",
      day: "Thursday",
      inTime: "07:52",
      outTime: "18:15",
      vehicleNo: "GD 3705",
      vehicleOut: "9:05",
      firstFault: "12:28",
      lastFault: "17:24",
      summary: "10/8",
      percentage: "80%",
    },
    {
      service: "16855",
      date: "2026/01/02",
      day: "Friday",
      inTime: "07:52",
      outTime: "19:02",
      vehicleNo: "GD 3705",
      vehicleOut: "9:10",
      firstFault: "12:24",
      lastFault: "16:46",
      summary: "6/6",
      percentage: "100%",
    },
    {
      service: "16855",
      date: "2026/01/01",
      day: "Thursday",
      inTime: "07:52",
      outTime: "18:15",
      vehicleNo: "GD 3705",
      vehicleOut: "9:05",
      firstFault: "12:28",
      lastFault: "17:24",
      summary: "10/8",
      percentage: "80%",
    },
    {
      service: "16855",
      date: "2026/01/02",
      day: "Friday",
      inTime: "07:52",
      outTime: "19:02",
      vehicleNo: "GD 3705",
      vehicleOut: "9:10",
      firstFault: "12:24",
      lastFault: "16:46",
      summary: "6/6",
      percentage: "100%",
    }
  ];

  return (
    <div className="analysis-page">

      <h1>Fault Analysis</h1>
      <p className="sub">Daily Detailed Report</p>

      {/* 🔥 GRID LAYOUT */}
      <div className="analysis-grid">

        {/* LEFT TABLE */}
        <div className="card">
          <h3>FAULT ANALYSIS BY SERVICE NUMBER(Every Workes )</h3>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Day</th>
                  <th>IN</th>
                  <th>OUT</th>
                  <th>Vehicle</th>
                  <th>Vehicle Out</th>
                  <th>1st Fault</th>
                  <th>Last Fault</th>
                  <th>Summary</th>
                  <th>%</th>
                </tr>
              </thead>

              <tbody>
                {data.map((row, i) => (
                  <tr key={i}>
                    <td>{row.service}</td>
                    <td>{row.date}</td>
                    <td>{row.day}</td>
                    <td>{row.inTime}</td>
                    <td>{row.outTime}</td>
                    <td>{row.vehicleNo}</td>
                    <td>{row.vehicleOut}</td>
                    <td>{row.firstFault}</td>
                    <td>{row.lastFault}</td>
                    <td>{row.summary}</td>
                    <td className={
                      row.percentage === "100%" ? "green" :
                      row.percentage < "70%" ? "red" : "yellow"
                    }>
                      {row.percentage}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🔥 RIGHT PANEL */}
        <div className="side-card">

          <h3>OVERALL FAULT DETAILS</h3>

          <div className="metric">
            <p>Vehicle Out → 1st Fault</p>
            <h2>1h 30m <span>avg</span></h2>
            <div className="bar yellow">
              <div style={{ width: "70%" }}></div>
            </div>
          </div>

          <div className="metric">
            <p>Last Fault → Vehicle In</p>
            <h2>1h 32m <span>avg</span></h2>
            <div className="bar orange">
              <div style={{ width: "75%" }}></div>
            </div>
          </div>

          <div className="metric">
            <p>Avg per fault</p>
            <h2>1h 28m <span className="good">good</span></h2>
            <div className="bar green">
              <div style={{ width: "85%" }}></div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}