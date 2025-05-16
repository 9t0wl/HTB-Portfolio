import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { machines } from "../data/machines";
import "../pages/MachineDetail.css"; // We'll add CSS here

function MachineDetail() {
  const { machineName } = useParams();
  const navigate = useNavigate();

  const machine = machines.find(
    (m) => m.name.toLowerCase() === machineName?.toLowerCase()
  );

  if (!machine) {
    return (
      <div className="machine-detail">
        <h1>Machine not found</h1>
        <p>The machine you are looking for does not exist.</p>
        <div className="back-button-container">
          <button className="back-button" onClick={() => navigate("/")}>
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="machine-detail">
      {/* Optional: Top back button */}
      {/* <div className="back-button-container">
        <button className="back-button" onClick={() => navigate("/")}>
          ← Back to Home
        </button>
      </div> */}

      <h1>{machine.name}</h1>
      <p>
        OS: {machine.os} | Difficulty: {machine.difficulty}
      </p>

      <div className="writeup-container">
        {machine.writeup?.map((Section, index) => (
          <Section key={index} />
        ))}
      </div>

      {/* ✅ Sticky Floating Button */}
      <div className="sticky-back-button" onClick={() => navigate("/")}>
        ← Home
      </div>
    </div>
  );
}

export default MachineDetail;
