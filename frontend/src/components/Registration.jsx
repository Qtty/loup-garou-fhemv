import { useContract } from "./Context/ContractProvider";
import { ethers } from "ethers";
import React, { useState, useEffect } from "react";

const Registration = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [playersLeft, setPlayersLeft] = useState(null);

  const { provider, contract, contractABI, contractAddress, setProvider, setContract } = useContract();

  useEffect(() => {
    // Define the function inside useEffect so it has access to the contract from the context
    const fetchPlayerCount = async () => {
      if (contract && isLoading) {
        try {
          const playerCount = await contract.getPlayersLeftToRegister();
          console.log(`players left: ${playerCount}`);
          setPlayersLeft(playerCount);
          if (playerCount === 0) {
            props.updateRegistration(true);
          }
        } catch (error) {
          console.error("Error fetching player count:", error);
        }
      }
    };

    // Call the function immediately to fetch the player count
    fetchPlayerCount();

    // Set up an interval to update the player count every 5 seconds
    const intervalId = setInterval(fetchPlayerCount, 5000);

    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [contract, isLoading]); // Only re-run the effect if the contract or isLoading objects change

  const handleRegistration = async () => {
    // Check if Ethereum provider (MetaMask) is available
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const newProvider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = newProvider.getSigner();
        const newContract = new ethers.Contract(contractAddress, contractABI, signer);

        // Update the provider and contract in the global state
        setProvider(newProvider);
        setContract(newContract);

        const tx = await newContract.registerForGame();
        console.log("Transaction sent:", tx.hash);
        await tx.wait();
        console.log("Registered for game");

        const playerData = {
          address: await signer.getAddress(),
          role: null, // Placeholder until role is assigned
          status: true,
        };

        // Update player info and set loading state
        props.updatePlayer(playerData);
        setIsLoading(true);
      } catch (error) {
        console.error("Could not connect to MetaMask:", error);
      }
    } else {
      console.error("Please install MetaMask to continue.");
    }
  };

  return (
    <div>
      {isLoading ? (
        <div className="loading">Loading... {`${playersLeft} players left to register.`}</div>
      ) : (
        <button onClick={handleRegistration}>Register for Game</button>
      )}
    </div>
  );
};

export default Registration;
