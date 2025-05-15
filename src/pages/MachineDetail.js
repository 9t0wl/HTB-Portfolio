// ✅ src/pages/MachineDetail.js
import React from "react";
import { useParams, Link } from "react-router-dom";
import { machines } from "../data/machines";
import "./MachineDetail.css";

export default function MachineDetail() {
  const { name } = useParams();
  const machine = machines.find(
    (m) => m.name.toLowerCase() === name.toLowerCase()
  );

  if (!machine) return <p>Machine not found.</p>;

  return (
    <div className="machine-detail">
      <h1>{machine.name}</h1>
      <p>
        <strong>OS:</strong> {machine.os} | <strong>Difficulty:</strong>{" "}
        {machine.difficulty}
      </p>

      <div className="writeup-container">
        {Array.isArray(machine.writeup) ? (
          machine.writeup.map((Component, index) => <Component key={index} />)
        ) : (
          <p>No writeup yet.</p>
        )}
      </div>

      <Link to="/">
        <button>Back to Home</button>
      </Link>
    </div>
  );
}
