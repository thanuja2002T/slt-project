import "./FieldApp.css";
import { useState } from "react";

export default function FieldApp() {
  const [vehicleInput, setVehicleInput] = useState("");
  const [memberInput, setMemberInput] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const [started, setStarted] = useState(false);
  const [faultCount, setFaultCount] = useState(1);
  const [finished, setFinished] = useState(false);

  const vehicles = ["KA-1234", "KA-5678", "WP-2345"];
  const members = ["Ajanthan", "Sasi", "Naren", "Kavi", "Thanuja"];

  const filteredVehicles = vehicles.filter((v) =>
    v.toLowerCase().includes(vehicleInput.toLowerCase())
  );

  const filteredMembers = members.filter((m) =>
    m.toLowerCase().includes(memberInput.toLowerCase())
  );

  const addMember = (name) => {
    if (!selectedMembers.includes(name)) {
      setSelectedMembers([...selectedMembers, name]);
    }
    setMemberInput("");
  };

  const removeMember = (name) => {
    setSelectedMembers(selectedMembers.filter((m) => m !== name));
  };

  const handleSubmit = () => {
    if (!vehicleInput || selectedMembers.length === 0) {
      alert("Fill all fields");
      return;
    }
    setStarted(true);
  };

  const handleNext = () => {
    setFaultCount(faultCount + 1);
  };

  const handleFinish = () => {
    setFinished(true);
  };

  const completedFaults = faultCount - 1;

  return (
    <div className="field-layout">

      {/* 🔝 TOP SECTION */}
      <div className="top-section">

        <h1>Field App</h1>

        <div className="form-box">

          {/* VEHICLE */}
          <div className="input-group">
            <label>Vehicle Number</label>

            <input
              placeholder="Type vehicle..."
              value={vehicleInput}
              onChange={(e) => setVehicleInput(e.target.value)}
            />

            {vehicleInput && filteredVehicles.length > 0 && (
              <div className="suggestions">
                {filteredVehicles.map((v, i) => (
                  <div
                    key={i}
                    className="suggestion-item"
                    onClick={() => setVehicleInput(v)}
                  >
                    {v}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MEMBERS */}
          <div className="input-group">
            <label>Team Members</label>

            <input
              placeholder="Type member..."
              value={memberInput}
              onChange={(e) => setMemberInput(e.target.value)}
            />

            {memberInput && filteredMembers.length > 0 && (
              <div className="suggestions">
                {filteredMembers.map((m, i) => (
                  <div
                    key={i}
                    className="suggestion-item"
                    onClick={() => addMember(m)}
                  >
                    {m}
                  </div>
                ))}
              </div>
            )}

            <div className="selected-members">
              {selectedMembers.map((m, i) => (
                <div key={i} className="member-chip">
                  {m}
                  <span onClick={() => removeMember(m)}>✕</span>
                </div>
              ))}
            </div>
          </div>

          {!started && (
            <button className="submit-btn" onClick={handleSubmit}>
              Start →
            </button>
          )}
        </div>
      </div>

      {/* 🔽 BOTTOM SECTION */}
<div className="bottom-section">

  {!started ? (
    <div className="placeholder">
      <h2>Fill details & start</h2>
    </div>
  ) : finished ? (
    <>
      <div className="info-box">
        <p><strong>Vehicle:</strong> {vehicleInput || "No Vehicle"}</p>
        <p><strong>Team:</strong> {selectedMembers.join(", ")}</p>
      </div>

      <div className="thank-box">
        <h2>🎉 You completed {completedFaults} faults today</h2>
        <p>Have a nice day 🙌</p>
      </div>
    </>
  ) : (
    <>
      <div className="info-box">
        <p><strong>Vehicle:</strong> {vehicleInput || "No Vehicle"}</p>
        <p><strong>Team:</strong> {selectedMembers.join(", ")}</p>
      </div>

      <div className="fault-box">
        <h2>Fault {faultCount}</h2>

        <div className="btn-group">
          <button className="action-btn" onClick={handleNext}>
            Completed ✔
          </button>

          <button className="finish-btn" onClick={handleFinish}>
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