import "./Summary.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../../lib/supabase.js";

export default function Summary() {
  const [view, setView] = useState("team");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("All Teams");

  const [months, setMonths] = useState([]);
  const [teamsList, setTeamsList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [stats, setStats] = useState({
    monthlyAvg: 0,
    totalFaults: 0,
    attended: 0,
    bestLabel: "—",
    bestPercent: 0,
  });

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const DAYS_PER_PAGE = 15;

  const mountedRef = useRef(false);

  // ─────────────────────────────────────────
  // TIME UTILITIES
  // ─────────────────────────────────────────

  const toSLTMonthLabel = (utcString) => {
    if (!utcString) return "";
    return new Date(utcString).toLocaleDateString("en-GB", {
      timeZone: "Asia/Colombo",
      month: "long",
      year: "numeric",
    });
  };

  const toSLTDateKey = (utcString) => {
    if (!utcString) return "";
    return new Date(utcString).toLocaleDateString("en-GB", {
      timeZone: "Asia/Colombo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getMemberName = (members) => {
    if (Array.isArray(members)) return members[0] ?? "";
    return members ?? "";
  };

  const getDaysOfMonth = (monthLabel) => {
    if (!monthLabel) return [];
    const [monthName, year] = monthLabel.split(" ");
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
    const yearNum = parseInt(year);
    const daysCount = new Date(yearNum, monthIndex + 1, 0).getDate();
    const days = [];
    for (let d = 1; d <= daysCount; d++) {
      const date = new Date(yearNum, monthIndex, d);
      days.push(
        date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      );
    }
    return days;
  };

  const buildAssignedMap = (fcData, dfData) => {
    const map = {};
    dfData.forEach((df) => {
      const key = `${df.member}__${toSLTDateKey(df.created_at)}`;
      map[key] = df.total_assigned;
    });
    fcData.forEach((fc) => {
      const key = `${fc.member}__${toSLTDateKey(fc.created_at)}`;
      if (fc.assigned != null) map[key] = fc.assigned;
    });
    return map;
  };

  // ─────────────────────────────────────────
  // COMPUTE STATS — declared BEFORE fetchData
  // ─────────────────────────────────────────

  const computeStats = (rows) => {
    if (rows.length === 0) {
      setStats({
        monthlyAvg: 0,
        totalFaults: 0,
        attended: 0,
        bestLabel: "—",
        bestPercent: 0,
      });
      return;
    }
    const totalAssigned = rows.reduce((s, r) => s + r.totalAssigned, 0);
    const totalFinished = rows.reduce((s, r) => s + r.totalFinished, 0);
    const monthlyAvg =
      totalAssigned > 0
        ? Math.round((totalFinished / totalAssigned) * 100)
        : 0;
    const best = rows.reduce((a, b) => (a.avg >= b.avg ? a : b));
    setStats({
      monthlyAvg,
      totalFaults: totalAssigned,
      attended: totalFinished,
      bestLabel: best.id,
      bestPercent: best.avg,
    });
  };

  // ─────────────────────────────────────────
  // FETCH: DROPDOWNS
  // ─────────────────────────────────────────

  const fetchDropdowns = async () => {
    const { data: fwData, error: fwError } = await supabase
      .from("field_work")
      .select("created_at")
      .order("created_at");

    if (!fwError) {
      const seen = new Set();
      const uniqueMonths = [];
      fwData.forEach((row) => {
        const label = toSLTMonthLabel(row.created_at);
        if (!seen.has(label)) {
          seen.add(label);
          uniqueMonths.push(label);
        }
      });
      setMonths(uniqueMonths);
      if (uniqueMonths.length > 0) {
        return uniqueMonths[uniqueMonths.length - 1];
      }
    }
    return "";
  };

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from("daily_faults")
      .select("team");
    if (!error) {
      const unique = [
        ...new Set(data.map((d) => d.team).filter(Boolean)),
      ].sort();
      setTeamsList(unique);
    }
  };

  // ─────────────────────────────────────────
  // FETCH: MAIN TABLE DATA
  // ─────────────────────────────────────────

  const fetchData = useCallback(
    async (month, viewType, teamFilter) => {
      if (!month) return;
      setLoading(true);
      setPage(0); // reset to first page on any filter change

      const days = getDaysOfMonth(month);
      setDaysInMonth(days);

      const { data: fwData, error: fwError } = await supabase
        .from("field_work")
        .select("members, team_name, faults_time, created_at")
        .order("created_at");

      if (fwError) {
        console.error("fetchData field_work error:", fwError.message);
        setLoading(false);
        return;
      }

      const filtered = fwData.filter(
        (row) => toSLTMonthLabel(row.created_at) === month
      );

      const { data: dfData, error: dfError } = await supabase
        .from("daily_faults")
        .select("team, member, total_assigned, created_at");

      if (dfError) {
        console.error("fetchData daily_faults error:", dfError.message);
        setLoading(false);
        return;
      }

      const { data: fcData } = await supabase
        .from("fault_count")
        .select("member, assigned, created_at");

      const assignedMap = buildAssignedMap(fcData ?? [], dfData ?? []);

      // ── TEAM VIEW ──
      if (viewType === "team") {
        const teamDayMap = {};

        filtered.forEach((row) => {
          const team = row.team_name ?? "Unknown";
          if (teamFilter !== "All Teams" && team !== teamFilter) return;

          const memberName = getMemberName(row.members);
          const dateKey = toSLTDateKey(row.created_at);
          const finished = Array.isArray(row.faults_time)
            ? row.faults_time.length
            : 0;
          const assigned =
            assignedMap[`${memberName}__${dateKey}`] ?? 0;

          if (!teamDayMap[team]) teamDayMap[team] = {};
          if (!teamDayMap[team][dateKey]) {
            teamDayMap[team][dateKey] = { finished: 0, assigned: 0 };
          }
          teamDayMap[team][dateKey].finished += finished;
          teamDayMap[team][dateKey].assigned += assigned;
        });

        const rows = Object.keys(teamDayMap)
          .sort()
          .map((team) => {
            const dayPercents = days.map((day) => {
              const d = teamDayMap[team][day];
              if (!d || d.assigned === 0) return null;
              return Math.round((d.finished / d.assigned) * 100);
            });
            const validDays = dayPercents.filter((p) => p !== null);
            const avg =
              validDays.length > 0
                ? Math.round(
                    validDays.reduce((a, b) => a + b, 0) / validDays.length
                  )
                : 0;
            const totalAssigned = Object.values(teamDayMap[team]).reduce(
              (s, d) => s + d.assigned, 0
            );
            const totalFinished = Object.values(teamDayMap[team]).reduce(
              (s, d) => s + d.finished, 0
            );
            return { id: team, dayPercents, avg, totalAssigned, totalFinished };
          });

        setTableData(rows);
        computeStats(rows);

      // ── INDIVIDUAL VIEW ──
      } else {
        const memberDayMap = {};

        filtered.forEach((row) => {
          const memberName = getMemberName(row.members);
          const team = row.team_name ?? "";
          if (teamFilter !== "All Teams" && team !== teamFilter) return;

          const dateKey = toSLTDateKey(row.created_at);
          const finished = Array.isArray(row.faults_time)
            ? row.faults_time.length
            : 0;
          const assigned =
            assignedMap[`${memberName}__${dateKey}`] ?? 0;

          if (!memberDayMap[memberName]) memberDayMap[memberName] = {};
          if (!memberDayMap[memberName][dateKey]) {
            memberDayMap[memberName][dateKey] = { finished: 0, assigned: 0 };
          }
          memberDayMap[memberName][dateKey].finished += finished;
          memberDayMap[memberName][dateKey].assigned += assigned;
        });

        const rows = Object.keys(memberDayMap)
          .sort()
          .map((member) => {
            const dayPercents = days.map((day) => {
              const d = memberDayMap[member][day];
              if (!d || d.assigned === 0) return null;
              return Math.round((d.finished / d.assigned) * 100);
            });
            const validDays = dayPercents.filter((p) => p !== null);
            const avg =
              validDays.length > 0
                ? Math.round(
                    validDays.reduce((a, b) => a + b, 0) / validDays.length
                  )
                : 0;
            const totalAssigned = Object.values(
              memberDayMap[member]
            ).reduce((s, d) => s + d.assigned, 0);
            const totalFinished = Object.values(
              memberDayMap[member]
            ).reduce((s, d) => s + d.finished, 0);
            return {
              id: member,
              dayPercents,
              avg,
              totalAssigned,
              totalFinished,
            };
          });

        setTableData(rows);
        computeStats(rows);
      }

      setLoading(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ─────────────────────────────────────────
  // MOUNT
  // ─────────────────────────────────────────

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const init = async () => {
      fetchTeams();
      const latestMonth = await fetchDropdowns();
      if (latestMonth) {
        setSelectedMonth(latestMonth);
        fetchData(latestMonth, "team", "All Teams");
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────

  const handleViewChange = (v) => {
    setView(v);
    setPage(0);
    fetchData(selectedMonth, v, selectedTeam);
  };

  const handleMonthChange = (e) => {
    const m = e.target.value;
    setSelectedMonth(m);
    setPage(0);
    fetchData(m, view, selectedTeam);
  };

  const handleTeamChange = (e) => {
    const t = e.target.value;
    setSelectedTeam(t);
    setPage(0);
    fetchData(selectedMonth, view, t);
  };

  // ─────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────

  const getColor = (val) => {
    if (val === null) return "empty";
    if (val >= 90) return "green";
    if (val >= 70) return "yellow";
    return "red";
  };

  // ── Paginated days — no horizontal scroll ──
  const startDay = page * DAYS_PER_PAGE;
  const endDay = Math.min(startDay + DAYS_PER_PAGE, daysInMonth.length);
  const visibleDaySlice = daysInMonth.slice(startDay, endDay);
  const totalPages = Math.ceil(daysInMonth.length / DAYS_PER_PAGE);

  const getDayAvg = (dayIndex) => {
    const actualIndex = startDay + dayIndex;
    const vals = tableData
      .map((r) => r.dayPercents[actualIndex])
      .filter((v) => v !== null);
    if (vals.length === 0) return null;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  };

  // ─────────────────────────────────────────
  // JSX
  // ─────────────────────────────────────────

  return (
    <div className="summary-page">

      {/* HEADER */}
      <div className="header">
        <div>
          <h1>Summary Table</h1>
          <p>Monthly completion analysis — {selectedMonth}</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filters">
        <div className="tabs">
          <button
            className={view === "team" ? "active" : ""}
            onClick={() => handleViewChange("team")}
          >
            Team Analysis
          </button>
          <button
            className={view === "individual" ? "active" : ""}
            onClick={() => handleViewChange("individual")}
          >
            Individual Analysis
          </button>
        </div>

        <select value={selectedMonth} onChange={handleMonthChange}>
          {months.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>

        <select value={selectedTeam} onChange={handleTeamChange}>
          <option>All Teams</option>
          {teamsList.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* STATS */}
      <div className="stats">
        <div className="stat-card green">
          <p>MONTHLY AVG</p>
          <h2>{stats.monthlyAvg}%</h2>
          <span>Completion rate</span>
        </div>
        <div className="stat-card blue">
          <p>TOTAL FAULTS</p>
          <h2>{stats.totalFaults.toLocaleString()}</h2>
          <span>Assigned this month</span>
        </div>
        <div className="stat-card orange">
          <p>ATTENDED</p>
          <h2>{stats.attended.toLocaleString()}</h2>
          <span>{stats.monthlyAvg}% completion</span>
        </div>
        <div className="stat-card purple">
          <p>{view === "team" ? "BEST TEAM" : "BEST MEMBER"}</p>
          <h2>{stats.bestLabel}</h2>
          <span>{stats.bestPercent}% completion</span>
        </div>
      </div>

      {/* TABLE */}
<div className="card">

  {loading ? (

    <div className="loading-state">
      Loading...
    </div>

  ) : (

    <div className="table-scroll-wrap">
          <table>
            <thead>
              <tr>
                <th>{view === "team" ? "Team" : "Member"}</th>
                {visibleDaySlice.map((day, i) => (
                  <th key={i}>{day.slice(0, 5)}</th>
                ))}
                <th>Avg</th>
              </tr>
            </thead>

            <tbody>
              {tableData.map((row, i) => (
                <tr key={i}>
                  <td>{row.id}</td>
                  {visibleDaySlice.map((_, idx) => {
                    const actualIdx = startDay + idx;
                    const d = row.dayPercents[actualIdx];
                    return (
                      <td key={idx}>
                        {d !== null ? (
                          <span className={`pill ${getColor(d)}`}>{d}%</span>
                        ) : (
                          <span className="pill empty">—</span>
                        )}
                      </td>
                    );
                  })}
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
                {visibleDaySlice.map((_, i) => {
                  const avg = getDayAvg(i);
                  return (
                    <td key={i}>
                      {avg !== null ? (
                        <span className={`pill ${getColor(avg)}`}>{avg}%</span>
                      ) : (
                        <span className="pill empty">—</span>
                      )}
                    </td>
                  );
                })}
                <td>
                  <span className={`pill ${getColor(stats.monthlyAvg)}`}>
                    {stats.monthlyAvg}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        )}

        {/* PAGINATION — no scroll, page 1 / page 2 */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className={page === 0 ? "active" : ""}
              onClick={() => setPage(0)}
            >
              Days 1–15
            </button>
            {Array.from({ length: totalPages - 1 }, (_, i) => {
              const p = i + 1;
              const from = p * DAYS_PER_PAGE + 1;
              const to = Math.min((p + 1) * DAYS_PER_PAGE, daysInMonth.length);
              return (
                <button
                  key={p}
                  className={page === p ? "active" : ""}
                  onClick={() => setPage(p)}
                >
                  Days {from}–{to}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}