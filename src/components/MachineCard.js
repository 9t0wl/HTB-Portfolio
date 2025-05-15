import React from "react";
import { Link } from "react-router-dom";
import "./MachineCard.css";

export default function MachineCard({
  name,
  os,
  difficulty,
  description,
  link,
}) {
  return (
    <div className="machine-card">
      <h2>{name}</h2>
      <div className="badge">
        {os} | {difficulty}
      </div>
      <p>{description}</p>
      <Link to={link}>
        <button>View Write-Up</button>
      </Link>
    </div>
  );
}
