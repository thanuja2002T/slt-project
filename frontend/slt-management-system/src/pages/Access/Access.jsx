import "./Access.css";
import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function Access() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // ✅ NEW
  const navigate = useNavigate();
  const [loginPassword, setLoginPassword] =
  useState("");

  const loadSettings = async () => {

  const { data, error } =
    await supabase
      .from("app_settings")
      .select("*")
      .limit(1);

  if (!error && data.length > 0) {

    setLoginPassword(
      data[0].login_password || ""
    );

  } else {

    console.log(error);

  }

};

  useEffect(() => {

    const fetchData = async () => {

      await loadSettings();


    };

    fetchData();

  }, []);


  const handleAccess = () => {
    setError(""); // clear old

    if (!password) {
      setError("Enter password");
      return;
    }

    if (password !== loginPassword) {
  setError("Wrong password");
  return;
}

localStorage.setItem(
  "accessGranted",
  "true"
);

navigate("/role");
  };

  useEffect(() => {

  const accessGranted =
    localStorage.getItem(
      "accessGranted"
    );

  const isLoggedIn =
    localStorage.getItem(
      "isLoggedIn"
    );

  if (
    accessGranted === "true" &&
    isLoggedIn === "true"
  ) {

    navigate("/dashboard");

  }

}, [navigate]);

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