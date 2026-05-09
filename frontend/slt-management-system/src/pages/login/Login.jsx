import "./Login.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function RoleSelect() {

  const [role, setRole] = useState("admin");
  const [password, setPassword] = useState("");
  const [teamInput, setTeamInput] = useState("");
  const [error, setError] = useState("");

  // 🔥 TODAY UPDATE
 const [todayMessages, setTodayMessages] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const navigate = useNavigate();

  const teams = [
    "JA-01", "JA-02", "JA-03", "JA-04",
    "JA-05", "JA-06", "JA-07", "JA-08",
    "JA-09", "JA-10", "JA-11", "JA-12",
    "JA-13", "JA-14", "JA-15", "JA-16",
    "JA-17", "JA-18"
  ];

  const filteredTeams =
    teamInput.length > 0
      ? teams.filter((team) =>
          team.toLowerCase().includes(teamInput.toLowerCase())
        )
      : [];

  // 🔥 LOAD TODAY MESSAGE
const loadTodayMessage = async () => {

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const todayISO = today.toISOString();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .gte("created_at", todayISO)
    .order("created_at", { ascending: false });

  if (!error && data) {

    setTodayMessages(data);

  } else {

    console.log(error);

  }
};
  // 🔥 LOGIN
  const handleLogin = () => {

    setError("");

    if (role === "admin") {

      if (!password) {
        setError("Enter password");
        return;
      }

      if (password !== "1234") {
        setError("Wrong password");
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

  // 🔥 AUTO REMOVE ERROR
  useEffect(() => {

    if (error) {

      const timer = setTimeout(() => {
        setError("");
      }, 1200);

      return () => clearTimeout(timer);
    }

  }, [error]);

  return (
    <div className="login-container">

      {/* 🔴 ERROR TOAST */}
      {error && <div className="toast-error">{error}</div>}

      {/* 🔥 POPUP */}
      {showPopup && (
        <div className="popup-overlay">

          <div className="update-popup">

            <div className="popup-header">

              <h2>📢 Today Update</h2>

              <button
                className="close-btn"
                onClick={() => setShowPopup(false)}
              >
                ✕
              </button>

            </div>

            <div className="popup-content">

              <div className="popup-scroll">

            {todayMessages.map((item, index) => (

            <div key={index} className="message-card">

               <pre>{item.message}</pre>

             </div>

            ))}

           </div>

            </div>

          </div>

        </div>
      )}

      {/* LEFT */}
      <div className="left-panel">

        <h1>WELCOME-SLT</h1>

        <p>Field Performance Monitoring System</p>

        <div className="glow"></div>

      </div>

      {/* RIGHT */}
      <div className="right-panel">

        <div className="status">
          ● System Online — v2.4.1
        </div>

        <h2>Select your role</h2>

        {/* 🔥 SMALL TODAY UPDATE */}
      {role === "field" && todayMessages.length > 0 && (

          <div
            className="today-update-box"
            onClick={() => setShowPopup(true)}
          >

            <div className="update-dot"></div>

            <p>
              📢 Today new update available
            </p>

            <span>Click to view</span>

          </div>
        )}

        {/* ROLE CARDS */}
        <div className="role-container">

          {/* ADMIN */}
          <div
            className={`role-card ${role === "admin" ? "active" : ""}`}
            onClick={() => setRole("admin")}
          >
            🛡️
            <h3>Admin</h3>
          </div>

          {/* FIELD */}
          <div
            className={`role-card ${role === "field" ? "active" : ""}`}
            onClick={() => {
              setRole("field");
              loadTodayMessage();
            }}
          >
            🔧
            <h3>Field</h3>
          </div>

        </div>

        {/* ADMIN LOGIN */}
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

        {/* FIELD LOGIN */}
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

        {/* BUTTON */}
        <button
          className="login-btn"
          onClick={handleLogin}
        >
          Continue →
        </button>

      </div>

    </div>
  );
}