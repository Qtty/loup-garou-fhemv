// ContractContext.js
import abi from "./ContractA_ABI.json";
import { ethers } from "ethers";
import React, { createContext, useState, useContext } from "react";

// Define the shape of your context state
const ContractContext = createContext({
  provider: null,
  contract: null,
  contractABI: null,
  contractAddress: null,
  setProvider: () => {},
  setContract: () => {},
});

export const ContractProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);

  // Define your ABI and Contract Address here
  const contractABI = abi;
  const contractAddress = "0x44c92B40E02802B5626DF3638fa71827874E7c54";

  // Function to update the provider in the context
  const updateProvider = (newProvider) => {
    setProvider(newProvider);
  };

  // Function to update the contract in the context
  const updateContract = (newContract) => {
    setContract(newContract);
  };

  return (
    <ContractContext.Provider
      value={{
        provider,
        contract,
        contractABI,
        contractAddress,
        setProvider: updateProvider,
        setContract: updateContract,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};

export const useContract = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error("useContract must be used within a ContractProvider");
  }
  return context;
};
