import { useState, useEffect } from "react";
import { api } from "../../../api";
import "./DailyUpdate.css";

/* 🔹 TEAMS */
const allTeams = Array.from({ length: 18 }, (_, i) => `JA${i + 1}`);

/* 🔹 MEMBERS */
const membersList = [
  "Tharsan","M.Jana","Johnson","S.Ramesh","Puvinath",
  "Kokolaramana","Anpalagan","Thiva","Muruka","Sathees",
  "Nanthan","M.Suresh","Sivaratnam","Vikke","T.Sansu",
  "Anutharsan","Rajasimman","S.Vikna","Paventhan","Srikanth",
  "Jeyaraman","Ajanthan","Sasi","Rathees","Naren",
  "T.Suresh","Niranjan","Kavi","Pakeer"
];

/* 🔥 MULTI SELECT */
function MultiSelect({ team, defaultValue = [], onChange }) {
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState(defaultValue);

  useEffect(() => {
    setSelected(defaultValue);
  }, [defaultValue]);

  const filtered = membersList.filter(
    m =>
      m.toLowerCase().includes(input.toLowerCase()) &&
      !selected.includes(m)
  );

  const addMember = (name) => {
    const updated = [...selected, name];
    setSelected(updated);
    onChange(team, updated);
    setInput("");
  };

  const removeMember = (name) => {
    const updated = selected.filter(m => m !== name);
    setSelected(updated);
    onChange(team, updated);
  };

  return (
    <div className="multi-select">

      <div className="tags">
        {selected.map(m => (
          <span key={m} className="tag">
            {m}
            <button onClick={() => removeMember(m)}>×</button>
          </span>
        ))}
      </div>

      <input
        placeholder="Type member..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      {input && (
        <div className="dropdown">
          {filtered.length > 0 ? (
            filtered.map(m => (
              <div key={m} onClick={() => addMember(m)}>
                {m}
              </div>
            ))
          ) : (
            <div className="no-data">No match</div>
          )}
        </div>
      )}
    </div>
  );
}

/* 🔥 MAIN */
export default function DailyUpdate() {

  const today = new Date().toISOString().split("T")[0];

  const [step, setStep] = useState(1);

  /* 🔥 AUTO LOAD FROM LOCAL STORAGE */
  const [teamMembers, setTeamMembers] = useState(() => {
    const saved = localStorage.getItem("teamMembers");
    return saved ? JSON.parse(saved) : {};
  });

  const [teamData, setTeamData] = useState({});

  /* 🔥 AUTO SAVE */
  useEffect(() => {
    localStorage.setItem("teamMembers", JSON.stringify(teamMembers));
  }, [teamMembers]);

  /* STEP 1 → NEXT */
  const goNext = () => {

    const filtered = {};

    Object.keys(teamMembers).forEach(team => {
      if (teamMembers[team]?.length > 0) {
        filtered[team] = {
          members: teamMembers[team],
          ftthA: "",
          ftthB: "",
          pstnA: "",
          pstnB: ""
        };
      }
    });

    setTeamData(filtered);
    setStep(2);
  };

  /* UPDATE FAULTS */
  const update = (team, key, value) => {
    setTeamData(prev => ({
      ...prev,
      [team]: {
        ...prev[team],
        [key]: value
      }
    }));
  };

  /* MESSAGE */
  const generateMessage = () => {
    return Object.keys(teamData).map(team => {

      const t = teamData[team];

      let msg = `${team} ${t.members.join(", ")}`;

      if (t.ftthA)
        msg += ` FTTH-${t.ftthA}/${t.ftthB}`;

      if (t.pstnA)
        msg += ` PSTN-${t.pstnA}/${t.pstnB}`;

      return msg;

    }).join("\n");
  };

  /* SUBMIT */
  const submit = async () => {

    await api.saveDaily(teamData);

    const message = generateMessage();

    await api.sendNotification({
      message,
      date: today
    });

    alert("Sent to Field 🚀");

    // 🔥 BACK TO STEP 1 (KEEP DATA)
    setStep(1);
  };

  /* 🔥 END DAY */
  const endDay = () => {
    localStorage.removeItem("teamMembers");
    setTeamMembers({});
    setStep(1);
    alert("Day Closed ✅");
  };

  return (
    <div className="daily-page">

      <h1>Daily Update</h1>

      {/* STEP 1 */}
      {step === 1 && (
        <>
          <h3>Select Team Members</h3>

          {allTeams.map(team => (
            <div key={team} className="team-row">

              <label>{team}</label>

              <MultiSelect
                team={team}
                defaultValue={teamMembers[team] || []}
                onChange={(team, selected) => {
                  setTeamMembers(prev => ({
                    ...prev,
                    [team]: selected
                  }));
                }}
              />

            </div>
          ))}

          <button className="next" onClick={goNext}>
            Next →
          </button>

          <button className="end" onClick={endDay}>
            End for Today
          </button>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <h3>Enter Fault Details</h3>

          {Object.keys(teamData).map(team => {
            const t = teamData[team];

            return (
              <div key={team} className="team-card">

                <h4>{team} — {t.members.join(", ")}</h4>

                <div className="faults">
                  <input
                    placeholder="FTTH Assigned"
                    onChange={(e) => update(team, "ftthA", e.target.value)}
                  />

                  <input
                    placeholder="FTTH Attended"
                    onChange={(e) => update(team, "ftthB", e.target.value)}
                  />

                  <input
                    placeholder="PSTN Assigned"
                    onChange={(e) => update(team, "pstnA", e.target.value)}
                  />

                  <input
                    placeholder="PSTN Attended"
                    onChange={(e) => update(team, "pstnB", e.target.value)}
                  />
                </div>

              </div>
            );
          })}

          <button className="send" onClick={submit}>
            Send to Field 🚀
          </button>
        </>
      )}

    </div>
  );
}