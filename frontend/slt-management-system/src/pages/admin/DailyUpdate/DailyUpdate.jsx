import { useState, useEffect } from "react";
import { api } from "../../../api";
import "./DailyUpdate.css";

/* =========================
   TEAMS
========================= */
const allTeams = Array.from(
  { length: 18 },
  (_, i) => `JA${i + 1}`
);

/* =========================
   MEMBERS
========================= */
const membersList = [
  "Tharsan",
  "M.Jana",
  "Johnson",
  "S.Ramesh",
  "Puvinath",
  "Kokilaraman",
  "Anpalagan",
  "Thiva",
  "Muruka",
  "Sathees",
  "Nanthan",
  "M.Suresh",
  "Sivaratnam",
  "Vikke",
  "T.Sansu",
  "Anutharsan",
  "Rajasimman",
  "S.Vikna",
  "Paventhan",
  "Srikanth",
  "Jeyaraman",
  "Ajanthan",
  "Sasi",
  "Mathavan",
  "Rathees",
  "Naren",
  "T.Suresh",
  "Niranjan",
  "Kavi",
  "Pakeer"
];

/* =========================
   MULTI SELECT
========================= */
function MultiSelect({
  team,
  defaultValue = [],
  onChange
}) {

  const [input, setInput] = useState("");
  const [selected, setSelected] =
    useState(defaultValue);

  useEffect(() => {
    setSelected(defaultValue);
  }, [defaultValue]);

  const filtered = membersList.filter(
    m =>
      m
        .toLowerCase()
        .includes(input.toLowerCase()) &&
      !selected.includes(m)
  );

  const addMember = (name) => {

    const updated = [...selected, name];

    setSelected(updated);

    onChange(team, updated);

    setInput("");
  };

  const removeMember = (name) => {

    const updated = selected.filter(
      m => m !== name
    );

    setSelected(updated);

    onChange(team, updated);
  };

  return (
    <div className="multi-select">

      {/* TAGS */}
      <div className="tags">

        {selected.map(m => (
          <span
            key={m}
            className="tag"
          >
            {m}

            <button
              onClick={() =>
                removeMember(m)
              }
            >
              ×
            </button>

          </span>
        ))}

      </div>

      {/* INPUT */}
      <input
        placeholder="Type member..."
        value={input}
        onChange={(e) =>
          setInput(e.target.value)
        }
      />

      {/* DROPDOWN */}
      {input && (
        <div className="dropdown">

          {filtered.length > 0 ? (

            filtered.map(m => (
              <div
                key={m}
                onClick={() =>
                  addMember(m)
                }
              >
                {m}
              </div>
            ))

          ) : (

            <div className="no-data">
              No match
            </div>

          )}

        </div>
      )}

    </div>
  );
}

/* =========================
   MAIN COMPONENT
========================= */
export default function DailyUpdate() {

  const today = new Date()
    .toISOString()
    .split("T")[0];

  /* STEP */
  const [step, setStep] = useState(1);

  /* AUTO SAVE TEAM MEMBERS */
  const [teamMembers, setTeamMembers] =
    useState(() => {

      const saved =
        localStorage.getItem(
          "teamMembers"
        );

      return saved
        ? JSON.parse(saved)
        : {};
    });

  /* TEAM DATA */
  const [teamData, setTeamData] =
    useState({});

  /* AUTO SAVE */
  useEffect(() => {

    localStorage.setItem(
      "teamMembers",
      JSON.stringify(teamMembers)
    );

  }, [teamMembers]);

  /* NEXT PAGE */
  const goNext = () => {

    const filtered = {};

    Object.keys(teamMembers)
      .forEach(team => {

        if (
          teamMembers[team]?.length > 0
        ) {

          filtered[team] =
            teamData[team] || {

              members:
                teamMembers[team],

              ftthA: "",
              ftthB: "",

              pstnA: "",
              pstnB: "",

              dataA: "",
              dataB: ""
            };
        }

      });

    setTeamData(filtered);

    setStep(2);
  };

  /* UPDATE FAULT INPUTS */
  const update = (
    team,
    key,
    value
  ) => {

    setTeamData(prev => ({
      ...prev,

      [team]: {
        ...prev[team],
        [key]: value
      }
    }));
  };

  /* GENERATE MESSAGE */
  const generateMessage = () => {

    return Object.keys(teamData)
      .map(team => {

        const t = teamData[team];

        let msg =
          `${team} ` +
          `${t.members.join(", ")}`;

        if (t.ftthA)
          msg +=
            ` FTTH-${t.ftthA}/${t.ftthB}`;

        if (t.pstnA)
          msg +=
            ` PSTN-${t.pstnA}/${t.pstnB}`;

        if (t.dataA)
          msg +=
            ` DATA-${t.dataA}/${t.dataB}`;

        return msg;

      })
      .join("\n");
  };

  /* SEND */
  const submit = async () => {

  try {

    const message =
      generateMessage();

    console.log(message);

    alert("Sent to Field");

    /* CLEAR SECOND PAGE DATA */
    setTeamData({});

    /* GO BACK TO PAGE 1 */
    setStep(1);

  } catch (err) {

    console.log(err);

    alert("Something went wrong");

  }

};

  /* END DAY */
  const endDay = () => {

    localStorage.removeItem(
      "teamMembers"
    );

    setTeamMembers({});

    setTeamData({});

    setStep(1);

    alert("Day Closed ✅");
  };

  return (
    <div className="daily-page">

      <h1>Daily Update</h1>

      {/* =========================
          STEP 1
      ========================= */}
      {step === 1 && (
        <>

          <h3>
            Select Team Members
          </h3>

          {allTeams.map(team => (

            <div
              key={team}
              className="team-row"
            >

              <label>
                {team}
              </label>

              <MultiSelect
                team={team}
                defaultValue={
                  teamMembers[team] || []
                }
                onChange={(
                  team,
                  selected
                ) => {

                  setTeamMembers(
                    prev => ({
                      ...prev,
                      [team]:
                        selected
                    })
                  );

                }}
              />

            </div>
          ))}

          <div className="buttons">

            <button
              className="next"
              onClick={goNext}
            >
              Next →
            </button>

            <button
              className="end"
              onClick={endDay}
            >
              End for Today
            </button>

          </div>

        </>
      )}

      {/* =========================
          STEP 2
      ========================= */}
      {step === 2 && (
        <>

          <h3>
            Enter Fault Details
          </h3>

          {Object.keys(teamData)
            .map((team, i) => {

              const t = teamData[team];

              return (
                <div
                  key={team}
                  className="team-card"
                >

                  <h4>
                    {team} —{" "}
                    {t.members.join(", ")}
                  </h4>

                  {/* FAULTS */}
                  <div className="faults-grid">

                    {/* FTTH */}
                    <div className="fault-group">

                      <div className="fault-group-title">
                        FTTH Faults
                      </div>

                      <div className="fault-pair">

                        <input
                          type="number"
                          placeholder="FTTH Assigned"
                          value={t.ftthA}
                          onChange={(e) =>
                            update(
                              team,
                              "ftthA",
                              e.target.value
                            )
                          }
                        />

                        <input
                          type="number"
                          placeholder="FTTH Attended"
                          value={t.ftthB}
                          onChange={(e) =>
                            update(
                              team,
                              "ftthB",
                              e.target.value
                            )
                          }
                        />

                      </div>

                    </div>

                    {/* PSTN */}
                    <div className="fault-group">

                      <div className="fault-group-title">
                        PSTN Faults
                      </div>

                      <div className="fault-pair">

                        <input
                          type="number"
                          placeholder="PSTN Assigned"
                          value={t.pstnA}
                          onChange={(e) =>
                            update(
                              team,
                              "pstnA",
                              e.target.value
                            )
                          }
                        />

                        <input
                          type="number"
                          placeholder="PSTN Attended"
                          value={t.pstnB}
                          onChange={(e) =>
                            update(
                              team,
                              "pstnB",
                              e.target.value
                            )
                          }
                        />

                      </div>

                    </div>

                    {/* DATA */}
                    <div className="fault-group">

                      <div className="fault-group-title">
                        DATA Faults
                      </div>

                      <div className="fault-pair">

                        <input
                          type="number"
                          placeholder="DATA Assigned"
                          value={t.dataA}
                          onChange={(e) =>
                            update(
                              team,
                              "dataA",
                              e.target.value
                            )
                          }
                        />

                        <input
                          type="number"
                          placeholder="DATA Attended"
                          value={t.dataB}
                          onChange={(e) =>
                            update(
                              team,
                              "dataB",
                              e.target.value
                            )
                          }
                        />

                      </div>

                    </div>

                  </div>

                </div>
              );
            })}

          {/* SEND */}
          <button
            className="send"
            onClick={submit}
          >
            Send to Field 
          </button>

          {/* TABLE */}
          <div className="manager-section">

            <div className="card">

              <table>

                <thead>

                  <tr>

                    <th>Team</th>

                    <th>Members</th>

                    <th>FTTH</th>

                    <th>PSTN</th>

                    <th>DATA</th>

                    <th>Completion</th>

                    <th>Status</th>

                  </tr>

                </thead>

                <tbody>

                  {Object.keys(teamData)
                    .map((team, i) => {

                      const t =
                        teamData[team];

                      const assigned =

                        parseInt(
                          t.ftthA || 0
                        ) +

                        parseInt(
                          t.pstnA || 0
                        ) +

                        parseInt(
                          t.dataA || 0
                        );

                      const attended =

                        parseInt(
                          t.ftthB || 0
                        ) +

                        parseInt(
                          t.pstnB || 0
                        ) +

                        parseInt(
                          t.dataB || 0
                        );

                      const percent =

                        assigned > 0

                          ? Math.round(
                              (
                                attended /
                                assigned
                              ) * 100
                            )

                          : 0;

                      let status =
                        "Done";

                      if (
                        percent < 100 &&
                        percent >= 60
                      ) {
                        status =
                          "Active";
                      }

                      if (
                        percent < 60
                      ) {
                        status =
                          "Behind";
                      }

                      return (
                        <tr key={i}>

                          <td>
                            {team}
                          </td>

                          <td>
                            {t.members.join(
                              ", "
                            )}
                          </td>

                          <td>
                            {t.ftthA || 0}
                            /
                            {t.ftthB || 0}
                          </td>

                          <td>
                            {t.pstnA || 0}
                            /
                            {t.pstnB || 0}
                          </td>

                          <td>
                            {t.dataA || 0}
                            /
                            {t.dataB || 0}
                          </td>

                          <td>

                            <div className="progress">

                              <div
                                style={{
                                  width:
                                    `${percent}%`
                                }}
                              ></div>

                            </div>

                            <span>
                              {percent}%
                            </span>

                          </td>

                          <td>

                            <span
                              className={`status ${status.toLowerCase()}`}
                            >
                              {status}
                            </span>

                          </td>

                        </tr>
                      );
                    })}

                </tbody>

              </table>

            </div>

          </div>

        </>
      )}

    </div>
  );
}