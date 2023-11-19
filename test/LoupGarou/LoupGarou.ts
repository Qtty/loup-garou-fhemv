import { expect } from "chai";
import { ethers } from "hardhat";
import { kill } from "process";

import { createInstances } from "../instance";
import { Signers, getSigners } from "../signers";
import { FhevmInstances } from "../types";
import { createTransaction } from "../utils";
import { deployLoupGarouFixture } from "./LoupGarou.fixture";

describe("Loup Garou", function () {
  before(async function () {
    this.signers = await getSigners(ethers);

    const contract = await deployLoupGarouFixture();
    this.contractAddress = await contract.getAddress();
    this.loupGarou = contract;

    console.log("contract address: " + this.contractAddress);
    // initiate fhevmjs
    this.instances = await createInstances(this.contractAddress, ethers, this.signers);

    let instances = [];

    let signers = [];

    for (const key in this.instances) {
      const instanceKey = key as keyof FhevmInstances;
      instances.push(this.instances[instanceKey]);
    }

    for (const key in this.signers) {
      const signerKey = key as keyof Signers;
      signers.push(this.signers[signerKey]);
    }
    instances.shift();
    signers.shift();

    this.players = [];
    for (let i = 0; i < instances.length; i++) {
      this.players.push({
        name: `player${i + 1}`,
        instance: instances[i],
        signer: signers[i],
        id: i,
        role: 0,
      });
    }
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
    for (const player of this.players) {
      tmpContract = this.loupGarou.connect(player.signer);
      tx = await createTransaction(tmpContract.registerForGame);
      await tx.wait();
      console.log("player: %s registered", player.signer.address);

      setTimeout(() => {
        console.log("Awake!");
      }, 5000);
    }

    let shuffled_roles = [];
    for (const player of this.players) {
      tmpContract = this.loupGarou.connect(player.signer);
      var tmpToken = player.instance.getTokenSignature(this.contractAddress);
      var encryptedRole = await tmpContract.getRole(tmpToken?.publicKey, tmpToken?.signature);
      var role = player.instance.decrypt(this.contractAddress, encryptedRole);
      shuffled_roles.push(role);
      player.role = role;
      console.log("---- role %s: %d", player.signer.address, player.role);
    }

    expect(shuffled_roles).to.not.equal([1, 2, 2, 3]);
  });

  it("the wolves should vote against a person and he dies", async function () {
    var tmpContract;
    var tx;

    var c = this.players.length - 1;
    var chosenVictim = this.players[4].id;
    console.log("Wolves voting a person out");
    for (const player of this.players) {
      tmpContract = this.loupGarou.connect(player.signer);
      var victim;

      if (player.role == 1) {
        victim = chosenVictim;
      } else {
        victim = 0;
      }

      tx = await createTransaction(tmpContract.wolvesNight, player.instance.encrypt8(victim));
      await tx.wait();
      console.log("player %s voted for %d", player.signer.address, victim);
      c -= 1;
    }

    var killedPerson = await this.loupGarou.gotKilled();
    console.log("voted out person is %s", killedPerson);

    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].signer.address == killedPerson) {
        this.players.splice(i, 1);
        break;
      }
    }

    var registeredPlayers = await this.loupGarou.getRegisteredPlayers();
    expect(registeredPlayers).to.not.include(killedPerson);
  });

  it("village members should vote a person and he dies", async function () {
    var tmpContract;
    var tx;

    console.log("Voting a person out");
    for (const player of this.players) {
      tmpContract = this.loupGarou.connect(player.signer);
      var chosenVictim = [...this.players][Math.floor(Math.random() * this.players.length)];
      tx = await createTransaction(tmpContract.dailyDebate, chosenVictim.id);
      await tx.wait();
      console.log("player %s voted for %d", player.signer.address, chosenVictim.id);
    }

    var killedPerson = await this.loupGarou.gotKilled();
    console.log("voted out person is %s", killedPerson);

    var registeredPlayers = await this.loupGarou.getRegisteredPlayers();
    console.log("wolves win: " + (await this.loupGarou.wolves_win()));
    console.log("villager win: " + (await this.loupGarou.villagers_win()));
    expect(registeredPlayers).to.not.include(killedPerson);
  });
});
