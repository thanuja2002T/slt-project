import "./Login.css";
import { useState , useEffect  } from "react";
import { useNavigate } from "react-router-dom";

export default function RoleSelect() {
  const [role, setRole] = useState("admin");
  const [password, setPassword] = useState("");
  const [teamInput, setTeamInput] = useState("");
  const [error, setError] = useState(""); // ✅ NEW

  const navigate = useNavigate();

  const teams = ["JA-01", "JA-02", "JA-03", "JA-04", "JA-05", "JA-06", "JA-07", "JA-08", "JA-09", "JA-10", "JA-11", "JA-12", "JA-13", "JA-14", "JA-15", "JA-16", "JA-17", "JA-18"];

  const filteredTeams =
    teamInput.length > 0
      ? teams.filter((team) =>
          team.toLowerCase().includes(teamInput.toLowerCase())
        )
      : [];

  const handleLogin = () => {
    setError(""); // clear previous

    if (role === "admin") {
      if (!password) {
        setError("Enter password");
        return;
      }

      if (password !== "1234") {
        setError("Wrong password"); // ✅ NO alert
        return;
      }

      navigate("/dashboard");
    } else {
      if (!teamInput) {
        setError("Enter team name");
        return;
      }

      navigate("/field");
    }
  };

  useEffect(() => {
  if (error) {
    const timer = setTimeout(() => {
      setError("");
    }, 1000); 

    return () => clearTimeout(timer);
  }
}, [error]);

  return (
    <div className="login-container">

      {/* 🔴 TOAST MESSAGE */}
      {error && <div className="toast-error">{error}</div>}

      {/* LEFT SIDE */}
      <div className="left-panel">
        <h1>WELCOME-SLT</h1>
        <p>Field Performance Monitoring System</p>
        <div className="glow"></div>
      </div>

      {/* RIGHT SIDE */}
      <div className="right-panel">

        <div className="status">● System Online — v2.4.1</div>

        <h2>Select your role</h2>

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

        {/* ADMIN */}
        {role === "admin" && (
          <div className="input-group">
            <label>PASSWORD</label>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}

        {/* FIELD */}
        {role === "field" && (
          <div className="input-group">
            <label>TEAM NAME</label>
            <input
              placeholder="Type team..."
              value={teamInput}
              onChange={(e) => setTeamInput(e.target.value)}
            />

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
  );
}

