import { ethers } from "hardhat";

import type { LoupGarou } from "../../types";
import { getSigners } from "../signers";

export async function deployLoupGarouFixture(): Promise<LoupGarou> {
  const signers = await getSigners(ethers);

  const counterFactory = await ethers.getContractFactory("LoupGarou");
  const contract = await counterFactory.connect(signers.owner).deploy();
  await contract.waitForDeployment();

  return contract;
}
