import "./FieldApp.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

export default function FieldApp() {

  const navigate = useNavigate();

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

  /* 🔥 NEW */
  const [showToast, setShowToast] =
    useState(false);

  const [blinkCard, setBlinkCard] =
    useState(false);

  /* =========================
     VEHICLES
  ========================= */

  const vehicles = [
    "GD 3705",
    "LF-6153",
    "PS-2390",
    "DAE 3945",
    "53-4251",
    "PG-9279",
    "YC-4304",
    "LF 6150",
    "57-7429",
    "58-6225",
    "QR 8624",
    "DAC 7547",
    "57-7429",
    "QR 8626",
    "YC 4358",
    "QR 8636",
    "253-7479",
    "53-1937",
    "PA 8300",
    "58-6225",
    "253-1876",
    "JK 1113"
  ];

  /* =========================
     MEMBERS
  ========================= */

  const members = [
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
     START
  ========================= */

  const handleSubmit = () => {

    if (
      !vehicleInput ||
      selectedMembers.length === 0
    ) {

      alert("Fill all fields");

      return;
    }

    setStarted(true);
  };

  /* =========================
     NEXT FAULT
  ========================= */

  const handleNext = () => {

    setFaultCount(
      faultCount + 1
    );

    /* 🔥 TOAST */
    setShowToast(true);

    /* 🔥 BLINK */
    setBlinkCard(true);

    setTimeout(() => {
      setShowToast(false);
    }, 2000);

    setTimeout(() => {
      setBlinkCard(false);
    }, 1000);

  };

  /* =========================
     FINISH
  ========================= */

  const handleFinish = () => {

    setFinished(true);
  };

  const completedFaults =
    faultCount - 1;

  /* =========================
     JSX
  ========================= */

  return (
    <div className="field-layout">

      {/* 🔥 SUCCESS TOAST */}
      {showToast && (

        <div className="toast-success">
          Fault Completed Successfully ✓
        </div>

      )}

      {/* BACK BUTTON */}
      <button
        className="back-btn"
        onClick={() =>
          navigate("/role")
        }
      >
        <IoArrowBack />
      </button>

      {/* TOP SECTION */}
      <div className="top-section">

        <h1>Field App</h1>

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

                {filteredVehicles.length > 0 ? (

                  filteredVehicles.map(
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
                  )

                ) : (

                  <div className="suggestion-item">
                    No vehicle found
                  </div>

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

                {filteredMembers.length > 0 ? (

                  filteredMembers.map(
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
                  )

                ) : (

                  <div className="suggestion-item">
                    No member found
                  </div>

                )}

              </div>
            )}

            {/* SELECTED MEMBERS */}
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

          {/* START BUTTON */}
          {!started && (
            <button
              className="submit-btn"
              onClick={handleSubmit}
            >
              Start →
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
                <strong>
                  Vehicle:
                </strong>{" "}
                {vehicleInput}
              </p>

              <p>
                <strong>
                  Team:
                </strong>{" "}
                {selectedMembers.join(", ")}
              </p>

            </div>

            <div className="thank-box">

              <h2>
                🎉 You completed{" "}
                {completedFaults} faults today
              </h2>

              <p>
                Have a nice day 🙌
              </p>

            </div>
          </>

        ) : (

          <>
            <div className="info-box">

              <p>
                <strong>
                  Vehicle:
                </strong>{" "}
                {vehicleInput}
              </p>

              <p>
                <strong>
                  Team:
                </strong>{" "}
                {selectedMembers.join(", ")}
              </p>

            </div>

            {/* 🔥 BLINK EFFECT */}
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
                  Finish for Today 
                </button>

              </div>

            </div>
          </>

        )}

      </div>

    </div>
  );
}