import { expect } from "chai";
import { ethers } from "hardhat";
import { kill } from "process";

import { LoupGarou } from "../../types";
import { createInstances } from "../instance";
import { getSigners } from "../signers";
import { createTransaction } from "../utils";
import { deployLoupGarouFixture } from "./LoupGarou.fixture";

describe("Loup Garou", function () {
  before(async function () {
    this.signers = await getSigners(ethers);

    const contract = await deployLoupGarouFixture();
    this.contractAddress = await contract.getAddress();
    this.loupGarou = contract;

    // initiate fhevmjs
    this.instances = await createInstances(this.contractAddress, ethers, this.signers);

    const alice = this.instances.alice;
    const bob = this.instances.bob;
    const dave = this.instances.dave;
    const carol = this.instances.carol;
    this.players = [alice, bob, dave, carol];

    const aliceSigner = this.signers.alice;
    const bobSigner = this.signers.bob;
    const daveSigner = this.signers.dave;
    const carolSigner = this.signers.carol;
    this.playersSigners = [aliceSigner, bobSigner, daveSigner, carolSigner];
  });

  this.beforeEach(async function () {});

  it("should yield random roles", async function () {
    const roleWolf = this.instances.owner.encrypt8(1);
    const roleHuman = this.instances.owner.encrypt8(2);
    const roleSorcerer = this.instances.owner.encrypt8(3);

    var tx = await createTransaction(this.loupGarou.setGameEnv, roleWolf, roleHuman, roleSorcerer);
    await tx.wait();

    var tmpContract;

    console.log("game env set");
    for (const player of this.playersSigners) {
      tmpContract = this.loupGarou.connect(player);
      tx = await createTransaction(tmpContract.registerForGame);
      await tx.wait();
      console.log("player: %s registered", player.address);
    }

    let shuffled_roles = [];
    for (let i = 0; i < 4; i++) {
      tmpContract = this.loupGarou.connect(this.playersSigners[i]);
      var tmpToken = this.players[i].getTokenSignature(this.contractAddress);
      var encryptedRole = await tmpContract.getRole(tmpToken?.publicKey, tmpToken?.signature);
      var role = this.players[i].decrypt(this.contractAddress, encryptedRole);
      shuffled_roles.push(role);
      console.log("---- role %d: %d", i, role);
    }

    expect(shuffled_roles).to.not.equal([1, 2, 2, 3]);
  });

  it("the wolves should vote against a person and he dies", async function () {
    var tmpContract;
    var tx;
    this.playersIds = new Map<string, number>();
    this.playersIds.set(this.signers.alice.address, 0);
    this.playersIds.set(this.signers.bob.address, 1);
    this.playersIds.set(this.signers.dave.address, 2);
    this.playersIds.set(this.signers.carol.address, 3);

    console.log("Voting a person out");
    for (let i = 0; i < 4; i++) {
      tmpContract = this.loupGarou.connect(this.playersSigners[i]);
      var chosenVictim = this.playersIds.get(this.playersSigners[3 - i].address);
      tx = await createTransaction(tmpContract.wolvesNight, this.players[i].encrypt8(chosenVictim));
      await tx.wait();
      console.log("player %s voted for %d", this.playersSigners[i].address, chosenVictim);
    }

    var killedPerson = await this.loupGarou.gotKilled();
    console.log("voted out person is %s with id %d", killedPerson, this.playersIds.get(killedPerson));

    this.playersIds.delete(killedPerson);

    var registeredPlayers = await this.loupGarou.getRegisteredPlayers();
    expect(registeredPlayers).to.not.include(killedPerson);
  });

  it("village members should vote a person and he dies", async function () {
    var tmpContract;
    var tx;

    console.log("Voting a person out");
    for (let i = 0; i < 4; i++) {
      if ([...this.playersIds.keys()].includes(this.playersSigners[i].address)) {
        tmpContract = this.loupGarou.connect(this.playersSigners[i]);
        var chosenVictim = [...this.playersIds.values()][Math.floor(Math.random() * this.playersIds.size)];
        tx = await createTransaction(tmpContract.dailyDebate, chosenVictim);
        await tx.wait();
        console.log("player %s voted for %d", this.playersSigners[i].address, chosenVictim);
      }
    }

    var killedPerson = await this.loupGarou.gotKilled();
    console.log("voted out person is %s", killedPerson);

    var registeredPlayers = await this.loupGarou.getRegisteredPlayers();
    expect(registeredPlayers).to.not.include(killedPerson);
  });
});
