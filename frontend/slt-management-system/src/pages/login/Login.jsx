import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RoleSelect() {
  const [role, setRole] = useState("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [teamInput, setTeamInput] = useState("");

  const navigate = useNavigate();

  const teams = [
    "JA1 Colombo",
    "JA11 Colombo",
    "JA2 Jaffna",
    "JA3 Kandy"
  ];

  // ✅ FILTER ONLY WHEN TYPING
  const filteredTeams =
    teamInput.length > 0
      ? teams.filter(team =>
          team.toLowerCase().includes(teamInput.toLowerCase())
        )
      : [];

  const handleLogin = () => {
    if (role === "admin") {
      navigate("/dashboard");
    } else {
      if (!teamInput) return alert("Enter team name");
      navigate("/field");
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">

        <div className="status">● System Online — v2.4.1</div>

        <h1 className="title">
          SLT<span>.</span>Perform
        </h1>

        <p className="subtitle">
          Sri Lanka Telecom · Field Performance Analysis System
        </p>

        <p className="role-text">Select your role to continue</p>

        {/* ROLE SELECT */}
        <div className="role-container">
          <div
            className={`role-card ${role === "admin" ? "active" : ""}`}
            onClick={() => setRole("admin")}
          >
            🛡️
            <h3>Admin</h3>
          </div>

          <div
            className={`role-card ${role === "field" ? "active" : ""}`}
            onClick={() => setRole("field")}
          >
            🔧
            <h3>Field</h3>
          </div>
        </div>

        <div className="form-area">

          {/* ADMIN FORM */}
          {role === "admin" && (
            <>
              <div className="input-group">
                <label>USERNAME</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>PASSWORD</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </>
          )}

          {/* FIELD FORM */}
          {role === "field" && (
            <div className="input-group">
              <label>TEAM NAME</label>
              <input
                placeholder="Type team..."
                value={teamInput}
                onChange={(e) => setTeamInput(e.target.value)}
              />

              {/* ✅ SHOW ONLY WHEN TYPING */}
              {filteredTeams.length > 0 && (
                <div className="suggestions">
                  {filteredTeams.map((team, i) => (
                    <div
                      key={i}
                      className="suggestion-item"
                      onClick={() => setTeamInput(team)}
                    >
                      {team}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button className="login-btn" onClick={handleLogin}>
            Continue →
          </button>

        </div>

      </div>
    </div>
  );
}