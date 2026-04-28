import "./FieldApp.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FieldApp() {
  const [vehicleInput, setVehicleInput] = useState("");
  const [memberInput, setMemberInput] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const navigate = useNavigate();

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

  // 🔥 UPDATED SUBMIT (URL PARAMS)
  const handleSubmit = () => {
    if (!vehicleInput || selectedMembers.length === 0) {
      alert("Fill all fields");
      return;
    }

    const membersString = selectedMembers.join(",");

    navigate(
      `/field-faults?vehicle=${vehicleInput}&members=${membersString}`
    );
  };

  return (
    <div className="field-container">
      <h1>Field App</h1>

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

      {vehicleInput && selectedMembers.length > 0 && (
        <button className="submit-btn" onClick={handleSubmit}>
          Submit →
        </button>
      )}
    </div>
  );
}