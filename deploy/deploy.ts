import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { createInstances } from "../test/instance";
import { getSigners } from "../test/signers";
import { createTransaction } from "../test/utils";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const signers = await getSigners(ethers);

  const counterFactory = await ethers.getContractFactory("LoupGarou");
  const contract = await counterFactory.connect(signers.owner).deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`LoupGarou contract: `, contractAddress);

  const instances = await createInstances(contractAddress, ethers, signers);

  const roleWolf = instances.owner.encrypt8(1);
  const roleHuman = instances.owner.encrypt8(2);
  const roleSorcerer = instances.owner.encrypt8(3);

  var tx = await createTransaction(contract.setGameEnv, roleWolf, roleHuman, roleSorcerer);
  await tx.wait();
  console.log("game env set");
};
export default func;
func.id = "deploy_loupGarou"; // id required to prevent reexecution
func.tags = ["loupGarou"];
