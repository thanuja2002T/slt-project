import "./Access.css";
import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Access() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // ✅ NEW
  const navigate = useNavigate();

  const handleAccess = () => {
    setError(""); // clear old

    if (!password) {
      setError("Enter password");
      return;
    }

    if (password !== "1234") {
      setError("Wrong password"); // ❌ no alert
      return;
    }

    navigate("/role");
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
    <div className="access-container">

      {/* 🔴 TOAST */}
      {error && <div className="toast-error">{error}</div>}

      {/* LEFT SIDE */}
      <div className="left-panel">
        <h1>WELCOME-SLT</h1>
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