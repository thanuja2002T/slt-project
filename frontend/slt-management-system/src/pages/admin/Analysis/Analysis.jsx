import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../../lib/supabase.js";
import "./FaultAnalysis.css";

export default function Analysis() {
  const [activeTab, setActiveTab] = useState("overall");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedMember, setSelectedMember] = useState("All Members");

  const [overallDetails, setOverallDetails] = useState([]);
  const [dailyTeams, setDailyTeams] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [months, setMonths] = useState([]);
  const [membersList, setMembersList] = useState([]);
  const [loading, setLoading] = useState(false);

  const mountedRef = useRef(false);

  // ─────────────────────────────────────────
  // TIME UTILITIES
  // ─────────────────────────────────────────

  const toSLT = (utcString) => {
    if (!utcString) return "—";
    return new Date(utcString).toLocaleTimeString("en-GB", {
      timeZone: "Asia/Colombo",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toSLTDate = (utcString) => {
    if (!utcString) return "—";
    return new Date(utcString).toLocaleDateString("en-GB", {
      timeZone: "Asia/Colombo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const toSLTDay = (utcString) => {
    if (!utcString) return "—";
    return new Date(utcString).toLocaleDateString("en-GB", {
      timeZone: "Asia/Colombo",
      weekday: "long",
    });
  };

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

  const diffFormatted = (utcStart, utcEnd) => {
    if (!utcStart || !utcEnd) return "—";
    const diffMs = new Date(utcEnd) - new Date(utcStart);
    if (diffMs < 0) return "—";
    const totalMins = Math.round(diffMs / 60000);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const minsToFormatted = (totalMins) => {
    if (!totalMins || totalMins <= 0) return "—";
    const h = Math.floor(totalMins / 60);
    const m = Math.round(totalMins % 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const getMemberName = (members) => {
    if (Array.isArray(members)) return members[0] ?? "";
    return members ?? "";
  };

  // ─────────────────────────────────────────
  // HELPER: build assigned lookup map
  // Priority: fault_count.assigned → daily_faults.total_assigned
  // ─────────────────────────────────────────

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
  // FETCH: OVERALL DETAIL
  // ─────────────────────────────────────────

  const fetchOverallData = useCallback(async (month, member) => {
    if (!month) return;
    setLoading(true);

    const { data: fwData, error: fwError } = await supabase
      .from("field_work")
      .select(
        "id, vehicle, members, team_name, vehicle_out_time, vehicle_in_time, faults_time, created_at"
      )
      .order("created_at");

    if (fwError) {
      console.error("fetchOverallData field_work error:", fwError.message);
      setLoading(false);
      return;
    }

    let filtered = fwData.filter(
      (row) => toSLTMonthLabel(row.created_at) === month
    );

    if (member !== "All Members") {
      filtered = filtered.filter(
        (row) => getMemberName(row.members) === member
      );
    }

    if (filtered.length === 0) {
      setOverallDetails([]);
      setLoading(false);
      return;
    }

    const memberNames = [
      ...new Set(filtered.map((r) => getMemberName(r.members))),
    ];

    const { data: dfData, error: dfError } = await supabase
      .from("daily_faults")
      .select("member, total_assigned, created_at")
      .in("member", memberNames);

    if (dfError) {
      console.error("fetchOverallData daily_faults error:", dfError.message);
      setLoading(false);
      return;
    }

    const { data: fcData, error: fcError } = await supabase
      .from("fault_count")
      .select("member, assigned, created_at")
      .in("member", memberNames);

    const fcRows = fcError ? [] : (fcData ?? []);
    const assignedMap = buildAssignedMap(fcRows, dfData ?? []);

    const rows = filtered.map((row) => {
      const memberName = getMemberName(row.members);
      const teamName = row.team_name ?? "—";
      const dateKey = toSLTDateKey(row.created_at);
      const assigned = assignedMap[`${memberName}__${dateKey}`] ?? 0;

      const faults = Array.isArray(row.faults_time) ? row.faults_time : [];
      const finished = faults.length;
      const sortedFaults = [...faults].sort(
        (a, b) => new Date(a.completed_time) - new Date(b.completed_time)
      );

      const firstFaultUTC = sortedFaults[0]?.completed_time ?? null;
      const lastFaultUTC =
        sortedFaults[sortedFaults.length - 1]?.completed_time ?? null;

      const summary = `${assigned}/${finished}`;
      const percent =
        assigned > 0
          ? Math.round((finished / assigned) * 100) + "%"
          : "0%";

      let maxGapMs = 0;
      for (let i = 1; i < sortedFaults.length; i++) {
        const gap =
          new Date(sortedFaults[i].completed_time) -
          new Date(sortedFaults[i - 1].completed_time);
        if (gap > maxGapMs) maxGapMs = gap;
      }
      const maxGapMins = Math.round(maxGapMs / 60000);
      const maxFaultStr =
        maxGapMins > 0
          ? maxGapMins >= 60
            ? `${Math.floor(maxGapMins / 60)}h ${maxGapMins % 60}m`
            : `${maxGapMins}m`
          : "—";

      let avgFaultStr = "—";
      if (lastFaultUTC && row.vehicle_out_time && finished > 0) {
        const avgMins = Math.round(
          (new Date(lastFaultUTC) - new Date(row.vehicle_out_time)) /
            finished /
            60000
        );
        avgFaultStr =
          avgMins >= 60
            ? `${Math.floor(avgMins / 60)}h ${avgMins % 60}m`
            : `${avgMins}m`;
      }

      return {
        date: toSLTDate(row.created_at),
        day: toSLTDay(row.created_at),
        team: teamName,
        member: memberName,
        in: toSLT(row.vehicle_in_time),
        out: toSLT(row.vehicle_out_time),
        vehicle: row.vehicle,
        vehicleOut: toSLT(row.vehicle_out_time),
        firstFault: toSLT(firstFaultUTC),
        lastFault: toSLT(lastFaultUTC),
        summary,
        percent,
        outToFirst: diffFormatted(row.vehicle_out_time, firstFaultUTC),
        lastToIn: diffFormatted(lastFaultUTC, row.vehicle_in_time),
        avgFault: avgFaultStr,
        maxFault: maxFaultStr,
      };
    });

    setOverallDetails(rows);
    setLoading(false);
  }, []);

  // ─────────────────────────────────────────
  // FETCH: DAILY FAULT ANALYSIS
  // ─────────────────────────────────────────

  const fetchDailyData = useCallback(async (month) => {
    if (!month) return;
    setLoading(true);

    const { data: fwData, error: fwError } = await supabase
      .from("field_work")
      .select("id, members, team_name, faults_time, created_at")
      .order("created_at");

    if (fwError) {
      console.error("fetchDailyData field_work error:", fwError.message);
      setLoading(false);
      return;
    }

    const filtered = fwData.filter(
      (row) => toSLTMonthLabel(row.created_at) === month
    );

    const { data: dfData, error: dfError } = await supabase
      .from("daily_faults")
      .select("member, total_assigned, created_at");

    if (dfError) {
      console.error("fetchDailyData daily_faults error:", dfError.message);
      setLoading(false);
      return;
    }

    const { data: fcData, error: fcError } = await supabase
      .from("fault_count")
      .select("member, assigned, created_at");

    const fcRows = fcError ? [] : (fcData ?? []);
    const assignedMap = buildAssignedMap(fcRows, dfData ?? []);

    const teamMap = {};

    filtered.forEach((row) => {
      const memberName = getMemberName(row.members);
      const team = row.team_name ?? "Unknown";
      const dateKey = toSLTDateKey(row.created_at);
      const assigned = assignedMap[`${memberName}__${dateKey}`] ?? 0;

      const faults = Array.isArray(row.faults_time) ? row.faults_time : [];
      const sortedFaults = [...faults].sort(
        (a, b) => new Date(a.completed_time) - new Date(b.completed_time)
      );
      const finished = sortedFaults.length;

      if (!teamMap[team]) teamMap[team] = [];

      teamMap[team].push({
        date: toSLTDate(row.created_at),
        member: memberName,
        entries: sortedFaults.map((f, idx) => ({
          time: toSLT(f.completed_time),
          value: `${assigned}/${f.fault_no ?? idx + 1}`,
        })),
        summary: `${assigned}/${finished}`,
      });
    });

    const teamsArray = Object.keys(teamMap)
      .sort()
      .map((team) => ({ team, rows: teamMap[team] }));

    setDailyTeams(teamsArray);
    setLoading(false);
  }, []);

  // ─────────────────────────────────────────
  // FETCH: MONTHLY SUMMARY — NEW TAB
  // ─────────────────────────────────────────

  const fetchMonthlySummary = useCallback(async (month) => {
    if (!month) return;
    setLoading(true);

    const { data: fwData, error: fwError } = await supabase
      .from("field_work")
      .select(
        "id, members, team_name, vehicle_out_time, vehicle_in_time, faults_time, created_at"
      )
      .order("created_at");

    if (fwError) {
      console.error("fetchMonthlySummary field_work error:", fwError.message);
      setLoading(false);
      return;
    }

    const filtered = fwData.filter(
      (row) => toSLTMonthLabel(row.created_at) === month
    );

    if (filtered.length === 0) {
      setMonthlySummary([]);
      setLoading(false);
      return;
    }

    const memberNames = [
      ...new Set(filtered.map((r) => getMemberName(r.members))),
    ];

    const { data: dfData, error: dfError } = await supabase
      .from("daily_faults")
      .select("member, total_assigned, created_at")
      .in("member", memberNames);

    if (dfError) {
      console.error("fetchMonthlySummary daily_faults error:", dfError.message);
      setLoading(false);
      return;
    }

    const { data: fcData, error: fcError } = await supabase
      .from("fault_count")
      .select("member, assigned, created_at")
      .in("member", memberNames);

    const fcRows = fcError ? [] : (fcData ?? []);
    const assignedMap = buildAssignedMap(fcRows, dfData ?? []);

    // Group by member — aggregate all days
    const memberMap = {};

    filtered.forEach((row) => {
      const memberName = getMemberName(row.members);
      const teamName = row.team_name ?? "—";
      const dateKey = toSLTDateKey(row.created_at);
      const assigned = assignedMap[`${memberName}__${dateKey}`] ?? 0;

      const faults = Array.isArray(row.faults_time) ? row.faults_time : [];
      const finished = faults.length;
      const sortedFaults = [...faults].sort(
        (a, b) => new Date(a.completed_time) - new Date(b.completed_time)
      );

      const firstFaultUTC = sortedFaults[0]?.completed_time ?? null;
      const lastFaultUTC =
        sortedFaults[sortedFaults.length - 1]?.completed_time ?? null;

      // day % for best/worst
      const dayPercent =
        assigned > 0 ? Math.round((finished / assigned) * 100) : 0;

      // out→1st in minutes
      const outToFirstMins =
        firstFaultUTC && row.vehicle_out_time
          ? (new Date(firstFaultUTC) - new Date(row.vehicle_out_time)) / 60000
          : null;

      // last→in in minutes
      const lastToInMins =
        lastFaultUTC && row.vehicle_in_time
          ? (new Date(row.vehicle_in_time) - new Date(lastFaultUTC)) / 60000
          : null;

      // avg/fault in minutes for this day
      const avgFaultMins =
        lastFaultUTC && row.vehicle_out_time && finished > 0
          ? (new Date(lastFaultUTC) - new Date(row.vehicle_out_time)) /
            finished /
            60000
          : null;

      // max gap for this day
      let maxGapMs = 0;
      for (let i = 1; i < sortedFaults.length; i++) {
        const gap =
          new Date(sortedFaults[i].completed_time) -
          new Date(sortedFaults[i - 1].completed_time);
        if (gap > maxGapMs) maxGapMs = gap;
      }
      const maxGapMins = maxGapMs > 0 ? maxGapMs / 60000 : null;

      if (!memberMap[memberName]) {
        memberMap[memberName] = {
          member: memberName,
          team: teamName,
          days: new Set(),
          totalAssigned: 0,
          totalFinished: 0,
          bestDayPercent: 0,
          worstDayPercent: 100,
          outToFirstMinsArr: [],
          lastToInMinsArr: [],
          avgFaultMinsArr: [],
          maxGapMinsArr: [],
        };
      }

      const m = memberMap[memberName];
      m.days.add(dateKey);
      m.totalAssigned += assigned;
      m.totalFinished += finished;

      if (dayPercent > m.bestDayPercent) m.bestDayPercent = dayPercent;
      if (dayPercent < m.worstDayPercent) m.worstDayPercent = dayPercent;

      if (outToFirstMins !== null && outToFirstMins >= 0)
        m.outToFirstMinsArr.push(outToFirstMins);
      if (lastToInMins !== null && lastToInMins >= 0)
        m.lastToInMinsArr.push(lastToInMins);
      if (avgFaultMins !== null && avgFaultMins >= 0)
        m.avgFaultMinsArr.push(avgFaultMins);
      if (maxGapMins !== null)
        m.maxGapMinsArr.push(maxGapMins);
    });

    // Build final rows
    const avg = (arr) =>
      arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

    const summaryRows = Object.values(memberMap)
      .sort((a, b) => a.member.localeCompare(b.member))
      .map((m) => {
        const overallPercent =
          m.totalAssigned > 0
            ? Math.round((m.totalFinished / m.totalAssigned) * 100)
            : 0;

        const maxEver =
          m.maxGapMinsArr.length > 0
            ? Math.max(...m.maxGapMinsArr)
            : null;

        return {
          member: m.member,
          team: m.team,
          totalDays: m.days.size,
          totalAssigned: m.totalAssigned,
          totalFinished: m.totalFinished,
          overallPercent,
          bestDayPercent: m.bestDayPercent,
          worstDayPercent:
            m.worstDayPercent === 100 ? 0 : m.worstDayPercent,
          avgOutToFirst: minsToFormatted(avg(m.outToFirstMinsArr)),
          avgLastToIn: minsToFormatted(avg(m.lastToInMinsArr)),
          avgFault: minsToFormatted(avg(m.avgFaultMinsArr)),
          maxFaultEver: minsToFormatted(maxEver),
        };
      });

    setMonthlySummary(summaryRows);
    setLoading(false);
  }, []);

  // ─────────────────────────────────────────
  // MOUNT
  // ─────────────────────────────────────────

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const init = async () => {
      const { data: mData, error: mError } = await supabase
        .from("members")
        .select("member_name")
        .order("member_name");
      if (!mError) setMembersList(mData.map((m) => m.member_name));

      const { data: fwData, error: fwError } = await supabase
        .from("field_work")
        .select("created_at")
        .order("created_at");
      if (fwError) return;

      const seen = new Set();
      const uniqueMonths = [];
      fwData.forEach((row) => {
        const label = toSLTMonthLabel(row.created_at);
        if (!seen.has(label)) {
          seen.add(label);
          uniqueMonths.push(label);
        }
      });

      if (uniqueMonths.length === 0) return;

      const latestMonth = uniqueMonths[uniqueMonths.length - 1];
      setMonths(uniqueMonths);
      setSelectedMonth(latestMonth);
      fetchOverallData(latestMonth, "All Members");
    };

    init();
  }, []);

  // ─────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    if (activeTab === "overall") fetchOverallData(month, selectedMember);
    if (activeTab === "daily") fetchDailyData(month);
    if (activeTab === "monthly") fetchMonthlySummary(month);
  };

  const handleMemberChange = (e) => {
    const member = e.target.value;
    setSelectedMember(member);
    fetchOverallData(selectedMonth, member);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "overall") fetchOverallData(selectedMonth, selectedMember);
    if (tab === "daily") fetchDailyData(selectedMonth);
    if (tab === "monthly") fetchMonthlySummary(selectedMonth);
  };

  // ─────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────

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

  // ─────────────────────────────────────────
  // JSX
  // ─────────────────────────────────────────

  return (
    <div className="analysis-page">

      <div className="analysis-header">
        <h1>Fault Analysis</h1>
        <p>Daily Detailed Report</p>
      </div>

      <div className="analysis-tabs">
        <button
          className={activeTab === "overall" ? "active" : ""}
          onClick={() => handleTabChange("overall")}
        >
          Overall Detail
        </button>
        <button
          className={activeTab === "daily" ? "active" : ""}
          onClick={() => handleTabChange("daily")}
        >
          Daily Fault Analysis
        </button>
        <button
          className={activeTab === "monthly" ? "active" : ""}
          onClick={() => handleTabChange("monthly")}
        >
          Monthly Summary
        </button>
      </div>

      {/* ── OVERALL DETAIL TAB ── */}
      {activeTab === "overall" && (
        <>
          <div className="top-filters">
            <select value={selectedMonth} onChange={handleMonthChange}>
              {months.map((month) => (
                <option key={month}>{month}</option>
              ))}
            </select>
            <select value={selectedMember} onChange={handleMemberChange}>
              <option>All Members</option>
              {membersList.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="analysis-card">
            <h2>FAULT ANALYSIS BY SERVICE NUMBER (Every Works)</h2>
            {loading ? (
              <div className="loading-state">Loading...</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>DATE</th>
                      <th>DAY</th>
                      <th>TEAM</th>
                      <th>MEMBER</th>
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
                    {overallDetails.length === 0 ? (
                      <tr>
                        <td colSpan="16" className="empty-cell">No Data</td>
                      </tr>
                    ) : (
                      overallDetails.map((item, index) => (
                        <tr key={index}>
                          <td>{item.date}</td>
                          <td>{item.day}</td>
                          <td>{item.team}</td>
                          <td>{item.member}</td>
                          <td>{item.in}</td>
                          <td>{item.out}</td>
                          <td>{item.vehicle}</td>
                          <td>{item.vehicleOut}</td>
                          <td>{item.firstFault}</td>
                          <td>{item.lastFault}</td>
                          <td>{item.summary}</td>
                          <td className={getColorClass(parseInt(item.percent))}>
                            {item.percent}
                          </td>
                          <td className="yellow_vf">{item.outToFirst}</td>
                          <td className="orange_vf">{item.lastToIn}</td>
                          <td className="pink_vf">{item.avgFault}</td>
                          <td className="max_fault">{item.maxFault}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── DAILY FAULT ANALYSIS TAB ── */}
      {activeTab === "daily" && (
        <>
          <div className="top-filters">
            <select value={selectedMonth} onChange={handleMonthChange}>
              {months.map((month) => (
                <option key={month}>{month}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="loading-state">Loading...</div>
          ) : (
            <div className="daily-analysis-grid">
              {dailyTeams.map((team, teamIndex) => (
                <div className="daily-team-card" key={teamIndex}>
                  <div className="team-header">{team.team}</div>
                  <div className="table-scroll">
                    <table className="daily-team-table">
                      <thead>
                        <tr>
                          <th>DATE</th>
                          <th>MEMBER</th>
                          <th>TIME</th>
                          <th>ULT/ATT</th>
                          <th>SUMMARY</th>
                          <th>COMPLETION %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {team.rows.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="empty-cell">No Data</td>
                          </tr>
                        ) : (
                          team.rows.map((group, groupIndex) => {
                            const percent = getPercent(group.summary);
                            return group.entries.map((entry, entryIndex) => (
                              <tr key={`${groupIndex}-${entryIndex}`}>
                                {entryIndex === 0 && (
                                  <td rowSpan={group.entries.length}>
                                    {group.date}
                                  </td>
                                )}
                                {entryIndex === 0 && (
                                  <td rowSpan={group.entries.length}>
                                    {group.member}
                                  </td>
                                )}
                                <td>{entry.time}</td>
                                <td>{entry.value}</td>
                                {entryIndex === group.entries.length - 1 && (
                                  <td className="summary-cell">
                                    {group.summary}
                                  </td>
                                )}
                                {entryIndex === group.entries.length - 1 && (
                                  <td className={getColorClass(percent)}>
                                    {percent}%
                                  </td>
                                )}
                              </tr>
                            ));
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── MONTHLY SUMMARY TAB — NEW ── */}
      {activeTab === "monthly" && (
        <>
          <div className="top-filters">
            <select value={selectedMonth} onChange={handleMonthChange}>
              {months.map((month) => (
                <option key={month}>{month}</option>
              ))}
            </select>
          </div>

          <div className="analysis-card">
            <h2>MONTHLY PERFORMANCE SUMMARY — {selectedMonth}</h2>
            {loading ? (
              <div className="loading-state">Loading...</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>MEMBER</th>
                      <th>TEAM</th>
                      <th>TOTAL DAYS</th>
                      <th>TOTAL ASSIGNED</th>
                      <th>TOTAL FINISHED</th>
                      <th>OVERALL %</th>
                      <th>BEST DAY %</th>
                      <th>WORST DAY %</th>
                      <th>AVG OUT → 1ST</th>
                      <th>AVG LAST → IN</th>
                      <th>AVG / FAULT</th>
                      <th>MAX FAULT (MONTH)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlySummary.length === 0 ? (
                      <tr>
                        <td colSpan="12" className="empty-cell">No Data</td>
                      </tr>
                    ) : (
                      monthlySummary.map((item, index) => (
                        <tr key={index}>
                          <td>{item.member}</td>
                          <td>{item.team}</td>
                          <td>{item.totalDays}</td>
                          <td>{item.totalAssigned}</td>
                          <td>{item.totalFinished}</td>
                          <td className={getColorClass(item.overallPercent)}>
                            {item.overallPercent}%
                          </td>
                          <td className="green">
                            {item.bestDayPercent}%
                          </td>
                          <td className={getColorClass(item.worstDayPercent)}>
                            {item.worstDayPercent}%
                          </td>
                          <td className="yellow_vf">{item.avgOutToFirst}</td>
                          <td className="orange_vf">{item.avgLastToIn}</td>
                          <td className="pink_vf">{item.avgFault}</td>
                          <td className="max_fault">{item.maxFaultEver}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}