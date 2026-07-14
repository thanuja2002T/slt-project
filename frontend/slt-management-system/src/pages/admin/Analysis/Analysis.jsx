import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../../lib/supabase.js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import "./FaultAnalysis.css";

// ─────────────────────────────────────────
// CUSTOM TOOLTIP — outside component
// ─────────────────────────────────────────

const CustomTooltip = ({ active, payload, unit }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{payload[0]?.payload?.label}</p>
      <p className="chart-tooltip-date">{payload[0]?.payload?.date}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.value}{unit || ""}
        </p>
      ))}
    </div>
  );
};

const TooltipPercent = (props) => <CustomTooltip {...props} unit="%" />;
const TooltipMins    = (props) => <CustomTooltip {...props} unit=" mins" />;
const TooltipPlain   = (props) => <CustomTooltip {...props} unit="" />;

// Colour palette for member-comparison bars — cycles if more members are picked
const MEMBER_COLORS = [
  "#3b82f6", "#22c55e", "#facc15", "#fb923c",
  "#ff3ef7", "#00d4ff", "#ef4444", "#a78bfa",
  "#14b8a6", "#f472b6", "#84cc16", "#eab308",
];
const colorForIndex = (i) => MEMBER_COLORS[i % MEMBER_COLORS.length];

const barRadius = [4, 4, 0, 0];

// Reusable single-metric chart card — declared OUTSIDE Analysis so it isn't
// re-created on every render (fixes "Components created during render").
// Everything it needs is passed in as props.
const MetricChart = ({
  title,
  singleDataKey,
  singleName,
  singleFill,
  useCells,
  suffix,
  tooltip,
  unit,
  usingComparison,
  comparisonChartData,
  chartData,
  selectedMembers,
  SharedXAxis,
  ComparisonXAxis,
  getPercentColor,
}) => (
  <div className="chart-card">
    <h3>{title}</h3>
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={usingComparison ? comparisonChartData : chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 65 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        {usingComparison ? ComparisonXAxis : SharedXAxis}
        <YAxis
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          tickFormatter={unit ? (v) => `${v}${unit}` : undefined}
          domain={singleDataKey === "percentNum" && !usingComparison ? [0, 100] : undefined}
        />
        <Tooltip content={tooltip} />
        {usingComparison && (
          <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12, paddingTop: 4 }} />
        )}
        {usingComparison ? (
          selectedMembers.map((m, i) => (
            <Bar
              key={m}
              dataKey={`${m}_${suffix}`}
              name={m}
              fill={colorForIndex(i)}
              radius={barRadius}
            />
          ))
        ) : useCells ? (
          <Bar dataKey={singleDataKey} name={singleName} radius={barRadius}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={getPercentColor(entry.percentNum)} />
            ))}
          </Bar>
        ) : (
          <Bar dataKey={singleDataKey} name={singleName} fill={singleFill} radius={barRadius} />
        )}
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// ─────────────────────────────────────────

export default function Analysis() {
  const [activeTab, setActiveTab]         = useState("overall");
  const [overallView, setOverallView]     = useState("table"); // "table" | "chart"
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedMember, setSelectedMember] = useState("All Members");

  // ── Member comparison state ──
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]); // no cap — pick as many as needed

  const [overallDetails, setOverallDetails] = useState([]);
  const [dailyTeams, setDailyTeams]         = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [months, setMonths]                 = useState([]);
  const [membersList, setMembersList]       = useState([]);
  const [loading, setLoading]               = useState(false);

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

  // dd/mm/yyyy -> sortable key
  const dateSortKey = (ddmmyyyy) => {
    if (!ddmmyyyy || ddmmyyyy === "—") return "";
    const [d, m, y] = ddmmyyyy.split("/");
    return `${y}-${m}-${d}`;
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

  const parseMinutes = (str) => {
    if (!str || str === "—") return 0;
    const hMatch = str.match(/(\d+)h/);
    const mMatch = str.match(/(\d+)m/);
    const h = hMatch ? parseInt(hMatch[1]) : 0;
    const m = mMatch ? parseInt(mMatch[1]) : 0;
    return h * 60 + m;
  };

  // ─────────────────────────────────────────
  // HELPER: build assigned lookup map
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
  // compareMembers: array of member names for comparison mode (overrides `member`)
  // ─────────────────────────────────────────

  const fetchOverallData = useCallback(async (month, member, compareMembers = []) => {
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

    if (compareMembers && compareMembers.length > 0) {
      // Comparison mode — keep rows for any of the selected members
      filtered = filtered.filter((row) =>
        compareMembers.includes(getMemberName(row.members))
      );
    } else if (member !== "All Members") {
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

    const fcRows      = fcError ? [] : (fcData ?? []);
    const assignedMap = buildAssignedMap(fcRows, dfData ?? []);

    const rows = filtered.map((row) => {
      const memberName = getMemberName(row.members);
      const teamName   = row.team_name ?? "—";
      const dateKey    = toSLTDateKey(row.created_at);
      const assigned   = assignedMap[`${memberName}__${dateKey}`] ?? 0;

      const faults       = Array.isArray(row.faults_time) ? row.faults_time : [];
      const finished     = faults.length;
      const sortedFaults = [...faults].sort(
        (a, b) => new Date(a.completed_time) - new Date(b.completed_time)
      );

      const firstFaultUTC = sortedFaults[0]?.completed_time ?? null;
      const lastFaultUTC  = sortedFaults[sortedFaults.length - 1]?.completed_time ?? null;

      const summary    = `${assigned}/${finished}`;
      const percentNum = assigned > 0 ? Math.round((finished / assigned) * 100) : 0;
      const percent    = `${percentNum}%`;

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

      const outToFirst = diffFormatted(row.vehicle_out_time, firstFaultUTC);
      const lastToIn   = diffFormatted(lastFaultUTC, row.vehicle_in_time);

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
        assigned,
        finished,
        percent,
        percentNum,
        outToFirst,
        lastToIn,
        avgFault: avgFaultStr,
        maxFault: maxFaultStr,
      };
    });

    setOverallDetails(rows);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const fcRows      = fcError ? [] : (fcData ?? []);
    const assignedMap = buildAssignedMap(fcRows, dfData ?? []);

    const teamMap = {};

    filtered.forEach((row) => {
      const memberName = getMemberName(row.members);
      const team       = row.team_name ?? "Unknown";
      const dateKey    = toSLTDateKey(row.created_at);
      const assigned   = assignedMap[`${memberName}__${dateKey}`] ?? 0;

      const faults       = Array.isArray(row.faults_time) ? row.faults_time : [];
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────
  // FETCH: MONTHLY SUMMARY
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

    const fcRows      = fcError ? [] : (fcData ?? []);
    const assignedMap = buildAssignedMap(fcRows, dfData ?? []);
    const memberMap   = {};

    filtered.forEach((row) => {
      const memberName = getMemberName(row.members);
      const teamName   = row.team_name ?? "—";
      const dateKey    = toSLTDateKey(row.created_at);
      const assigned   = assignedMap[`${memberName}__${dateKey}`] ?? 0;

      const faults       = Array.isArray(row.faults_time) ? row.faults_time : [];
      const finished     = faults.length;
      const sortedFaults = [...faults].sort(
        (a, b) => new Date(a.completed_time) - new Date(b.completed_time)
      );

      const firstFaultUTC = sortedFaults[0]?.completed_time ?? null;
      const lastFaultUTC  = sortedFaults[sortedFaults.length - 1]?.completed_time ?? null;
      const dayPercent    = assigned > 0 ? Math.round((finished / assigned) * 100) : 0;

      const outToFirstMins =
        firstFaultUTC && row.vehicle_out_time
          ? (new Date(firstFaultUTC) - new Date(row.vehicle_out_time)) / 60000
          : null;

      const lastToInMins =
        lastFaultUTC && row.vehicle_in_time
          ? (new Date(row.vehicle_in_time) - new Date(lastFaultUTC)) / 60000
          : null;

      const avgFaultMins =
        lastFaultUTC && row.vehicle_out_time && finished > 0
          ? (new Date(lastFaultUTC) - new Date(row.vehicle_out_time)) / finished / 60000
          : null;

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
      if (dayPercent > m.bestDayPercent)  m.bestDayPercent  = dayPercent;
      if (dayPercent < m.worstDayPercent) m.worstDayPercent = dayPercent;
      if (outToFirstMins !== null && outToFirstMins >= 0) m.outToFirstMinsArr.push(outToFirstMins);
      if (lastToInMins   !== null && lastToInMins   >= 0) m.lastToInMinsArr.push(lastToInMins);
      if (avgFaultMins   !== null && avgFaultMins   >= 0) m.avgFaultMinsArr.push(avgFaultMins);
      if (maxGapMins     !== null)                        m.maxGapMinsArr.push(maxGapMins);
    });

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
          m.maxGapMinsArr.length > 0 ? Math.max(...m.maxGapMinsArr) : null;

        return {
          member: m.member,
          team: m.team,
          totalDays: m.days.size,
          totalAssigned: m.totalAssigned,
          totalFinished: m.totalFinished,
          overallPercent,
          bestDayPercent: m.bestDayPercent,
          worstDayPercent: m.worstDayPercent === 100 ? 0 : m.worstDayPercent,
          avgOutToFirst: minsToFormatted(avg(m.outToFirstMinsArr)),
          avgLastToIn:   minsToFormatted(avg(m.lastToInMinsArr)),
          avgFault:      minsToFormatted(avg(m.avgFaultMinsArr)),
          maxFaultEver:  minsToFormatted(maxEver),
        };
      });

    setMonthlySummary(summaryRows);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

      const seen         = new Set();
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    if (activeTab === "overall")
      fetchOverallData(month, selectedMember, comparisonMode ? selectedMembers : []);
    if (activeTab === "daily")   fetchDailyData(month);
    if (activeTab === "monthly") fetchMonthlySummary(month);
  };

  const handleMemberChange = (e) => {
    const member = e.target.value;
    setSelectedMember(member);
    fetchOverallData(selectedMonth, member, []);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "overall")
      fetchOverallData(selectedMonth, selectedMember, comparisonMode ? selectedMembers : []);
    if (tab === "daily")   fetchDailyData(selectedMonth);
    if (tab === "monthly") fetchMonthlySummary(selectedMonth);
  };

  // Toggle "Compare Members" mode on/off
  const handleComparisonToggle = () => {
    const next = !comparisonMode;
    setComparisonMode(next);
    if (!next) {
      // turning OFF — go back to single-member view
      setSelectedMembers([]);
      fetchOverallData(selectedMonth, selectedMember, []);
    } else {
      // turning ON — start with nothing selected until user picks
      setSelectedMembers([]);
      setOverallDetails([]);
    }
  };

  // Add / remove a member from the comparison list — no limit on count
  const handleMemberToggle = (member) => {
    setSelectedMembers((prev) => {
      const next = prev.includes(member)
        ? prev.filter((m) => m !== member)
        : [...prev, member];
      fetchOverallData(selectedMonth, selectedMember, next);
      return next;
    });
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
    if (percent >= 70)  return "yellow";
    return "red";
  };

  const getPercentColor = (percent) => {
    if (percent >= 100) return "#22c55e";
    if (percent >= 70)  return "#facc15";
    return "#ef4444";
  };

  const usingComparison = comparisonMode && selectedMembers.length > 0;

  // ── Single-member chart data (existing behaviour) ──
  const chartData = overallDetails.map((item) => ({
    label:          `${item.team} / ${item.member}`,
    date:           item.date,
    shortName:      item.member.split(" ")[0],
    member:         item.member,
    team:           item.team,
    percentNum:     item.percentNum ?? 0,
    assigned:       item.assigned  ?? 0,
    finished:       item.finished  ?? 0,
    outToFirstMins: parseMinutes(item.outToFirst),
    lastToInMins:   parseMinutes(item.lastToIn),
    avgFaultMins:   parseMinutes(item.avgFault),
    maxFaultMins:   parseMinutes(item.maxFault),
  }));

  // ── Comparison chart data — pivoted by date, one column-set per member ──
  const comparisonChartData = (() => {
    if (!usingComparison) return [];
    const dateMap = {};
    overallDetails.forEach((item) => {
      const key = item.date;
      if (!dateMap[key]) {
        dateMap[key] = { date: item.date, day: item.day };
      }
      const entry = dateMap[key];
      entry[`${item.member}_percent`]     = item.percentNum ?? 0;
      entry[`${item.member}_assigned`]    = item.assigned ?? 0;
      entry[`${item.member}_finished`]    = item.finished ?? 0;
      entry[`${item.member}_outToFirst`]  = parseMinutes(item.outToFirst);
      entry[`${item.member}_lastToIn`]    = parseMinutes(item.lastToIn);
      entry[`${item.member}_avgFault`]    = parseMinutes(item.avgFault);
      entry[`${item.member}_maxFault`]    = parseMinutes(item.maxFault);
    });
    return Object.values(dateMap).sort(
      (a, b) => dateSortKey(a.date).localeCompare(dateSortKey(b.date))
    );
  })();

  // Shared X axis with angled labels — readable on phone and laptop
  const SharedXAxis = (
    <XAxis
      dataKey="shortName"
      tick={{ fill: "#94a3b8", fontSize: 10 }}
      angle={-40}
      textAnchor="end"
      interval={0}
      height={60}
    />
  );

  // X axis used in comparison mode — grouped by date instead of member
  const ComparisonXAxis = (
    <XAxis
      dataKey="date"
      tick={{ fill: "#94a3b8", fontSize: 10 }}
      angle={-40}
      textAnchor="end"
      interval={0}
      height={60}
    />
  );

  // ─────────────────────────────────────────
  // JSX
  // ─────────────────────────────────────────

  return (
    <div className="analysis-page">

      <div className="analysis-header">
        <h1>Fault Analysis</h1>
        <p>Daily Detailed Report</p>
      </div>

      {/* MAIN TABS */}
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
          {/* FILTERS ROW */}
          <div className="top-filters">
            <select value={selectedMonth} onChange={handleMonthChange}>
              {months.map((month) => (
                <option key={month}>{month}</option>
              ))}
            </select>

            {!comparisonMode && (
              <select value={selectedMember} onChange={handleMemberChange}>
                <option>All Members</option>
                {membersList.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            )}

            <button
              className={`compare-btn ${comparisonMode ? "toggle-active" : ""}`}
              onClick={handleComparisonToggle}
            >
              🔀 Compare Members
            </button>

            {/* VIEW TOGGLE */}
            <div className="view-toggle">
              <button
                className={overallView === "table" ? "toggle-active" : ""}
                onClick={() => setOverallView("table")}
              >
                📋 Table View
              </button>
              <button
                className={overallView === "chart" ? "toggle-active" : ""}
                onClick={() => setOverallView("chart")}
              >
                📊 Chart View
              </button>
            </div>
          </div>

          {/* MEMBER PICKER — shown only in comparison mode */}
          {comparisonMode && (
            <div className="member-picker">
              <div className="member-picker-header">
                Select members to compare ({selectedMembers.length} selected)
              </div>
              <div className="member-picker-list">
                {membersList.map((m) => {
                  const idx = selectedMembers.indexOf(m);
                  const checked = idx !== -1;
                  return (
                    <label
                      key={m}
                      className={`member-chip ${checked ? "checked" : ""}`}
                      style={checked ? { borderColor: colorForIndex(idx), color: colorForIndex(idx) } : undefined}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleMemberToggle(m)}
                      />
                      {m}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TABLE VIEW ── */}
          {overallView === "table" && (
            <div className="analysis-card">
              <h2>FAULT ANALYSIS </h2>
              {loading ? (
                <div className="loading-state">Loading...</div>
              ) : comparisonMode && selectedMembers.length === 0 ? (
                <div className="loading-state">Select at least one member to compare</div>
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
                        overallDetails.map((item, index) => {
                          const memberIdx = selectedMembers.indexOf(item.member);
                          return (
                            <tr key={index}>
                              <td>{item.date}</td>
                              <td>{item.day}</td>
                              <td>{item.team}</td>
                              <td>
                                {comparisonMode && memberIdx !== -1 ? (
                                  <span
                                    className="member-dot"
                                    style={{ background: colorForIndex(memberIdx) }}
                                  />
                                ) : null}
                                {item.member}
                              </td>
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
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── CHART VIEW ── */}
          {overallView === "chart" && (
            <>
              {loading ? (
                <div className="loading-state">Loading...</div>
              ) : comparisonMode && selectedMembers.length === 0 ? (
                <div className="loading-state">Select at least one member to compare</div>
              ) : chartData.length === 0 && !usingComparison ? (
                <div className="loading-state">No Data</div>
              ) : (
                <div className="charts-grid">

                  <MetricChart
                    title="Completion %"
                    singleDataKey="percentNum"
                    singleName="Completion %"
                    useCells
                    suffix="percent"
                    tooltip={TooltipPercent}
                    unit="%"
                    usingComparison={usingComparison}
                    comparisonChartData={comparisonChartData}
                    chartData={chartData}
                    selectedMembers={selectedMembers}
                    SharedXAxis={SharedXAxis}
                    ComparisonXAxis={ComparisonXAxis}
                    getPercentColor={getPercentColor}
                  />

                  {/* Assigned vs Finished needs two bars per member, handled separately */}
                  <div className="chart-card">
                    <h3>Assigned vs Finished</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={usingComparison ? comparisonChartData : chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 65 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                        {usingComparison ? ComparisonXAxis : SharedXAxis}
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                        <Tooltip content={TooltipPlain} />
                        <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12, paddingTop: 4 }} />
                        {usingComparison ? (
                          selectedMembers.flatMap((m, i) => ([
                            <Bar
                              key={`${m}-a`}
                              dataKey={`${m}_assigned`}
                              name={`${m} Assigned`}
                              fill={colorForIndex(i)}
                              radius={barRadius}
                            />,
                            <Bar
                              key={`${m}-f`}
                              dataKey={`${m}_finished`}
                              name={`${m} Finished`}
                              fill={colorForIndex(i)}
                              fillOpacity={0.45}
                              radius={barRadius}
                            />,
                          ]))
                        ) : (
                          <>
                            <Bar dataKey="assigned" name="Assigned" fill="#3b82f6" radius={barRadius} />
                            <Bar dataKey="finished"  name="Finished"  fill="#22c55e" radius={barRadius} />
                          </>
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <MetricChart
                    title="Out → 1st Fault (mins)"
                    singleDataKey="outToFirstMins"
                    singleName="Out → 1st"
                    singleFill="#facc15"
                    suffix="outToFirst"
                    tooltip={TooltipMins}
                    unit="m"
                    usingComparison={usingComparison}
                    comparisonChartData={comparisonChartData}
                    chartData={chartData}
                    selectedMembers={selectedMembers}
                    SharedXAxis={SharedXAxis}
                    ComparisonXAxis={ComparisonXAxis}
                    getPercentColor={getPercentColor}
                  />

                  <MetricChart
                    title="Last Fault → In (mins)"
                    singleDataKey="lastToInMins"
                    singleName="Last → In"
                    singleFill="#fb923c"
                    suffix="lastToIn"
                    tooltip={TooltipMins}
                    unit="m"
                    usingComparison={usingComparison}
                    comparisonChartData={comparisonChartData}
                    chartData={chartData}
                    selectedMembers={selectedMembers}
                    SharedXAxis={SharedXAxis}
                    ComparisonXAxis={ComparisonXAxis}
                    getPercentColor={getPercentColor}
                  />

                  <MetricChart
                    title="Avg / Fault (mins)"
                    singleDataKey="avgFaultMins"
                    singleName="Avg / Fault"
                    singleFill="#ff3ef7"
                    suffix="avgFault"
                    tooltip={TooltipMins}
                    unit="m"
                    usingComparison={usingComparison}
                    comparisonChartData={comparisonChartData}
                    chartData={chartData}
                    selectedMembers={selectedMembers}
                    SharedXAxis={SharedXAxis}
                    ComparisonXAxis={ComparisonXAxis}
                    getPercentColor={getPercentColor}
                  />

                  <MetricChart
                    title="Max Fault Time (mins)"
                    singleDataKey="maxFaultMins"
                    singleName="Max Fault"
                    singleFill="#00d4ff"
                    suffix="maxFault"
                    tooltip={TooltipMins}
                    unit="m"
                    usingComparison={usingComparison}
                    comparisonChartData={comparisonChartData}
                    chartData={chartData}
                    selectedMembers={selectedMembers}
                    SharedXAxis={SharedXAxis}
                    ComparisonXAxis={ComparisonXAxis}
                    getPercentColor={getPercentColor}
                  />

                </div>
              )}
            </>
          )}
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
                                  <td rowSpan={group.entries.length}>{group.date}</td>
                                )}
                                {entryIndex === 0 && (
                                  <td rowSpan={group.entries.length}>{group.member}</td>
                                )}
                                <td>{entry.time}</td>
                                <td>{entry.value}</td>
                                {entryIndex === group.entries.length - 1 && (
                                  <td className="summary-cell">{group.summary}</td>
                                )}
                                {entryIndex === group.entries.length - 1 && (
                                  <td className={getColorClass(percent)}>{percent}%</td>
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

      {/* ── MONTHLY SUMMARY TAB ── */}
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
                          <td className="green">{item.bestDayPercent}%</td>
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