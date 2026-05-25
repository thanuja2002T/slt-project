import { useState, useEffect } from "react";
import "./DailyUpdate.css";
import { supabase } from "../../../lib/supabase";

/* =========================
   MULTI SELECT
========================= */

function MultiSelect({
  team,
  defaultValue = [],
  onChange,
  membersList
}) {

  const [input, setInput] =
    useState("");

  const selected =
    defaultValue || [];

  /* FILTER */
  const filtered =
    membersList.filter(
      m =>
        m
          .toLowerCase()
          .includes(
            input.toLowerCase()
          ) &&
        !selected.includes(m)
    );

  /* ADD */
  const addMember = (name) => {

    const updated = [
      ...selected,
      name
    ];

    onChange(team, updated);

    setInput("");
  };

  /* REMOVE */
  const removeMember = (name) => {

    const updated =
      selected.filter(
        m => m !== name
      );

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
          setInput(
            e.target.value
          )
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

  const [step, setStep] =
    useState(1);

  /* DATABASE */
  const [allTeams, setAllTeams] =
    useState([]);

  const [membersList, setMembersList] =
    useState([]);

  /* TEAM MEMBERS */
  const [teamMembers, setTeamMembers] =
    useState({});

  /* TEAM DATA */
  const [teamData, setTeamData] =
    useState({});

    const [popupMessage, setPopupMessage] =
  useState("");

const [showPopup, setShowPopup] =
  useState(false);

const showEntryPopup = (message) => {

  setPopupMessage(message);

  setShowPopup(true);

  setTimeout(() => {

    setShowPopup(false);

  }, 2500);

};
  /* =========================
   LOAD TEAMS
========================= */

const loadTeams = async () => {

  const { data, error } =
    await supabase
      .from("teams")
      .select("*")
      .order("team_name");

  if (!error && data) {

    setAllTeams(
      data.map(
        (t) => t.team_name
      )
    );
  }
};

/* =========================
   LOAD MEMBERS
========================= */

const loadMembers = async () => {

  const { data, error } =
    await supabase
      .from("members")
      .select("*")
      .order("member_name");

  if (!error && data) {

    setMembersList(
      data.map(
        (m) => m.member_name
      )
    );
  }
};

/* =========================
   LOAD DATABASE
========================= */

useEffect(() => {

  const fetchData = async () => {

    await loadTeams();

    await loadMembers();

  };

  fetchData();

}, []);

  /* NEXT */
  const goNext = () => {

    const filtered = {};

    Object.keys(teamMembers)
      .forEach(team => {

        if (
          teamMembers[team]
            ?.length > 0
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

  /* UPDATE */
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

const submit = async () => {

  try {

    /* =========================
       DAILY FAULTS SAVE
    ========================= */

    const dailyRows = [];

    Object.keys(teamData).forEach(team => {

      const t = teamData[team];

      const totalAssigned =
        Number(t.ftthA || 0) +
        Number(t.pstnA || 0) +
        Number(t.dataA || 0);

      const totalFinished =
        Number(t.ftthB || 0) +
        Number(t.pstnB || 0) +
        Number(t.dataB || 0);

      (t.members || []).forEach(member => {

        dailyRows.push({

          team: team,

          member: member,

          total_assigned: totalAssigned,

          total_finished: totalFinished

        });

      });

    });

    const {
      error: dailyError
    } = await supabase
      .from("daily_faults")
      .insert(dailyRows);

    if (dailyError) {

      console.log(dailyError);

      alert("Daily faults save failed");

      return;
    }

    /* =========================
       NOTIFICATIONS SAVE
    ========================= */

    const notifications =
      Object.keys(teamData)
        .map(team => {

          const t = teamData[team];

          return {

            team: team,

            message: `

${team}

Members:
${(t.members || []).join(", ")}

FTTH Assigned: ${t.ftthA || 0}
FTTH Finished: ${t.ftthB || 0}

PSTN Assigned: ${t.pstnA || 0}
PSTN Finished: ${t.pstnB || 0}

DATA Assigned: ${t.dataA || 0}
DATA Finished: ${t.dataB || 0}

`
          };

        });

    const {
      error: notificationError
    } = await supabase
      .from("notifications")
      .insert(notifications);

    if (notificationError) {

      console.log(notificationError);

      alert("Notification save failed");

      return;
    }

    /* =========================
       MODERN SUCCESS POPUP
    ========================= */

    showEntryPopup(
      "✅ Successfully Sent to Field"
    );

    /* CLEAR */

    setTeamMembers({});

    setTeamData({});

    setStep(1);

  } catch (err) {

    console.log(err);

    alert("Something went wrong");

  }

};



  /* END DAY */
  const endDay = () => {

    setTeamMembers({});

    setTeamData({});

    setStep(1);

    alert("Day Closed ✅");
  };

  return (
   <>

    <div className="daily-page">

      <h1>
        Daily Update
      </h1>

      {/* STEP 1 */}
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
                membersList={membersList}
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

      {/* STEP 2 */}
      {step === 2 && (
        <>

          <h3>
            Enter Fault Details
          </h3>

          {Object.keys(teamData)
            .map(team => {

              const t =
                teamData[team];

              return (

                <div
                  key={team}
                  className="team-card"
                >

                  <h4>
                    {team} —{" "}
                    {t.members.join(", ")}
                  </h4>

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
          <div className="daily-table-wrap">

            <table className="daily-table">

              <thead>

                <tr>

                  <th>TEAM</th>

                  <th>MEMBERS</th>

                  <th>FTTH</th>

                  <th>PSTN</th>

                  <th>DATA</th>

                  <th>COMPLETION</th>

                  <th>STATUS</th>

                </tr>

              </thead>

              <tbody>

                {Object.keys(teamData)
                  .map(team => {

                    const t =
                      teamData[team];

                    const ftthA =
                      Number(t.ftthA || 0);

                    const ftthB =
                      Number(t.ftthB || 0);

                    const pstnA =
                      Number(t.pstnA || 0);

                    const pstnB =
                      Number(t.pstnB || 0);

                    const dataA =
                      Number(t.dataA || 0);

                    const dataB =
                      Number(t.dataB || 0);

                    const totalAssigned =
                      ftthA +
                      pstnA +
                      dataA;

                    const totalDone =
                      ftthB +
                      pstnB +
                      dataB;

                    const percent =
                      totalAssigned > 0
                        ? Math.round(
                            (
                              totalDone /
                              totalAssigned
                            ) * 100
                          )
                        : 0;

                    return (

                      <tr key={team}>

                        <td>
                          {team}
                        </td>

                        <td>
                          {t.members.join(", ")}
                        </td>

                        <td>
                          {ftthB}/{ftthA}
                        </td>

                        <td>
                          {pstnB}/{pstnA}
                        </td>

                        <td>
                          {dataB}/{dataA}
                        </td>

                        <td>

                          <div className="progress-wrap">

                            <div className="progress-bar">

                              <div
                                className="progress-fill"
                                style={{
                                  width: `${percent}%`
                                }}
                              />

                            </div>

                            <span>
                              {percent}%
                            </span>

                          </div>

                        </td>

                        <td>

                          <span
                            className={
                              percent >= 70
                                ? "good"
                                : "bad"
                            }
                          >

                            {percent >= 70
                              ? "Good"
                              : "Behind"}

                          </span>

                        </td>

                      </tr>

                    );

                  })}

              </tbody>

            </table>

          </div>

        </>
      )}

    </div>
    {
    showPopup && (
      <div className="entry-popup">
        {popupMessage}
      </div>
    )
  }
</>
  );

  
}

