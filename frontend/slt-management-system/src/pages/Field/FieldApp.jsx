import "./FieldApp.css";

import {
  useState,
  useEffect
} from "react";

import { useNavigate } from "react-router-dom";

import {
  IoArrowBack,
  IoNotifications
} from "react-icons/io5";

import { supabase } from "../../lib/supabase";

export default function FieldApp() {

  const navigate = useNavigate();

  /* =========================
     NOTIFICATIONS
  ========================= */

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [notifications, setNotifications] =
    useState([]);

useEffect(() => {

 const loadNotifications = async () => {

  const now = new Date();

  const sriLankaToday =
    new Date(
      now.toLocaleString(
        "en-US",
        {
          timeZone: "Asia/Colombo"
        }
      )
    );

  sriLankaToday.setHours(
    0,
    0,
    0,
    0
  );

  const todayISO =
    sriLankaToday.toISOString();

  const { data, error } =
    await supabase
      .from("notifications")
      .select("*")
      .gte(
        "created_at",
        todayISO
      )
      .order("created_at", {
        ascending: false
      });

  if (error) {

    console.log(error);

    return;
  }

  setNotifications(data || []);
};

  loadNotifications();

}, []);

  /* =========================
     STATES
  ========================= */


  const [vehicleInput, setVehicleInput] =
    useState("");

  const [memberInput, setMemberInput] =
    useState("");

  const [selectedMembers, setSelectedMembers] =
    useState([]);

  const [started, setStarted] =
    useState(false);

  const [faultCount, setFaultCount] =
    useState(1);

  const [finished, setFinished] =
    useState(false);

  const [entryPopup, setEntryPopup] =
    useState(false);

  const [popupMessage, setPopupMessage] =
    useState("");

  const [blinkCard, setBlinkCard] =
    useState(false);

  const [workId, setWorkId] =
    useState(null);

  const teamName =
  localStorage.getItem(
    "selectedTeam"
  ) || "";  


  /* =========================
     BACKEND DATA
  ========================= */

  const [vehicles, setVehicles] =
    useState([]);

  const [members, setMembers] =
    useState([]);

  

  useEffect(() => {

    const loadBackendData =
      async () => {

        /* VEHICLES */

        const {
          data: vehicleData
        } = await supabase
          .from("vehicles")
          .select("*")
          .order("id", {
            ascending: true
          });

        if (vehicleData) {

          setVehicles(
            vehicleData.map(
              (v) =>
                v.vehicle_number
            )
          );
        }

        /* MEMBERS */

        const {
          data: memberData
        } = await supabase
          .from("members")
          .select("*")
          .order("id", {
            ascending: true
          });

        if (memberData) {

          setMembers(
            memberData.map(
              (m) =>
                m.member_name
            )
          );
        }
      };

    loadBackendData();

  }, []);

  /* =========================
     RESTORE ACTIVE WORK
  ========================= */

  useEffect(() => {

    const loadActiveWork =
      async () => {

        const raw =
          localStorage.getItem(
            "activeWorkId"
          );

        if (!raw) return;

        let activeWorkId;

        try {

          const parsed =
            JSON.parse(raw);

          if (
            new Date().getTime() >
            parsed.expiry
          ) {

            localStorage.removeItem(
              "activeWorkId"
            );

            return;
          }

          activeWorkId = parsed.id;

        } catch {

          localStorage.removeItem(
            "activeWorkId"
          );

          return;

        }

        const { data, error } =
          await supabase
            .from("field_work")
            .select("*")
            .eq("id", activeWorkId)
            .single();

        if (error || !data)
          return;

        if (
          data.status === "Vehicle In"
        ) {

          localStorage.removeItem(
            "activeWorkId"
          );

          return;
        }

        if (data.team_name) {

          localStorage.setItem(
            "selectedTeam",
            data.team_name
          );

        }

        setWorkId(data.id);

        setVehicleInput(
          data.vehicle || ""
        );

        setSelectedMembers(
          data.members || []
        );

        setStarted(true);

        setFaultCount(
          (data.total_faults || 0) + 1
        );

      };

    loadActiveWork();

  }, []);

  /* =========================
     FILTERS
  ========================= */

  const filteredVehicles =
    vehicles.filter((v) =>
      v
        .toLowerCase()
        .includes(
          vehicleInput.toLowerCase()
        )
    );

  const filteredMembers =
    members.filter((m) =>
      m
        .toLowerCase()
        .includes(
          memberInput.toLowerCase()
        )
    );

  /* =========================
     ADD MEMBER
  ========================= */

  const addMember = (name) => {

    if (
      !selectedMembers.includes(name)
    ) {

      setSelectedMembers([
        ...selectedMembers,
        name
      ]);
    }

    setMemberInput("");
  };

  /* =========================
     REMOVE MEMBER
  ========================= */

  const removeMember = (name) => {

    setSelectedMembers(
      selectedMembers.filter(
        (m) => m !== name
      )
    );
  };

  /* =========================
     VEHICLE OUT
  ========================= */

  const handleSubmit = async () => {

    const raw =
      localStorage.getItem(
        "activeWorkId"
      );

    if (raw) {

      try {

        const parsed =
          JSON.parse(raw);

        if (
          new Date().getTime() <=
          parsed.expiry
        ) {

          alert(
            "Active work already exists"
          );

          return;

        } else {

          localStorage.removeItem(
            "activeWorkId"
          );

        }

      } catch {

        localStorage.removeItem(
          "activeWorkId"
        );

      }

    }

    if (
      !vehicleInput ||
      selectedMembers.length === 0
    ) {

      alert("Fill all fields");

      return;
    }

    const vehicleOutTime =
      new Date().toISOString();

    const { data, error } =
      await supabase
        .from("field_work")
        .insert([
          {
              team_name:
                  teamName,

               vehicle:
                  vehicleInput,

               members:
                 selectedMembers,

               vehicle_out_time:
                  vehicleOutTime,

               status:
                 "Vehicle Out",

               total_faults: 0,

            faults_time: []
          }
        ])
        .select()
        .single();

    if (error) {

      console.log(error);

      alert("Database error");

      return;
    }

    setWorkId(data.id);

    const now = new Date();

    const midnight = new Date(
      now.toLocaleString(
        "en-US",
        { timeZone: "Asia/Colombo" }
      )
    );

    midnight.setHours(23, 59, 59, 999);

    const expiry =
      midnight.getTime();

    localStorage.setItem(
      "activeWorkId",
      JSON.stringify({
        id: data.id,
        expiry
      })
    );

    showEntryPopup(
      "Vehicle Out Entry Added"
    );

    setStarted(true);
  };

  /* =========================
     FAULT COMPLETE
  ========================= */

const handleNext = async () => {

  const completedTime =
    new Date().toISOString();

  const newFaultCount =
    faultCount;

  /* GET CURRENT ARRAY */

  const {
    data: currentRow,
    error: fetchError
  } = await supabase
    .from("field_work")
    .select("faults_time")
    .eq("id", workId)
    .single();

  if (fetchError) {

    console.log(fetchError);

    return;
  }

  const existingFaults =
    currentRow?.faults_time || [];

  const updatedFaults = [

    ...existingFaults,

    {
      fault_no:
        newFaultCount,


      completed_time:
        completedTime
    }

  ];

  const { error } =
    await supabase
      .from("field_work")
      .update({

        completed_time:
          completedTime,

        total_faults:
          newFaultCount,

        faults_time:
          updatedFaults,

        status:
          "Fault Completed"

      })
      .eq("id", workId);

  if (error) {

    console.log(error);

    alert("Save failed");

    return;
  }

  showEntryPopup(
    `Fault ${newFaultCount} Completed`
  );

  setFaultCount(
    faultCount + 1
  );

  setBlinkCard(true);

  setTimeout(() => {

    setBlinkCard(false);

  }, 1000);

};

  /* =========================
     FINISH
  ========================= */

  const handleFinish = async () => {

    const finishTime =
      new Date().toISOString();

    const completedFaults =
      faultCount - 1;

    const { error } =
      await supabase
        .from("field_work")
        .update({

          finish_time:
            finishTime,

          vehicle_in_time:
            finishTime,

          total_faults:
            completedFaults,

          status:
            "Vehicle In"

        })
        .eq("id", workId);

    if (error) {

      console.log(error);

      alert("Finish save failed");

      return;
    }

    localStorage.removeItem(
      "activeWorkId"
    );

    showEntryPopup(
      "Vehicle In Saved Successfully"
    );

    setTimeout(() => {

      setFinished(true);

    }, 700);
  };

  const completedFaults =
    faultCount - 1;

  /* =========================
     POPUP
  ========================= */

  const showEntryPopup = (message) => {

    setPopupMessage(message);

    setEntryPopup(true);

    setTimeout(() => {

      setEntryPopup(false);

    }, 2500);

  };

  /* =========================
     JSX
  ========================= */

  return (

    <div className="field-layout">

      {/* ENTRY POPUP */}
      {entryPopup && (

        <div className="entry-popup">

          <div className="popup-icon">
            ✓
          </div>

          <div>

            <h4>
              Entry Added
            </h4>

            <p>
              {popupMessage}
            </p>

          </div>

        </div>

      )}

{/* =========================
   BELL
========================= */}

<div className="notification-wrapper">

  <button
    className="bell-btn"
    onClick={() =>
      setShowNotifications(
        !showNotifications
      )
    }
  >
    <IoNotifications />

    {notifications.length > 0 && (

      <span className="bell-count">
        {notifications.length}
      </span>

    )}

  </button>

  {/* NOTIFICATION POPUP */}

  {showNotifications && (

    <div className="notification-popup">

      <div className="notification-header">

        <h3>
          Notifications
        </h3>

        <button
          className="close-btn"
          onClick={() =>
            setShowNotifications(false)
          }
        >
          ✕
        </button>

      </div>

      <div className="notification-list">

        {notifications.length === 0 ? (

          <div className="empty-notification">
            No notifications today
          </div>

        ) : (

          notifications.map((n, i) => (

            <div
              key={i}
              className="notification-card"
            >

              <div className="notify-team">

                {n.team || "TEAM"}

              </div>

              <div className="notify-message">

                {n.message}

              </div>

            </div>

          ))

        )}

      </div>

    </div>

  )}

</div>

      {/* BACK */}
      <button
        className="back-btn"
        onClick={() =>
          navigate("/role")
        }
      >
        <IoArrowBack />
      </button>

      {/* TOP */}
      <div className="top-section">

        <h1>
          Field App
        </h1>



        <div className="form-box">

          {/* VEHICLE */}
          <div className="input-group">

            <label>
              Vehicle Number
            </label>

            <input
              type="text"
              placeholder="Type vehicle..."
              value={vehicleInput}
              onChange={(e) =>
                setVehicleInput(
                  e.target.value
                )
              }
              autoComplete="off"
            />

            {vehicleInput.trim() !== "" && (

              <div className="suggestions">

                {filteredVehicles.map(
                  (v, i) => (

                    <div
                      key={i}
                      className="suggestion-item"
                      onClick={() =>
                        setVehicleInput(v)
                      }
                    >
                      {v}
                    </div>

                  )
                )}

              </div>

            )}

          </div>

          {/* MEMBERS */}
          <div className="input-group">

            <label>
              Team Members
            </label>

            <input
              type="text"
              placeholder="Type member..."
              value={memberInput}
              onChange={(e) =>
                setMemberInput(
                  e.target.value
                )
              }
              autoComplete="off"
            />

            {memberInput.trim() !== "" && (

              <div className="suggestions">

                {filteredMembers.map(
                  (m, i) => (

                    <div
                      key={i}
                      className="suggestion-item"
                      onClick={() =>
                        addMember(m)
                      }
                    >
                      {m}
                    </div>

                  )
                )}

              </div>

            )}

            <div className="selected-members">

              {selectedMembers.map(
                (m, i) => (

                  <div
                    key={i}
                    className="member-chip"
                  >

                    {m}

                    <span
                      onClick={() =>
                        removeMember(m)
                      }
                    >
                      ✕
                    </span>

                  </div>

                )
              )}

            </div>

          </div>

          {!started && (

            <button
              className="submit-btn"
              onClick={handleSubmit}
            >
              Vehicle Out →
            </button>

          )}

        </div>

      </div>

      {/* BOTTOM */}
      <div className="bottom-section">

        {!started ? (

          <div className="placeholder">

            <h2>
              Fill details & start
            </h2>

          </div>

        ) : finished ? (

          <>
<div className="info-box">

  <p>
    <strong>Team Name:</strong>{" "}
    {teamName}
  </p>

  <p>
    <strong>Vehicle:</strong>{" "}
    {vehicleInput}
  </p>

  <p>
    <strong>Members:</strong>{" "}
    {selectedMembers.join(", ")}
  </p>

</div>

            <div className="thank-box">

              <div className="celebrate-icon">
                🚀
              </div>

              <h2 className="finish-title">

                You completed{" "}
                {completedFaults} faults today

              </h2>

              <p className="finish-sub">

                Vehicle In Successfully ✅

              </p>

            </div>
          </>

        ) : (

          <>
<div className="info-box">

  <p>
    <strong>Team Name:</strong>{" "}
    {teamName}
  </p>

  <p>
    <strong>Vehicle:</strong>{" "}
    {vehicleInput}
  </p>

  <p>
    <strong>Members:</strong>{" "}
    {selectedMembers.join(", ")}
  </p>

</div>

            <div
              className={`fault-box ${
                blinkCard
                  ? "fault-blink"
                  : ""
              }`}
            >

              <h2>
                Fault {faultCount}
              </h2>

              <div className="btn-group">

                <button
                  className="action-btn completed-effect"
                  onClick={handleNext}
                >
                  Completed ✔
                </button>

                <button
                  className="finish-btn"
                  onClick={handleFinish}
                >
                  Finish for Today and Vehicle In ✔
                </button>

              </div>

            </div>
          </>

        )}

      </div>

    </div>
  );
}