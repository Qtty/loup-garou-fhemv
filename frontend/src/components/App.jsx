// Assuming ContractA's ABI and address are available
import { ContractProvider } from "./Context/ContractProvider";
import Player from "./Player";
import Registration from "./Registration";
import React, { useState } from "react";

const App = () => {
  const [player, setPlayer] = useState(null);
  const [registered, setRegistered] = useState(false);

  // These updater functions will be passed down to components as needed
  const updatePlayer = (playerData) => setPlayer(playerData);
  const updateRegistration = (isRegistered) => setRegistered(isRegistered);

  return (
    <ContractProvider>
      <div className="App">
        {registered ? (
          <Player initialAddress={player.address} initialRole={player.role} initialStatus={player.status} />
        ) : (
          <Registration updatePlayer={updatePlayer} updateRegistration={updateRegistration} />
        )}
      </div>
    </ContractProvider>
  );
};

export default App;
