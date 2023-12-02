import "./PlayerCard.css";
import React from "react";

function PlayerCard({ name, status }) {
  return (
    <div className={`PlayerCard ${status}`}>
      <p>{name}</p>
      {status === "offline" && <span className="status-indicator">Off</span>}
    </div>
  );
}

export default PlayerCard;
