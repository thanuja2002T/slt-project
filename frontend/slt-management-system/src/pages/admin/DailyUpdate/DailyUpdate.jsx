import "./ManagerDailyUpdate.css";

export default function ManagerDailyUpdate() {

  const data = [
    { id: "001", name: "A. Perera", ftthA: 3, ftthB: 3, pstnA: 2, pstnB: 2 },
    { id: "002", name: "K. Silva", ftthA: 4, ftthB: 3, pstnA: 1, pstnB: 1 },
    { id: "003", name: "M. Fernando", ftthA: 2, ftthB: 2, pstnA: 3, pstnB: 3 },
    { id: "004", name: "R. Jayawardena", ftthA: 5, ftthB: 2, pstnA: 2, pstnB: 1 },
    { id: "005", name: "S. Bandara", ftthA: 3, ftthB: 3, pstnA: 1, pstnB: 1 }
  ];

  const calc = (row) => {
    const assigned = row.ftthA + row.pstnA;
    const attended = row.ftthB + row.pstnB;
    const percent = Math.round((attended / assigned) * 100);

    let status = "Done";
    if (percent < 100 && percent >= 60) status = "Active";
    if (percent < 60) status = "Behind";

    return { percent, status };
  };

  return (
    <div className="manager-page">

      {/* HEADER */}
      <div className="header">
        <div>
          <h1>Manager Daily Update</h1>
          <p>Fault assignment and attendance tracking — 25 April 2026</p>
        </div>

        <button className="save-btn">💾 Save & Submit</button>
      </div>

      {/* FILTER BAR */}
      <div className="controls">

      {/* DATE SELECT */}
     <select className="chip-select">
        <option>25 Apr 2026</option>
        <option>26 Apr 2026</option>
      </select>

      {/* TYPE SELECT */}
    <select className="chip-select">
       <option>FTTH & PSTN</option>
       <option>FTTH Only</option>
       <option>PSTN Only</option>
    </select>


</div>

      {/* SUMMARY */}
      <div className="summary">
        <div><h2 className="green">12</h2><p>Complete</p></div>
        <div><h2 className="yellow">4</h2><p>Pending</p></div>
        <div><h2 className="blue">2</h2><p>Absent</p></div>
      </div>

      {/* TABLE */}
      <div className="card">

        <table>
          <thead>
            <tr>
              <th>Service No.</th>
              <th>Member Name</th>
              <th colSpan="2">FTTH Faults</th>
              <th colSpan="2">PSTN Faults</th>
              <th>Completion</th>
              <th>Status</th>
            </tr>
            <tr className="sub-head">
              <th></th>
              <th></th>
              <th>Assigned</th>
              <th>Attended</th>
              <th>Assigned</th>
              <th>Attended</th>
              <th></th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, i) => {
              const { percent, status } = calc(row);

              return (
                <tr key={i}>
                  <td>{row.id}</td>
                  <td>{row.name}</td>

                  <td>{row.ftthA}</td>
                  <td><span className="box green">{row.ftthB}</span></td>

                  <td>{row.pstnA}</td>
                  <td><span className="box blue">{row.pstnB}</span></td>

                  <td>
                    <div className="progress">
                      <div style={{ width: percent + "%" }}></div>
                    </div>
                    <span className="percent">{percent}%</span>
                  </td>

                  <td>
                    <span className={`status ${status.toLowerCase()}`}>
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}

            {/* TOTAL */}
            <tr className="total-row">
              <td colSpan="2">DAILY TOTALS</td>
              <td>17</td>
              <td>14</td>
              <td>9</td>
              <td>8</td>
              <td>85%</td>
              <td></td>
            </tr>

          </tbody>
        </table>
      </div>

    </div>
  );
}