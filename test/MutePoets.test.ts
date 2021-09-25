import { parseEther } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { providers } from "ethers";
import { ethers } from "hardhat";

import { MockERC20, LostPoetPages, LostPoets, MutePoets } from "../typechain";

interface Contracts {
  mockAsh: MockERC20;
  lostPoetPages: LostPoetPages;
  lostPoets: LostPoets;
  mutePoets: MutePoets;
}

async function deploy(): Promise<Contracts> {
  const MockERC20Factory = await ethers.getContractFactory("MockERC20");
  const mockAsh = await (await MockERC20Factory.deploy("Mock Ash", "ASH")).deployed() as MockERC20;

  const LostPoetPagesFactory = await ethers.getContractFactory("LostPoetPages");
  const lostPoetPages = await (await LostPoetPagesFactory.deploy()).deployed() as LostPoetPages;

  const LostPoetsFactory = await ethers.getContractFactory("LostPoets");
  const lostPoets = await (await LostPoetsFactory.deploy(lostPoetPages.address)).deployed() as LostPoets;

  const MutePoetsFactory = await ethers.getContractFactory("MutePoets");
  const mutePoets = await (await MutePoetsFactory.deploy(lostPoets.address)).deployed() as MutePoets;
  return { mockAsh, lostPoetPages, lostPoets, mutePoets };
}

let contracts: Contracts;
let owner: SignerWithAddress,
  nonOwner: SignerWithAddress,
  poetHolder: SignerWithAddress;

const buyPage = async (signer : SignerWithAddress, contracts: Contracts) => {
  await buyPages(signer, 1, contracts);
}

const buyPages = async (signer : SignerWithAddress, pages: number, contracts: Contracts) => {
  await contracts.lostPoetPages.connect(signer).claimPages(pages, {value: parseEther("0.32")});
}

const mintPoet = async (signer : SignerWithAddress, contracts: Contracts) => {
  await contracts.lostPoetPages.connect(signer).safeTransferFrom(signer.address, contracts.lostPoets.address, 1, 1, ethers.utils.defaultAbiCoder.encode(["uint256"], [0]));
}

const activatePageSale = async (owner: SignerWithAddress, contracts: Contracts) => {
  await contracts.lostPoetPages.connect(owner).activate(0, 0, ethers.constants.MaxUint256, contracts.mockAsh.address, 0);
}

const enablePageRedemption = async (owner: SignerWithAddress, contracts: Contracts) => {
  await contracts.lostPoets.connect(owner).enableRedemption(ethers.constants.MaxUint256);
}

describe("MutePoets", () => {
  beforeEach(async () => {
    contracts = await deploy();
    [owner, nonOwner, poetHolder] =
      await ethers.getSigners();

    await activatePageSale(owner, contracts);
    await enablePageRedemption(owner, contracts);
  });

  describe("Constructor", () => {
    it("stores the address of the Lost Poets contract", async () => {
      expect(await contracts.mutePoets.poets()).to.equal(contracts.lostPoets.address);
    });
  });

  describe("ERC20", () => {
    it("has a token name", async () => {
      expect(await contracts.mutePoets.name()).to.equal("Mute Poets");
    });

    it("has a token symbol", async () => {
      expect(await contracts.mutePoets.symbol()).to.equal("SILENCE");
    });


    it("uses 18 decimals", async () => {
      expect(await contracts.mutePoets.decimals()).to.equal(18);
    });
  });

  describe("takeVow", () => {
    it("transfers the caller's poet", async () => {
      expect(await contracts.lostPoets.balanceOf(poetHolder.address)).to.equal(0);
      await buyPage(poetHolder, contracts);
      await mintPoet(poetHolder, contracts);

      expect(await contracts.lostPoets.balanceOf(poetHolder.address)).to.equal(1);
      expect(await contracts.lostPoets.balanceOf(contracts.mutePoets.address)).to.equal(0);

      await contracts.lostPoets.connect(poetHolder).approve(contracts.mutePoets.address, 1025);
      await contracts.mutePoets.connect(poetHolder).takeVow(1025);
      expect(await contracts.lostPoets.balanceOf(poetHolder.address)).to.equal(0);
      expect(await contracts.lostPoets.balanceOf(contracts.mutePoets.address)).to.equal(1);
    });

    it("creates a Vow record", async () => {
      await buyPage(poetHolder, contracts);
      await mintPoet(poetHolder, contracts);
      await contracts.lostPoets.connect(poetHolder).approve(contracts.mutePoets.address, 1025);
      const tx = await contracts.mutePoets.connect(poetHolder).takeVow(1025);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      const [owner, created] = await contracts.mutePoets.vows(1025);
      expect(owner).to.equal(poetHolder.address);
      expect(created).to.equal(block.timestamp);
    });
  });

  describe("breakVow", () => {

    beforeEach(async () => {
      await buyPage(poetHolder, contracts);
      await mintPoet(poetHolder, contracts);
      await contracts.lostPoets.connect(poetHolder).approve(contracts.mutePoets.address, 1025);
      await contracts.mutePoets.connect(poetHolder).takeVow(1025);
    });

    it("reverts if vow does not exist", async () => {
      await expect(contracts.mutePoets.connect(nonOwner).breakVow(1026)).to.be.revertedWith('!vow');
    });

    it("reverts if caller did not create vow", async () => {
      await expect(contracts.mutePoets.connect(nonOwner).breakVow(1025)).to.be.revertedWith('!owner');
    });

    it("transfers back the caller's poet", async () => {
      expect(await contracts.lostPoets.balanceOf(poetHolder.address)).to.equal(0);

      await contracts.mutePoets.connect(poetHolder).breakVow(1025);

      expect(await contracts.lostPoets.balanceOf(poetHolder.address)).to.equal(1);
      expect(await contracts.lostPoets.ownerOf(1025)).to.equal(poetHolder.address);
    });
  });

  describe("claim", () => {

    beforeEach(async () => {
      await buyPage(poetHolder, contracts);
      await mintPoet(poetHolder, contracts);
      await contracts.lostPoets.connect(poetHolder).approve(contracts.mutePoets.address, 1025);
      await contracts.mutePoets.connect(poetHolder).takeVow(1025);
    });

    it("reverts if vow does not exist", async () => {
      await expect(contracts.mutePoets.connect(nonOwner).claim(1026)).to.be.revertedWith('!vow');
    });

    it("reverts if caller did not create vow", async () => {
      await expect(contracts.mutePoets.connect(nonOwner).claim(1025)).to.be.revertedWith('!owner');
    });

    it("transfers 1 SILENCE per day", async () => {
      expect(await contracts.mutePoets.balanceOf(poetHolder.address)).to.equal(0);
      await contracts.mutePoets.connect(poetHolder).claim(1025);
      expect(await contracts.mutePoets.balanceOf(poetHolder.address)).to.equal(0);
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await contracts.mutePoets.connect(poetHolder).claim(1025);
      expect(await contracts.mutePoets.balanceOf(poetHolder.address)).to.equal(parseEther("1"));
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await contracts.mutePoets.connect(poetHolder).claim(1025);
      expect(await contracts.mutePoets.balanceOf(poetHolder.address)).to.equal(parseEther("2"));
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await contracts.mutePoets.connect(poetHolder).claim(1025);
      expect(await contracts.mutePoets.balanceOf(poetHolder.address)).to.equal(parseEther("3"));
    });

    it("rounds down days", async () => {
      expect(await contracts.mutePoets.balanceOf(poetHolder.address)).to.equal(0);
      await contracts.mutePoets.connect(poetHolder).claim(1025);
      expect(await contracts.mutePoets.balanceOf(poetHolder.address)).to.equal(0);
      await ethers.provider.send("evm_increaseTime", [(24 * 60 * 60) - 1]);
      await contracts.mutePoets.connect(poetHolder).claim(1025);
      expect(await contracts.mutePoets.balanceOf(poetHolder.address)).to.equal(0);
    });
  });

});
