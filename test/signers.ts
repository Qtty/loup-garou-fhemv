import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/dist/src/signer-with-address";

export interface Signers {
  owner: SignerWithAddress;
  alice: SignerWithAddress;
  bob: SignerWithAddress;
  carol: SignerWithAddress;
  dave: SignerWithAddress;
}

export const getSigners = async (ethers: any): Promise<Signers> => {
  const signers = await ethers.getSigners();
  return {
    owner: signers[4],
    alice: signers[0],
    bob: signers[1],
    carol: signers[2],
    dave: signers[3],
  };
};
