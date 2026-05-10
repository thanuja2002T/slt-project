import "./FieldApp.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { supabase } from "../../lib/supabase";

export default function FieldApp() {

  const navigate = useNavigate();

  const [toastMessage, setToastMessage] = useState("");

  const [vehicleInput, setVehicleInput] = useState("");

  const [memberInput, setMemberInput] = useState("");

  const [selectedMembers, setSelectedMembers] = useState([]);

  const [started, setStarted] = useState(false);

  const [faultCount, setFaultCount] = useState(1);

  const [finished, setFinished] = useState(false);

  const [vehicleReturned, setVehicleReturned] = useState(false);

  const [faultType, setFaultType] = useState("");

  const vehicles = [
    "KA-1234",
    "KA-5678",
    "WP-2345",
  ];

  const members = [
    "Ajanthan",
    "Sasi",
    "Naren",
    "Kavi",
    "Thanuja",
  ];

  const faultTypes = [
    "FTTH",
    "PSTN",
    "Fiber Cut",
    "Router Issue",
    "Power Issue",
  ];

  // FILTERS

  const filteredVehicles = vehicles.filter((v) =>
    v.toLowerCase().includes(vehicleInput.toLowerCase())
  );

  const filteredMembers = members.filter((m) =>
    m.toLowerCase().includes(memberInput.toLowerCase())
  );

  // TOAST

  const showToast = (message) => {

    setToastMessage(message);

    setTimeout(() => {

      setToastMessage("");

    }, 3000);

  };

  // ADD MEMBER

  const addMember = (name) => {

    if (!selectedMembers.includes(name)) {

      setSelectedMembers([
        ...selectedMembers,
        name,
      ]);

    }

    setMemberInput("");

  };

  // REMOVE MEMBER

  const removeMember = (name) => {

    setSelectedMembers(
      selectedMembers.filter(
        (m) => m !== name
      )
    );

  };

  // START WORK

  const handleSubmit = async () => {

    if (
      !vehicleInput ||
      selectedMembers.length === 0
    ) {

      showToast("Fill all fields ⚠");

      return;

    }

    const { error } = await supabase
      .from("field_work")
      .insert([
        {
          vehicle: vehicleInput,

          members: selectedMembers,

          fault_number: 0,

          fault_type: "VEHICLE OUT",

          completed_time:
            new Date().toISOString(),
        },
      ]);

    if (error) {

      console.log(error);

      showToast("Start failed ❌");

      return;

    }

    setStarted(true);

    showToast("Vehicle out 🚀");

  };

  // SAVE FAULT

  const handleNext = async () => {

    if (!faultType) {

      showToast(
        "Select fault type ⚠"
      );

      return;

    }

    const { error } = await supabase
      .from("field_work")
      .insert([
        {
          vehicle: vehicleInput,

          members: selectedMembers,

          fault_number: faultCount,

          fault_type: faultType,

          completed_time:
            new Date().toISOString(),
        },
      ]);

    if (error) {

      console.log(error);

      showToast(
        "Database save failed ❌"
      );

      return;

    }

    showToast(
      `Fault ${faultCount} saved ✅`
    );

    setFaultCount(faultCount + 1);

    setFaultType("");

  };

  // FINISH DAY

  const handleFinish = async () => {

    const now =
      new Date().toISOString();

    const { error } = await supabase
      .from("field_work")
      .insert([
        {
          vehicle: vehicleInput,

          members: selectedMembers,

          fault_number:
            faultCount - 1,

          fault_type:
            "DAY FINISHED",

          finish_time: now,
        },
      ]);

    if (error) {

      console.log(error);

      showToast("Finish failed ❌");

      return;

    }

    setFinished(true);

    showToast(
      "Today work finished 🎉"
    );

  };

  // VEHICLE RETURN

  const handleVehicleIn = async () => {

    const now =
      new Date().toISOString();

    const { error } = await supabase
      .from("field_work")
      .insert([
        {
          vehicle: vehicleInput,

          members: selectedMembers,

          fault_number:
            faultCount - 1,

          fault_type:
            "VEHICLE RETURNED",

          vehicle_in_time: now,
        },
      ]);

    if (error) {

      console.log(error);

      showToast(
        "Vehicle return failed ❌"
      );

      return;

    }

    setVehicleReturned(true);

    showToast(
      "Vehicle returned successfully 🚘"
    );

  };

  const completedFaults =
    faultCount - 1;

  return (

    <div className="field-layout">

      {/* TOAST */}

      {toastMessage && (

        <div className="custom-toast">

          <div className="toast-dot"></div>

          <span>
            {toastMessage}
          </span>

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

      {/* TOP */}

      <div className="top-section">

        <h1>Field App</h1>

        <div className="form-box">

          {/* VEHICLE */}

          <div className="input-group">

            <label>
              Vehicle Number
            </label>

            <input
              placeholder="Type vehicle..."
              value={vehicleInput}
              onChange={(e) =>
                setVehicleInput(
                  e.target.value
                )
              }
            />

            {vehicleInput &&
              filteredVehicles.length > 0 && (

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
              placeholder="Type member..."
              value={memberInput}
              onChange={(e) =>
                setMemberInput(
                  e.target.value
                )
              }
            />

            {memberInput &&
              filteredMembers.length > 0 && (

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
                {selectedMembers.join(
                  ", "
                )}
              </p>

            </div>

            <div className="thank-box">

              <h2>
                🎉 You completed{" "}
                {completedFaults}
                {" "}faults today
              </h2>

              <p>
                Have a nice day 🙌
              </p>

              {!vehicleReturned ? (

                <button
                  className="vehicle-btn"
                  onClick={
                    handleVehicleIn
                  }
                >
                  🚗 Vehicle In
                </button>

              ) : (

                <div className="vehicle-done">

                  ✅ Vehicle Returned

                </div>

              )}

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
                {selectedMembers.join(
                  ", "
                )}
              </p>

            </div>

            <div className="fault-box">

              <h2>
                Fault {faultCount}
              </h2>

              {/* FAULT TYPE */}

              <div className="input-group">

                <label>
                  Fault Type
                </label>

                <select
                  value={faultType}
                  onChange={(e) =>
                    setFaultType(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Select Fault
                  </option>

                  {faultTypes.map(
                    (type, i) => (

                      <option
                        key={i}
                        value={type}
                      >
                        {type}
                      </option>

                    )
                  )}

                </select>

              </div>

              <div className="btn-group">

                <button
                  className="action-btn"
                  onClick={handleNext}
                >
                  Completed ✔
                </button>

                <button
                  className="finish-btn"
                  onClick={handleFinish}
                >
                  Finish for Today 🚀
                </button>

              </div>

            </div>

          </>

        )}

      </div>

    </div>

  );

}