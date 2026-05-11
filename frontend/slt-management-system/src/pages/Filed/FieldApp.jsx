import "./FieldApp.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

export default function FieldApp() {

  const navigate = useNavigate(); 

  const [vehicleInput, setVehicleInput] = useState("");
  const [memberInput, setMemberInput] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const [started, setStarted] = useState(false);
  const [faultCount, setFaultCount] = useState(1);
  const [finished, setFinished] = useState(false);

  const vehicles = ["GD 3705", "LF-6153", "PS-2390", "DAE 3945", "53-4251", "PG-9279", "YC-4304","LF 6150", "57-7429", "58-6225", "QR 8624", "DAC 7547", "57-7429", "QR 8626", "YC 4358","QR 8636", "253-7479", "53-1937", "PA 8300", "58-6225", "253-1876", "JK 1113"];
  const members = [
  "Tharsan",
  "M.Jana",
  "Johnson",
  "S.Ramesh",
  "Puvinath",
  "Kokolaramana",
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
  "Rathees",
  "Naren",
  "T.Suresh",
  "Niranjan",
  "Kavi",
  "Pakeer"
];

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

      {/* 🔙 BACK BUTTON */}
      <button className="back-btn" onClick={() => navigate("/role")}>
        <IoArrowBack />
      </button>

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