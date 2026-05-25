import "./Login.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function RoleSelect() {

  const navigate = useNavigate();

  /* =========================
     STATES
  ========================= */

  const [role, setRole] =
    useState("admin");

  const [password, setPassword] =
    useState("");

  const [teamInput, setTeamInput] =
    useState("");

  const [error, setError] =
    useState("");

  const [teams, setTeams] =
    useState([]);

  const [adminPassword, setAdminPassword] =
    useState("");

  const [todayMessages, setTodayMessages] =
    useState([]);

  const [showPopup, setShowPopup] =
    useState(false);

  /* =========================
     LOAD SETTINGS
  ========================= */

  const loadSettings = async () => {

    const { data, error } =
      await supabase
        .from("app_settings")
        .select("*")
        .limit(1);

    if (!error && data.length > 0) {

      setAdminPassword(
        data[0].admin_password || ""
      );
    }
  };

  /* =========================
     LOAD TEAMS
  ========================= */

  const loadTeams = async () => {

    const { data, error } =
      await supabase
        .from("teams")
        .select("*")
        .order("team_name", {
          ascending: true
        });

    if (!error && data) {

      setTeams(data);

    } else {

      console.log(error);
    }
  };

  /* =========================
     LOAD TODAY MESSAGES
  ========================= */

  const loadTodayMessage =
    async () => {

      const today = new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const todayISO =
        today.toISOString();

      const { data, error } =
        await supabase
          .from("notifications")
          .select("*")
          .gte(
            "created_at",
            todayISO
          )
          .order(
            "created_at",
            {
              ascending: false
            }
          );

      if (!error && data) {

        setTodayMessages(data);

      } else {

        console.log(error);
      }
    };

  /* =========================
     USE EFFECT
  ========================= */

  useEffect(() => {

    const fetchData = async () => {

      await loadSettings();

      await loadTeams();

    };

    fetchData();

  }, []);

  /* =========================
     FILTERED TEAMS
  ========================= */

  const filteredTeams =
    teamInput.length > 0

      ? teams.filter((team) =>

          team.team_name
            .toLowerCase()
            .includes(
              teamInput.toLowerCase()
            )
        )

      : [];

  /* =========================
     LOGIN
  ========================= */

  const handleLogin = () => {

    setError("");

    /* ADMIN */

    if (role === "admin") {

      if (!password) {

        setError(
          "Enter admin password"
        );

        return;
      }

      if (
        password !== adminPassword
      ) {

        setError(
          "Wrong admin password"
        );

        return;
      }

      navigate("/dashboard");
    }

    /* FIELD */

    else {

      if (!teamInput) {

        setError(
          "Select team"
        );

        return;
      }

      localStorage.setItem(
        "selectedTeam",
        teamInput
      );

      navigate("/field");
    }
  };

  /* =========================
     AUTO REMOVE ERROR
  ========================= */

  useEffect(() => {

    if (error) {

      const timer =
        setTimeout(() => {

          setError("");

        }, 1500);

      return () =>
        clearTimeout(timer);
    }

  }, [error]);

  /* =========================
     JSX
  ========================= */

  return (

    <div className="login-container">

      {/* ERROR */}
      {error && (

        <div className="toast-error">
          {error}
        </div>

      )}

      {/* POPUP */}
      {showPopup && (

        <div className="popup-overlay">

          <div className="update-popup">

            <div className="popup-header">

              <h2>
                📢 Today Update
              </h2>

              <button
                className="close-btn"
                onClick={() =>
                  setShowPopup(false)
                }
              >
                ✕
              </button>

            </div>

            <div className="popup-content">

              <div className="popup-scroll">

                {todayMessages.map(
                  (item, index) => (

                    <div
                      key={index}
                      className="message-card"
                    >

                      <pre>
                        {item.message}
                      </pre>

                    </div>

                  )
                )}

              </div>

            </div>

          </div>

        </div>

      )}

      {/* LEFT */}
      <div className="left-panel">

        <h1>
          WELCOME-SLT
        </h1>

        <p>
          Field Performance Monitoring System
        </p>

        <div className="glow"></div>

      </div>

      {/* RIGHT */}
      <div className="right-panel">

        <div className="status">
          ● System Online — v2.4.1
        </div>

        <h2>
          Select your role
        </h2>



        {/* ROLE */}
        <div className="role-container">

          {/* ADMIN */}
          <div
            className={`role-card ${
              role === "admin"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setRole("admin")
            }
          >

            🛡️

            <h3>
              Admin
            </h3>

          </div>

          {/* FIELD */}
          <div
            className={`role-card ${
              role === "field"
                ? "active"
                : ""
            }`}
            onClick={() => {

              setRole("field");

              loadTodayMessage();

            }}
          >

            🔧

            <h3>
              Field
            </h3>

          </div>

        </div>

        {/* TEAM SELECT */}
        {role === "field" && (

          <div className="input-group">

            <label>
              TEAM NAME
            </label>

            <input
              placeholder="Type team..."
              value={teamInput}
              onChange={(e) =>
                setTeamInput(
                  e.target.value
                )
              }
            />

            {filteredTeams.length > 0 && (

              <div className="suggestions">

                {filteredTeams.map(
                  (team) => (

                    <div
                      key={team.id}
                      className="suggestion-item"
                      onClick={() =>
                        setTeamInput(
                          team.team_name
                        )
                      }
                    >

                      {team.team_name}

                    </div>

                  )
                )}

              </div>
            )}

          </div>
        )}

        {/* ADMIN PASSWORD */}
        {role === "admin" && (

          <div className="input-group">

            <label>
              ADMIN PASSWORD
            </label>

            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
            />

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