import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/dist/src/signer-with-address";
import type { FhevmInstance } from "fhevmjs";

import { LoupGarou } from "../types";
import type { Signers } from "./signers";

declare module "mocha" {
  export interface Context {
    signers: Signers;
    contractAddress: string;
    instances: FhevmInstances;
    loupGarou: LoupGarou;
    players: Array<Player>;
  }
}

export interface FhevmInstances {
  owner: FhevmInstance;
  alice: FhevmInstance;
  bob: FhevmInstance;
  carol: FhevmInstance;
  dave: FhevmInstance;
  player5: FhevmInstance;
  player6: FhevmInstance;
  player7: FhevmInstance;
  player8: FhevmInstance;
}

export interface Player {
  name: String;
  instance: FhevmInstance;
  signer: SignerWithAddress;
  id: number;
  role: number;
}
