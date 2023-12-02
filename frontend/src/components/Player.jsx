import { useContract } from "./Context/ContractProvider";
import React, { useState, useEffect } from "react";

const Player = ({ initialAddress, initialRole, initialStatus }) => {
  const [address, setAddress] = useState(initialAddress);
  const [role, setRole] = useState(initialRole);
  const [status, setStatus] = useState(initialStatus);
  const { provider, contract, contractABI, contractAddress, setProvider, setContract } = useContract();

  useEffect(() => {
    // Define getRole inside useEffect to use the most recent contract
    const getRole = async () => {
      if (contract) {
        try {
          // Replace 'publickey' and 'signature' with actual variables if needed
          const role = await contract.getRole(/* publickey, signature */);
          setRole(role);
          console.log(`player role: ${role}`);
        } catch (error) {
          console.error("Error fetching player role:", error);
        }
      }
    };

    // Call getRole once when the component mounts
    getRole();

    // Set up an interval to update the role every 5 seconds
    const intervalId = setInterval(getRole, 5000);

    // Clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [contract]); // Only re-run the effect if getContract function changes

  // Methods to update address and status could be replaced with inline arrow functions
  // in the JSX if you don't need them elsewhere

  return (
    <div className="player">
      <p>Address: {address}</p>
      <p>Role: {role || "Waiting for role"}</p>
      <p>Status: {status ? "Alive :)" : "Dead :("}</p>
      {/* Add buttons or other interactive elements to update the state here */}
    </div>
  );
};

export default Player;
