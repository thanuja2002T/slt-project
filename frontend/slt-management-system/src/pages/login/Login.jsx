import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [role, setRole] = useState("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = () => {
    // later connect backend
    if (role === "admin") {
      navigate("/dashboard");
    } else {
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

        <div className="role-container">
          <div
            className={`role-card ${role === "admin" ? "active" : ""}`}
            onClick={() => setRole("admin")}
          >
            🛡️
            <h3>Admin</h3>
            <p>Office / Supervisors</p>
          </div>

          <div
            className={`role-card ${role === "field" ? "active" : ""}`}
            onClick={() => setRole("field")}
          >
            🔧
            <h3>Field</h3>
            <p>Field Technicians</p>
          </div>
        </div>

        <div className="form-area">

          {/* ✅ USERNAME */}
          <div className="input-group">
            <label>USERNAME</label>
            <input
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* PASSWORD */}
          <div className="input-group">
            <label>PASSWORD</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="options">
            <label>
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <span className="forgot">Forgot password?</span>
          </div>

          <button className="login-btn" onClick={handleLogin}>
            Sign In →
          </button>
        </div>

        <p className="footer">
          Having trouble? Contact your administrator
        </p>

      </div>
    </div>
  );
}