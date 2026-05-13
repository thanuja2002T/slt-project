import { useState } from "react";
import "./FaultAnalysis.css";

export default function Analysis() {
  const [activeTab, setActiveTab] = useState("overall");
  const [selectedMonth, setSelectedMonth] = useState("May 2026");

  const months = [
    "January 2026",
    "February 2026",
    "March 2026",
    "April 2026",
    "May 2026",
  ];

  // OVERALL DETAILS TABLE
  const overallDetails = [
    {
      date: "2026/01/01",
      day: "Thursday",
      in: "07:52",
      out: "18:15",
      vehicle: "GD 3705",
      vehicleOut: "9:05",
      firstFault: "12:28",
      lastFault: "17:24",
      summary: "10/8",
      percent: "80%",
      outToFirst: "1h 30m",
      lastToIn: "1h 32m",
      avgFault: "1h 28m",
      maxFault: "2h 10m",
    },

    {
      date: "2026/01/02",
      day: "Friday",
      in: "07:52",
      out: "19:02",
      vehicle: "GD 3705",
      vehicleOut: "9:10",
      firstFault: "12:24",
      lastFault: "16:46",
      summary: "6/6",
      percent: "100%",
      outToFirst: "1h 20m",
      lastToIn: "1h 25m",
      avgFault: "1h 22m",
      maxFault: "1h 55m",
    },

    {
      date: "2026/01/03",
      day: "Saturday",
      in: "08:30",
      out: "18:00",
      vehicle: "GD 3710",
      vehicleOut: "9:00",
      firstFault: "11:50",
      lastFault: "17:10",
      summary: "8/8",
      percent: "100%",
      outToFirst: "1h 10m",
      lastToIn: "1h 20m",
      avgFault: "1h 15m",
      maxFault: "1h 48m",
    },
  ];

  // DAILY FAULT ANALYSIS
  const dailyTeams = [
    {
      team: "JA1",
      rows: [
        {
          date: "12/5/2026",
          member: "Tharsan",
          entries: [
            { time: "9.15", value: "6/0" },
            { time: "10.26", value: "4/1" },
            { time: "11.29", value: "4/1" },
            { time: "12.29", value: "3/1" },
            { time: "1.31", value: "4/1" },
            { time: "2.51", value: "5/1" },
            { time: "3.53", value: "6/2" },
            { time: "4.51", value: "6/3" },
            { time: "5.53", value: "6/6" },
          ],
          summary: "6/6",
        },
      ],
    },

    {
      team: "JA2",
      rows: [
        {
          date: "12/5/2026",
          member: "Sathees",
          entries: [
            { time: "9.37", value: "3/0" },
            { time: "10.37", value: "6/0" },
            { time: "12.09", value: "6/2" },
            { time: "1.37", value: "7/3" },
            { time: "2.59", value: "7/3" },
            { time: "3.59", value: "8/4" },
          ],
          summary: "8/7",
        },
      ],
    },

    {
      team: "JA3",
      rows: [],
    },

    {
      team: "JA4",
      rows: [
        {
          date: "12/5/2026",
          member: "Puvinath",
          entries: [
            { time: "9.31", value: "2/0" },
            { time: "10.36", value: "2/0" },
            { time: "11.35", value: "6/1" },
            { time: "12.39", value: "5/3" },
            { time: "1.21", value: "5/3" },
            { time: "2.54", value: "6/4" },
            { time: "3.56", value: "7/5" },
          ],
          summary: "7/7",
        },
      ],
    },
  ];

  const getPercent = (summary) => {
    const [assigned, attended] = summary.split("/").map(Number);

    if (!assigned) return 0;

    return Math.round((attended / assigned) * 100);
  };

  const getColorClass = (percent) => {
    if (percent >= 100) return "green";
    if (percent >= 70) return "yellow";
    return "red";
  };

  return (
    <div className="analysis-page">

      {/* HEADER */}
      <div className="analysis-header">
        <h1>Fault Analysis</h1>
        <p>Daily Detailed Report</p>
      </div>

      {/* TABS */}
      <div className="analysis-tabs">
        <button
          className={activeTab === "overall" ? "active" : ""}
          onClick={() => setActiveTab("overall")}
        >
          Overall Detail
        </button>

        <button
          className={activeTab === "daily" ? "active" : ""}
          onClick={() => setActiveTab("daily")}
        >
          Daily Fault Analysis
        </button>
      </div>

      {/* OVERALL DETAIL */}
      {activeTab === "overall" && (
        <>
          <div className="top-filters">

  {/* MONTH SELECT */}
  <select
    value={selectedMonth}
    onChange={(e) => setSelectedMonth(e.target.value)}
  >

    <option>January 2026</option>
    <option>February 2026</option>
    <option>March 2026</option>
    <option>April 2026</option>
    <option>May 2026</option>
    <option>June 2026</option>
    <option>July 2026</option>
    <option>August 2026</option>
    <option>September 2026</option>
    <option>October 2026</option>
    <option>November 2026</option>
    <option>December 2026</option>

  </select>

  {/* MEMBER SELECT */}
  <select>

    <option>All Members</option>

    <option>Tharsan</option>
    <option>M.Jana</option>
    <option>Johnson</option>
    <option>S.Ramesh</option>
    <option>Puvinath</option>
    <option>Kokilaraman</option>
    <option>Anpalagan</option>
    <option>Thiva</option>
    <option>Muruka</option>
    <option>Sathees</option>
    <option>Nanthan</option>
    <option>M.Suresh</option>
    <option>Sivaratnam</option>
    <option>Vikke</option>
    <option>T.Sansu</option>
    <option>Anutharsan</option>
    <option>Rajasimman</option>
    <option>S.Vikna</option>
    <option>Paventhan</option>
    <option>Srikanth</option>
    <option>Jeyaraman</option>
    <option>Ajanthan</option>
    <option>Sasi</option>
    <option>Mathavan</option>
    <option>Rathees</option>
    <option>Naren</option>
    <option>T.Suresh</option>
    <option>Niranjan</option>
    <option>Kavi</option>
    <option>Pakeer</option>

  </select>

</div>

          <div className="analysis-card">

            <h2>
              FAULT ANALYSIS BY SERVICE NUMBER (Every Works)
            </h2>

            <div className="table-container">

              <table>

                <thead>
                  <tr>
                    <th>DATE</th>
                    <th>DAY</th>
                    <th>IN</th>
                    <th>OUT</th>
                    <th>VEHICLE</th>
                    <th>VEHICLE OUT</th>
                    <th>1ST FAULT</th>
                    <th>LAST FAULT</th>
                    <th>SUMMARY</th>
                    <th>%</th>
                    <th>OUT → 1ST</th>
                    <th>LAST → IN</th>
                    <th>AVG/FAULT</th>
                    <th>MAXIMUM TIME TAKEN FOR A FAULT</th>
                  </tr>
                </thead>

                <tbody>

                  {overallDetails.map((item, index) => (
                    <tr key={index}>
                      <td>{item.date}</td>
                      <td>{item.day}</td>
                      <td>{item.in}</td>
                      <td>{item.out}</td>
                      <td>{item.vehicle}</td>
                      <td>{item.vehicleOut}</td>
                      <td>{item.firstFault}</td>
                      <td>{item.lastFault}</td>
                      <td>{item.summary}</td>

                      <td className={getColorClass(
                        parseInt(item.percent)
                      )}>
                        {item.percent}
                      </td>

                      <td className="yellow_vf">
                        {item.outToFirst}
                      </td>

                      <td className="orange_vf">
                        {item.lastToIn}
                      </td>

                      <td className="pink_vf">
                        {item.avgFault}
                      </td>

                      <td className="max_fault">
                        {item.maxFault}
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>

            </div>
          </div>
        </>
      )}

      {/* DAILY ANALYSIS */}
      {activeTab === "daily" && (
        <>
          <div className="top-filters">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map((month) => (
                <option key={month}>{month}</option>
              ))}
            </select>
          </div>

          <div className="daily-analysis-grid">

            {dailyTeams.map((team, teamIndex) => (
              <div className="daily-team-card" key={teamIndex}>

                <div className="team-header">
                  {team.team}
                </div>

                <div className="table-scroll">

                  <table className="daily-team-table">

                    <thead>
                      <tr>
                        <th>DATE</th>
                        <th>TEAM</th>
                        <th>TIME</th>
                        <th>ULT/ATT</th>
                        <th>SUMMARY</th>
                        <th>COMPLETION %</th>
                      </tr>
                    </thead>

                    <tbody>

                      {team.rows.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="empty-cell"
                          >
                            No Data
                          </td>
                        </tr>
                      ) : (
                        team.rows.map((group, groupIndex) => {

                          const percent = getPercent(group.summary);

                          return group.entries.map(
                            (entry, entryIndex) => (
                              <tr key={`${groupIndex}-${entryIndex}`}>

                                {/* DATE */}
                                {entryIndex === 0 && (
                                  <td
                                    rowSpan={group.entries.length}
                                  >
                                    {group.date}
                                  </td>
                                )}

                                {/* MEMBER */}
                                {entryIndex === 0 && (
                                  <td
                                    rowSpan={group.entries.length}
                                  >
                                    {group.member}
                                  </td>
                                )}

                                {/* TIME */}
                                <td>{entry.time}</td>

                                {/* ULT/ATT */}
                                <td>{entry.value}</td>

                                {/* SUMMARY */}
                                {entryIndex ===
                                  group.entries.length - 1 && (
                                  <td
                                    rowSpan="1"
                                    className="summary-cell"
                                  >
                                    {group.summary}
                                  </td>
                                )}

                                {/* COMPLETION */}
                                {entryIndex ===
                                  group.entries.length - 1 && (
                                  <td
                                    className={
                                      getColorClass(percent)
                                    }
                                  >
                                    {percent}%
                                  </td>
                                )}

                              </tr>
                            )
                          );
                        })
                      )}

                    </tbody>

                  </table>
                </div>
              </div>
            ))}

          </div>
        </>
      )}
    </div>
  );
}