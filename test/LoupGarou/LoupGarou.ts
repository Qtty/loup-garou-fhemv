import { expect } from "chai";
import { ethers } from "hardhat";

import { LoupGarou } from "../../types";
import { createInstances } from "../instance";
import { getSigners } from "../signers";
import { createTransaction } from "../utils";
import { deployLoupGarouFixture } from "./LoupGarou.fixture";

describe("Loup Garou", function () {
  before(async function () {
    this.signers = await getSigners(ethers);
  });

  this.beforeEach(async function () {
    // deploy test contract
    const contract = await deployLoupGarouFixture();
    this.contractAddress = await contract.getAddress();
    this.loupGarou = contract;

    // initiate fhevmjs
    this.instances = await createInstances(this.contractAddress, ethers, this.signers);
  });

  it("should yield random roles", async function () {
    const roleWolf = this.instances.owner.encrypt8(1);
    const roleHuman = this.instances.owner.encrypt8(2);
    const roleSorcerer = this.instances.owner.encrypt8(3);

    var tx = await createTransaction(this.loupGarou.setGameEnv, roleWolf, roleHuman, roleSorcerer);
    await tx.wait();

    const alice = this.instances.alice;
    const bob = this.instances.bob;
    const dave = this.instances.dave;
    const carol = this.instances.carol;
    const players = [alice, bob, dave, carol];

    const aliceSigner = this.signers.alice;
    const bobSigner = this.signers.bob;
    const daveSigner = this.signers.dave;
    const carolSigner = this.signers.carol;
    const playersSigners = [aliceSigner, bobSigner, daveSigner, carolSigner];
    var tmpContract;

    console.log("game env set");
    for (const player of playersSigners) {
      tmpContract = this.loupGarou.connect(player);
      tx = await createTransaction(tmpContract.registerForGame);
      await tx.wait();
      console.log("player: %s registered", player.address);
    }

    for (let i = 0; i < 4; i++) {
      tmpContract = this.loupGarou.connect(playersSigners[i]);
      var tmpToken = players[i].getTokenSignature(this.contractAddress);
      var encryptedRole = await tmpContract.getRole(tmpToken?.publicKey, tmpToken?.signature);
      var role = players[i].decrypt(this.contractAddress, encryptedRole);
      console.log("---- role %d: %d", i, role);
    }
  });
});
