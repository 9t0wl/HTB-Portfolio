import React from "react";
import { useParams } from "react-router-dom";
import { machines } from "../data/machines";
import "../pages/MachineDetail.css";

function MachineDetail() {
  const { machineName } = useParams();
  const machine = machines.find(
    (m) => m.name.toLowerCase() === machineName?.toLowerCase()
  );

  if (!machine) {
    return (
      <div className="machine-detail">
        <h1>Machine not found</h1>
        <p>The machine you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="machine-detail">
      <h1>{machine.name}</h1>
      <p>
        OS: {machine.os} | Difficulty: {machine.difficulty}
      </p>
      <div className="writeup-container">
        {machine.writeup?.map((Section, index) => (
          <Section key={index} />
        ))}
      </div>
    </div>
  );
}

export default MachineDetail;
