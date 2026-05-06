import "./FaultAnalysis.css";

export default function FaultAnalysis() {

  const data = [
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
    vToFirst: "1h 30m",
    lastToIn: "1h 32m",
    avg: "1h 28m"
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
    vToFirst: "1h 20m",
    lastToIn: "1h 25m",
    avg: "1h 22m"
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
    vToFirst: "1h 10m",
    lastToIn: "1h 20m",
    avg: "1h 15m"
  },
  {
    date: "2026/01/04",
    day: "Sunday",
    in: "08:10",
    out: "17:45",
    vehicle: "GD 3712",
    vehicleOut: "8:55",
    firstFault: "11:30",
    lastFault: "16:50",
    summary: "7/5",
    percent: "71%",
    vToFirst: "1h 25m",
    lastToIn: "1h 15m",
    avg: "1h 20m"
  },
  {
    date: "2026/01/05",
    day: "Monday",
    in: "07:45",
    out: "19:10",
    vehicle: "GD 3715",
    vehicleOut: "8:40",
    firstFault: "13:00",
    lastFault: "18:05",
    summary: "12/9",
    percent: "75%",
    vToFirst: "1h 40m",
    lastToIn: "1h 30m",
    avg: "1h 35m"
  },
  {
    date: "2026/01/06",
    day: "Tuesday",
    in: "07:50",
    out: "19:20",
    vehicle: "GD 3720",
    vehicleOut: "9:15",
    firstFault: "13:45",
    lastFault: "18:30",
    summary: "9/9",
    percent: "100%",
    vToFirst: "1h 35m",
    lastToIn: "1h 25m",
    avg: "1h 30m"
  },
  {
    date: "2026/01/07",
    day: "Wednesday",
    in: "07:40",
    out: "18:25",
    vehicle: "GD 3722",
    vehicleOut: "9:00",
    firstFault: "10:40",
    lastFault: "17:32",
    summary: "16/10",
    percent: "62%",
    vToFirst: "1h 10m",
    lastToIn: "1h 45m",
    avg: "1h 30m"
  },
  {
    date: "2026/01/08",
    day: "Thursday",
    in: "07:55",
    out: "19:05",
    vehicle: "GD 3725",
    vehicleOut: "8:50",
    firstFault: "12:10",
    lastFault: "18:20",
    summary: "10/6",
    percent: "60%",
    vToFirst: "1h 25m",
    lastToIn: "1h 35m",
    avg: "1h 30m"
  },
  {
    date: "2026/01/09",
    day: "Friday",
    in: "07:53",
    out: "19:16",
    vehicle: "GD 3730",
    vehicleOut: "9:05",
    firstFault: "10:22",
    lastFault: "16:54",
    summary: "10/6",
    percent: "60%",
    vToFirst: "1h 15m",
    lastToIn: "1h 20m",
    avg: "1h 18m"
  },
  {
    date: "2026/01/10",
    day: "Saturday",
    in: "08:42",
    out: "18:06",
    vehicle: "GD 3735",
    vehicleOut: "9:05",
    firstFault: "10:33",
    lastFault: "17:17",
    summary: "16/16",
    percent: "100%",
    vToFirst: "1h 10m",
    lastToIn: "1h 25m",
    avg: "1h 18m"
  }
];

  return (
    <div className="analysis-page">

      <h1>Fault Analysis</h1>
      <p className="sub">Daily Detailed Report</p>

      <div className="card">

        <h3>FAULT ANALYSIS BY SERVICE NUMBER (Every Works)</h3>

        <div className="table-container">
          <table>
            <thead>
              <tr>
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

                {/* 🔥 NEW COLUMNS */}
                <th>Out → 1st</th>
                <th>Last → In</th>
                <th>Avg/Fault</th>
              </tr>
            </thead>

            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  <td>{row.date}</td>
                  <td>{row.day}</td>
                  <td>{row.in}</td>
                  <td>{row.out}</td>
                  <td>{row.vehicle}</td>
                  <td>{row.vehicleOut}</td>
                  <td>{row.firstFault}</td>
                  <td>{row.lastFault}</td>
                  <td>{row.summary}</td>

                  
                  
                  <td className={
                    row.percent === "100%" ? "green" :
                    row.percent < "70%" ? "red" : "lightred"
                  }>
                    {row.percent}
                  </td>

                  {/* 🔥 NEW DATA */}
                  <td className="yellow_vf">{row.vToFirst}</td>
                  <td className="orange_vf">{row.lastToIn}</td>
                  <td className="pink_vf">{row.avg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}