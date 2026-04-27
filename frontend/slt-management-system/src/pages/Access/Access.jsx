import "./Access.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Access() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleAccess = () => {
    if (password === "1234") {
      navigate("/role");
    } else {
      alert("Wrong password");
    }
  };

  return (
    <div className="access-container">

      {/* LEFT SIDE */}
      <div className="left-panel">
        <h1>SLT.Perform</h1>
        <p>Field Performance Monitoring System</p>
        <div className="glow"></div>
      </div>

      {/* RIGHT SIDE */}
      <div className="right-panel">

        <h2>Secure Access</h2>

        <input
          type="password"
          placeholder="Enter access password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAccess()}
        />

        <button onClick={handleAccess}>
          Continue →
        </button>

      </div>

    </div>
  );
}