import { useLocation } from "react-router-dom";
import { useState } from "react";
import "./FieldFaults.css";

export default function FieldFaults() {
  const location = useLocation();

  const params = new URLSearchParams(location.search);

  const vehicle = params.get("vehicle") || "No Vehicle";
  const members = params.get("members")
    ? params.get("members").split(",")
    : [];

  const [faultCount, setFaultCount] = useState(1);
  const [finished, setFinished] = useState(false);

  const handleNext = () => {
    setFaultCount(faultCount + 1);
  };

  const handleFinish = () => {
    setFinished(true);
  };

  // ✅ IMPORTANT CALCULATION
  const completedFaults = faultCount - 1;

  return (
    <div className="fault-container">
      <h1>Field Faults</h1>

      <div className="info-box">
        <p><strong>Vehicle:</strong> {vehicle}</p>
        <p><strong>Team:</strong> {members.join(", ")}</p>
      </div>

      {/* ✅ FINISHED SCREEN */}
      {finished ? (
        <div className="thank-box">
          <h2>
            🎉 You have completed {completedFaults} faults today.
          </h2>
          <p>Thank you, have a nice day 🙌</p>
        </div>
      ) : (
        <div className="fault-box">
          <h2>Fault {faultCount}</h2>

          <div className="btn-group">
            <button
              className="action-btn"
              onClick={handleNext}
            >
              Completed ✔
            </button>

            <button
              className="finish-btn"
              onClick={handleFinish}
            >
              Finish for Today & Vehicle In ✔
            </button>
          </div>
        </div>
      )}
    </div>
  );
}