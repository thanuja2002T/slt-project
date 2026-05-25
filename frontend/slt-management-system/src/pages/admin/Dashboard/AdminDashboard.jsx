import "./AdminDashboard.css";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

export default function AdminDashboard() {

  const [dashboardData, setDashboardData] =
    useState([]);

  const [avgCompletion, setAvgCompletion] =
    useState(0);

  const [totalAssigned, setTotalAssigned] =
    useState(0);

  const [totalFinished, setTotalFinished] =
    useState(0);

  const [activeTeams, setActiveTeams] =
    useState(0);

  /* =========================
     LOAD DASHBOARD
  ========================= */

  const loadDashboard = async () => {

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    const {
      data,
      error
    } = await supabase
      .from("daily_faults")
      .select("*");

    if (error) {

      console.log(error);

      return;
    }

    /* TODAY ONLY */

    const todayData =
      (data || []).filter(row => {

        const rowDate =
          new Date(row.created_at)
            .toISOString()
            .split("T")[0];

        return rowDate === today;

      });

    /* =========================
       GROUP BY TEAM + TIMESTAMP
    ========================= */

    const grouped = {};

    todayData.forEach(row => {

      const timeKey =
        new Date(row.created_at)
          .toISOString()
          .slice(0, 16);

      const key =
        `${row.team}_${timeKey}`;

      if (!grouped[key]) {

        grouped[key] = {

          team: row.team,

          members: [],

          assigned: 0,

          finished: 0
        };
      }

      grouped[key].members.push(
        row.member
      );

      grouped[key].assigned =
        row.total_assigned;

      grouped[key].finished =
        row.total_finished;

    });

    const finalData =
      Object.values(grouped);

    setDashboardData(finalData);

    /* =========================
       TOTALS
    ========================= */

    let assigned = 0;

    let finished = 0;

    finalData.forEach(item => {

      assigned +=
        Number(item.assigned || 0);

      finished +=
        Number(item.finished || 0);

    });

    setTotalAssigned(assigned);

    setTotalFinished(finished);

    /* AVG */

    const avg =
      assigned > 0
        ? Math.round(
            (finished / assigned) * 100
          )
        : 0;

    setAvgCompletion(avg);

    /* ACTIVE TEAMS */

    const uniqueTeams =
      [
        ...new Set(
          finalData.map(
            item => item.team
          )
        )
      ];

    setActiveTeams(
      uniqueTeams.length
    );
  };

  /* =========================
     USE EFFECT
  ========================= */

  useEffect(() => {

  const fetchDashboard =
    async () => {

      await loadDashboard();

    };

  fetchDashboard();

}, []);
  return (

    <div className="admin-dashboard">

      {/* HEADER */}
      <div className="header">

        <div>

          <h1>
            Admin Dashboard
          </h1>

          <p>
            Overview of all field teams today
          </p>

        </div>

      </div>

      {/* STATS */}
      <div className="Dashboard-stats">

        {/* AVG */}
        <div className="Dashboard-stat-card green">

          <h4>
            Avg Completion
          </h4>

          <h2>
            {avgCompletion}%
          </h2>

          <p>
            Today's overall completion
          </p>

        </div>

        {/* FAULTS */}
        <div className="Dashboard-stat-card orange">

          <h4>
            Faults Today
          </h4>

          <h2>
            {totalAssigned}
          </h2>

          <p>
            {totalFinished} attended •{" "}
            {totalAssigned - totalFinished} pending
          </p>

        </div>

        {/* ACTIVE */}
        <div className="Dashboard-stat-card purple">

          <h4>
            Teams Active
          </h4>

          <h2>
            {activeTeams}
          </h2>

          <p>
            Active teams today
          </p>

        </div>

      </div>

      {/* MAIN GRID */}
      <div className="main-grid">

        {/* TABLE */}
        <div className="card table-card">

          <h3>
            Team Performance Overview
          </h3>

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>Team</th>

                  <th>Members</th>

                  <th>Assigned</th>

                  <th>Attended</th>

                  <th>Completion</th>

                  <th>Status</th>

                </tr>

              </thead>

              <tbody>

                {dashboardData.map(
                  (item, index) => {

                    const percent =
                      item.assigned > 0
                        ? Math.round(
                            (
                              item.finished /
                              item.assigned
                            ) * 100
                          )
                        : 0;

                    return (

                      <tr key={index}>

                        <td>
                          {item.team}
                        </td>

                        <td>
                          {item.members.join(", ")}
                        </td>

                        <td>
                          {item.assigned}
                        </td>

                        <td>
                          {item.finished}
                        </td>

                        <td
                          className={
                            percent >= 80
                              ? "green-text"
                              : percent >= 60
                              ? "yellow-text"
                              : "red-text"
                          }
                        >

                          {percent}%

                        </td>

                        <td>

                          <span
                            className={`status ${
                              percent >= 80
                                ? "good"
                                : percent >= 60
                                ? "warn"
                                : "bad"
                            }`}
                          >

                            {percent >= 80
                              ? "On Track"
                              : percent >= 60
                              ? "Review"
                              : "Behind"}

                          </span>

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}