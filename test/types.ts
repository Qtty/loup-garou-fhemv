import type { FhevmInstance } from "fhevmjs";

import { EncryptedERC20 } from "../types";
import type { Signers } from "./signers";

declare module "mocha" {
  export interface Context {
    signers: Signers;
    contractAddress: string;
    instances: FhevmInstances;
    erc20: EncryptedERC20;
  }
}

export interface FhevmInstances {
  owner: FhevmInstance;
  alice: FhevmInstance;
  bob: FhevmInstance;
  carol: FhevmInstance;
  dave: FhevmInstance;
}
