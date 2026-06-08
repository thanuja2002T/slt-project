import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../../../lib/supabase.js";
import Select from "react-select";
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
  const [teamsList, setTeamsList] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  const [form, setForm] = useState({
    date: "",
    team: "",
    member: [],
    vehicle: "",
    vehicleOutTime: "",
    vehicleInTime: "",
    totalAssigned: "",
    totalFinished: "",
    firstFaultTime: "",
    lastFaultTime: "",
    avgFaultTime: "",
    maxFaultTime: "",
  });

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

  const sltToUtc = (date, time) => {
    if (!date || !time) return null;
    return new Date(`${date}T${time}:00+05:30`).toISOString();
  };

  // ─────────────────────────────────────────
  // HELPER: build assigned + finished map
  // ── console.logs removed ──
  // ─────────────────────────────────────────

  const buildAssignedMap = (fcData, dfData) => {
    const map = {};

    dfData.forEach((df) => {
      const dateKey = toSLTDateKey(df.created_at);

      let members = [];
      if (Array.isArray(df.member)) {
        members = df.member;
      } else if (typeof df.member === "string") {
        const trimmed = df.member.trim();
        if (trimmed.startsWith("[")) {
          try {
            const parsed = JSON.parse(trimmed);
            members = Array.isArray(parsed) ? parsed : [trimmed];
          } catch {
            members = [trimmed];
          }
        } else {
          members = [trimmed];
        }
      }

      members.forEach((member) => {
        const key = `${member.trim()}__${dateKey}`;
        map[key] = {
          assigned: df.total_assigned ?? 0,
          finished: df.total_finished ?? 0,
        };
      });
    });

    fcData.forEach((fc) => {
      const key = `${fc.member.trim()}__${toSLTDateKey(fc.created_at)}`;
      if (fc.assigned != null) {
        if (!map[key]) map[key] = { assigned: 0, finished: 0 };
        map[key].assigned = fc.assigned;
      }
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
        "id, vehicle, members, team_name, vehicle_out_time, vehicle_in_time, first_fault_time, last_fault_time, avg_fault_time, max_fault_time, total_faults, faults_time, created_at"
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
      .select("member, total_assigned, total_finished, created_at");

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

    const rows = filtered.flatMap((row) => {
      const rowMembers = Array.isArray(row.members)
        ? row.members
        : [row.members];
      const memberName = rowMembers[0];
      const teamName = row.team_name ?? "—";
      const dateKey = toSLTDateKey(row.created_at);

      const mapEntry = assignedMap[`${memberName}__${dateKey}`] ?? {
        assigned: 0,
        finished: 0,
      };

      const assigned = mapEntry.assigned;
      const finished = row.total_faults ?? 0;
      const faults = Array.isArray(row.faults_time) ? row.faults_time : [];

      const sortedFaults = [...faults].sort(
        (a, b) => new Date(a.completed_time) - new Date(b.completed_time)
      );

      const firstFaultUTC =
        sortedFaults.length > 0
          ? sortedFaults[0]?.completed_time
          : row.first_fault_time;

      const lastFaultUTC =
        sortedFaults.length > 0
          ? sortedFaults[sortedFaults.length - 1]?.completed_time
          : row.last_fault_time;

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

      let maxFaultStr = row.max_fault_time || "—";
      if (sortedFaults.length > 1) {
        const maxGapMins = Math.round(maxGapMs / 60000);
        maxFaultStr =
          maxGapMins > 0
            ? maxGapMins >= 60
              ? `${Math.floor(maxGapMins / 60)}h ${maxGapMins % 60}m`
              : `${maxGapMins}m`
            : "—";
      }

      let avgFaultStr = row.avg_fault_time || "—";
      if (
        sortedFaults.length > 0 &&
        lastFaultUTC &&
        row.vehicle_out_time &&
        finished > 0
      ) {
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

      return rowMembers.map((m) => ({
        date: toSLTDate(row.created_at),
        day: toSLTDay(row.created_at),
        team: teamName,
        member: m,
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
      }));
    });

    setOverallDetails(rows);
    setLoading(false);
  }, []);

  // ─────────────────────────────────────────
  // FETCH: DAILY FAULT ANALYSIS
  // ── FIX: iterate all members in row.members array ──
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
      .select("member, total_assigned, total_finished, created_at");

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
      // ── FIX: all members in array iterate ──
      const rowMembers = Array.isArray(row.members)
        ? row.members
        : [row.members ?? "Unknown"];

      const team = row.team_name ?? "Unknown";
      const dateKey = toSLTDateKey(row.created_at);

      const faults = Array.isArray(row.faults_time) ? row.faults_time : [];
      const sortedFaults = [...faults].sort(
        (a, b) => new Date(a.completed_time) - new Date(b.completed_time)
      );

      // ── FIX: one entry per member ──
      rowMembers.forEach((memberName) => {
        const mapEntry = assignedMap[`${memberName}__${dateKey}`] ?? {
          assigned: 0,
          finished: 0,
        };

        const assigned = mapEntry.assigned;
        const finished =
          faults.length > 0 ? faults.length : mapEntry.finished;

        if (!teamMap[team]) teamMap[team] = [];

        teamMap[team].push({
          date: toSLTDate(row.created_at),
          member: memberName,
          entries:
            sortedFaults.length > 0
              ? sortedFaults.map((f, idx) => ({
                  time: toSLT(f.completed_time),
                  value: `${assigned}/${f.fault_no ?? idx + 1}`,
                }))
              : [{ time: "—", value: `${assigned}/${finished}` }],
          summary: `${assigned}/${finished}`,
        });
      });
    });

    const teamsArray = Object.keys(teamMap)
      .sort()
      .map((team) => ({ team, rows: teamMap[team] }));

    setDailyTeams(teamsArray);
    setLoading(false);
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
      .select("member, total_assigned, total_finished, created_at");

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

    const memberMap = {};

    filtered.forEach((row) => {
      const memberName = getMemberName(row.members);
      const teamName = row.team_name ?? "—";
      const dateKey = toSLTDateKey(row.created_at);
      const mapEntry = assignedMap[`${memberName}__${dateKey}`] ?? {
        assigned: 0,
        finished: 0,
      };

      const assigned = mapEntry.assigned;
      const faults = Array.isArray(row.faults_time) ? row.faults_time : [];
      const finished =
        faults.length > 0 ? faults.length : mapEntry.finished;

      const sortedFaults = [...faults].sort(
        (a, b) => new Date(a.completed_time) - new Date(b.completed_time)
      );

      const firstFaultUTC = sortedFaults[0]?.completed_time ?? null;
      const lastFaultUTC =
        sortedFaults[sortedFaults.length - 1]?.completed_time ?? null;

      const dayPercent =
        assigned > 0 ? Math.round((finished / assigned) * 100) : 0;

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
          ? (new Date(lastFaultUTC) - new Date(row.vehicle_out_time)) /
            finished /
            60000
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
      if (dayPercent > m.bestDayPercent) m.bestDayPercent = dayPercent;
      if (dayPercent < m.worstDayPercent) m.worstDayPercent = dayPercent;
      if (outToFirstMins !== null && outToFirstMins >= 0)
        m.outToFirstMinsArr.push(outToFirstMins);
      if (lastToInMins !== null && lastToInMins >= 0)
        m.lastToInMinsArr.push(lastToInMins);
      if (avgFaultMins !== null && avgFaultMins >= 0)
        m.avgFaultMinsArr.push(avgFaultMins);
      if (maxGapMins !== null) m.maxGapMinsArr.push(maxGapMins);
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

      const { data: tData, error: tError } = await supabase
        .from("teams")
        .select("team_name")
        .order("team_name");
      if (!tError) setTeamsList(tData.map((t) => t.team_name));

      const { data: vData, error: vError } = await supabase
        .from("vehicles")
        .select("vehicle_number")
        .order("vehicle_number");
      if (!vError) setVehiclesList(vData.map((v) => v.vehicle_number));

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

  const openModal = () => {
    setForm({
      date: new Date().toISOString().split("T")[0],
      team: "",
      member: [],
      vehicle: "",
      vehicleOutTime: "",
      vehicleInTime: "",
      totalAssigned: "",
      totalFinished: "",
      firstFaultTime: "",
      lastFaultTime: "",
      avgFaultTime: "",
      maxFaultTime: "",
    });
    setModalError("");
    setModalSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalError("");
    setModalSuccess("");
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setModalError("");
    setModalSuccess("");

    if (
      !form.date ||
      !form.team ||
      form.member.length === 0 ||
      !form.vehicle ||
      !form.vehicleOutTime ||
      !form.vehicleInTime ||
      !form.totalAssigned ||
      form.totalFinished === ""
    ) {
      setModalError("All fields are required.");
      return;
    }

    const assigned = parseInt(form.totalAssigned);
    const finished = parseInt(form.totalFinished);

    if (assigned < 0 || finished < 0) {
      setModalError("Assigned and Finished cannot be negative.");
      return;
    }

    if (finished > assigned) {
      setModalError("Finished cannot be more than Assigned.");
      return;
    }

    setSubmitting(true);

    const vehicleOutUTC = sltToUtc(form.date, form.vehicleOutTime);
    const vehicleInUTC = sltToUtc(form.date, form.vehicleInTime);
    const createdAtUTC = vehicleOutUTC;
    const firstFaultUTC = sltToUtc(form.date, form.firstFaultTime);
    const lastFaultUTC = sltToUtc(form.date, form.lastFaultTime);

    // Insert field_work — members as array
    const { error: fwError } = await supabase.from("field_work").insert({
      vehicle: form.vehicle,
      members: form.member,
      team_name: form.team,
      vehicle_out_time: vehicleOutUTC,
      vehicle_in_time: vehicleInUTC,
      faults_time: [],
      total_faults: finished,
      status: "Vehicle In",
      completed_time: vehicleInUTC,
      finish_time: vehicleInUTC,
      created_at: createdAtUTC,
      first_fault_time: firstFaultUTC,
      last_fault_time: lastFaultUTC,
      avg_fault_time: form.avgFaultTime,
      max_fault_time: form.maxFaultTime,
    });

    if (fwError) {
      console.error("field_work insert error:", fwError.message);
      setModalError(`Error saving field work: ${fwError.message}`);
      setSubmitting(false);
      return;
    }

    // ── FIX: insert daily_faults per member — not array ──
    for (const memberName of form.member) {
      const { error: dfError } = await supabase.from("daily_faults").insert({
        team: form.team,
        member: memberName,
        total_assigned: assigned,
        total_finished: finished,
        created_at: createdAtUTC,
      });

      if (dfError) {
        console.error("daily_faults insert error:", dfError.message);
        setModalError(`Error saving daily faults: ${dfError.message}`);
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(false);
    setModalSuccess("Entry saved successfully!");

    const entryMonth = new Date(createdAtUTC).toLocaleDateString("en-GB", {
      timeZone: "Asia/Colombo",
      month: "long",
      year: "numeric",
    });

    if (!months.includes(entryMonth)) {
      setMonths((prev) => [...prev, entryMonth].sort());
    }

    setSelectedMonth(entryMonth);

    setTimeout(() => {
      closeModal();
      if (activeTab === "overall")
        fetchOverallData(entryMonth, selectedMember);
      if (activeTab === "daily") fetchDailyData(entryMonth);
      if (activeTab === "monthly") fetchMonthlySummary(entryMonth);
    }, 1200);
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

      {/* ── OVERALL DETAIL ── */}
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
            <button className="add-entry-btn" onClick={openModal}>
              + Add Entry
            </button>
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
                      <th>AVG / FAULT</th>
                      <th>MAXIMUM TIME TAKEN FOR A FAULT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overallDetails.length === 0 ? (
                      <tr>
                        <td colSpan="16" className="empty-cell">
                          No Data
                        </td>
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

      {/* ── DAILY FAULT ANALYSIS ── */}
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
                          <th>ULT / ATT</th>
                          <th>SUMMARY</th>
                          <th>COMPLETION %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {team.rows.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="empty-cell">
                              No Data
                            </td>
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

      {/* ── MONTHLY SUMMARY ── */}
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
                        <td colSpan="12" className="empty-cell">
                          No Data
                        </td>
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

      {/* ── MODAL ── */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Add Field Work Entry</h2>

            <div className="modal-grid">

              <div className="modal-field">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleFormChange}
                />
              </div>

              <div className="modal-field">
                <label>Team</label>
                <select
                  name="team"
                  value={form.team}
                  onChange={handleFormChange}
                >
                  <option value="">Select Team</option>
                  {teamsList.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="modal-field full-width">
                <label>Member</label>
                <Select
                  isMulti
                  classNamePrefix="react-select"
                  options={membersList.map((m) => ({
                    value: m,
                    label: m,
                  }))}
                  value={form.member.map((m) => ({
                    value: m,
                    label: m,
                  }))}
                  onChange={(selected) =>
                    setForm((prev) => ({
                      ...prev,
                      member: selected ? selected.map((s) => s.value) : [],
                    }))
                  }
                />
              </div>

              <div className="modal-field">
                <label>Vehicle</label>
                <select
                  name="vehicle"
                  value={form.vehicle}
                  onChange={handleFormChange}
                >
                  <option value="">Select Vehicle</option>
                  {vehiclesList.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="modal-field">
                <label>Vehicle Out Time (SLT)</label>
                <input
                  type="time"
                  name="vehicleOutTime"
                  value={form.vehicleOutTime}
                  onChange={handleFormChange}
                />
              </div>

              <div className="modal-field">
                <label>Vehicle In Time (SLT)</label>
                <input
                  type="time"
                  name="vehicleInTime"
                  value={form.vehicleInTime}
                  onChange={handleFormChange}
                />
              </div>

              <div className="modal-field">
                <label>Total Assigned</label>
                <input
                  type="number"
                  name="totalAssigned"
                  placeholder="10"
                  min="0"
                  value={form.totalAssigned}
                  onChange={handleFormChange}
                />
              </div>

              <div className="modal-field">
                <label>Total Finished</label>
                <input
                  type="number"
                  name="totalFinished"
                  placeholder="8"
                  min="0"
                  value={form.totalFinished}
                  onChange={handleFormChange}
                />
              </div>

              <div className="modal-field">
                <label>1st Fault Time (SLT)</label>
                <input
                  type="time"
                  name="firstFaultTime"
                  value={form.firstFaultTime}
                  onChange={handleFormChange}
                />
              </div>

              <div className="modal-field">
                <label>Last Fault Time (SLT)</label>
                <input
                  type="time"
                  name="lastFaultTime"
                  value={form.lastFaultTime}
                  onChange={handleFormChange}
                />
              </div>

              <div className="modal-field">
                <label>Avg / Fault</label>
                <input
                  type="text"
                  name="avgFaultTime"
                  placeholder="30m"
                  value={form.avgFaultTime}
                  onChange={handleFormChange}
                />
              </div>

              <div className="modal-field">
                <label>Max Fault Time</label>
                <input
                  type="text"
                  name="maxFaultTime"
                  placeholder="1h 30m"
                  value={form.maxFaultTime}
                  onChange={handleFormChange}
                />
              </div>

            </div>

            {modalError && (
              <div className="modal-error">{modalError}</div>
            )}
            {modalSuccess && (
              <div className="modal-success">{modalSuccess}</div>
            )}

            <div className="modal-actions">
              <button className="modal-cancel" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="modal-submit"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save Entry"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}