import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/dist/src/signer-with-address";

export interface Signers {
  owner: SignerWithAddress;
  alice: SignerWithAddress;
  bob: SignerWithAddress;
  carol: SignerWithAddress;
  dave: SignerWithAddress;
  player5: SignerWithAddress;
  player6: SignerWithAddress;
  player7: SignerWithAddress;
  player8: SignerWithAddress;
}

export const getSigners = async (ethers: any): Promise<Signers> => {
  const signers = await ethers.getSigners();
  return {
    owner: signers[0],
    alice: signers[1],
    bob: signers[2],
    carol: signers[3],
    dave: signers[4],
    player5: signers[5],
    player6: signers[6],
    player7: signers[7],
    player8: signers[8],
  };
};
