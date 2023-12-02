import PlayerCard from "../PlayerCard/PlayerCard";
import "./PlayerList.css";
import React from "react";

function PlayerList() {
  // Placeholder for player data
  const players = [
    { name: "Player1", status: "online" },
    { name: "Player2", status: "offline" },
    // ...
  ];

  return (
    <div className="PlayerList">
      {players.map((player, index) => (
        <PlayerCard key={index} name={player.name} status={player.status} />
      ))}
    </div>
  );
}

export default PlayerList;
