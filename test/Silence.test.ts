import { parseEther } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { MockERC20, LostPoetPages, LostPoets, Silence } from "../typechain";

interface Contracts {
  mockAsh: MockERC20;
  lostPoetPages: LostPoetPages;
  lostPoets: LostPoets;
  silence: Silence;
}

async function deploy(): Promise<Contracts> {
  const MockERC20Factory = await ethers.getContractFactory("MockERC20");
  const mockAsh = (await (
    await MockERC20Factory.deploy("Mock Ash", "ASH")
  ).deployed()) as MockERC20;

  const LostPoetPagesFactory = await ethers.getContractFactory("LostPoetPages");
  const lostPoetPages = (await (
    await LostPoetPagesFactory.deploy()
  ).deployed()) as LostPoetPages;

  const LostPoetsFactory = await ethers.getContractFactory("LostPoets");
  const lostPoets = (await (
    await LostPoetsFactory.deploy(lostPoetPages.address)
  ).deployed()) as LostPoets;

  const SilenceFactory = await ethers.getContractFactory("Silence");
  const silence = (await (
    await SilenceFactory.deploy(lostPoets.address)
  ).deployed()) as Silence;
  return { mockAsh, lostPoetPages, lostPoets, silence };
}

let contracts: Contracts;
let owner: SignerWithAddress,
  nonOwner: SignerWithAddress,
  poetHolder: SignerWithAddress;

const buyPage = async (signer: SignerWithAddress, contracts: Contracts) => {
  await buyPages(signer, 1, contracts);
};

const buyPages = async (
  signer: SignerWithAddress,
  pages: number,
  contracts: Contracts
) => {
  await contracts.lostPoetPages
    .connect(signer)
    .claimPages(pages, { value: parseEther("0.32").mul(pages) });
};

const mintPoet = async (signer: SignerWithAddress, contracts: Contracts) => {
  await contracts.lostPoetPages
    .connect(signer)
    .safeTransferFrom(
      signer.address,
      contracts.lostPoets.address,
      1,
      1,
      ethers.utils.defaultAbiCoder.encode(["uint256"], [0])
    );
};

const addWord = async (
  signer: SignerWithAddress,
  tokenId: number,
  contracts: Contracts
) => {
  await contracts.lostPoetPages
    .connect(signer)
    .safeTransferFrom(
      signer.address,
      contracts.lostPoets.address,
      1,
      1,
      ethers.utils.defaultAbiCoder.encode(["uint256", "uint256"], [1, tokenId])
    );
};

const activatePageSale = async (
  owner: SignerWithAddress,
  contracts: Contracts
) => {
  await contracts.lostPoetPages
    .connect(owner)
    .activate(0, 0, ethers.constants.MaxUint256, contracts.mockAsh.address, 0);
};

const enablePageRedemption = async (
  owner: SignerWithAddress,
  contracts: Contracts
) => {
  await contracts.lostPoets
    .connect(owner)
    .enableRedemption(ethers.constants.MaxUint256);
};

const unlockWords = async (owner: SignerWithAddress, contracts: Contracts) => {
  await contracts.lostPoets.connect(owner).lockWords(false);
};

describe("silence", () => {
  beforeEach(async () => {
    contracts = await deploy();
    [owner, nonOwner, poetHolder] = await ethers.getSigners();

    await activatePageSale(owner, contracts);
    await enablePageRedemption(owner, contracts);
    await unlockWords(owner, contracts);
  });

  describe("Constructor", () => {
    it("stores the address of the Lost Poets contract", async () => {
      expect(await contracts.silence.poets()).to.equal(
        contracts.lostPoets.address
      );
    });
  });

  describe("ERC20", () => {
    it("has a token name", async () => {
      expect(await contracts.silence.name()).to.equal("Silence");
    });

    it("has a token symbol", async () => {
      expect(await contracts.silence.symbol()).to.equal("SILENCE");
    });

    it("uses 18 decimals", async () => {
      expect(await contracts.silence.decimals()).to.equal(18);
    });
  });

  describe("takeVow", () => {
    it("reverts if token does not exist", async () => {
      await expect(
        contracts.silence.connect(nonOwner).takeVow(1025)
      ).to.be.revertedWith("nonexistent token");
    });

    it("reverts if caller is not token owner", async () => {
      await buyPage(poetHolder, contracts);
      await mintPoet(poetHolder, contracts);
      await expect(
        contracts.silence.connect(nonOwner).takeVow(1025)
      ).to.be.revertedWith("!owner");
    });

    it("reverts if poet is not mute", async () => {
      await buyPages(poetHolder, 2, contracts);
      await mintPoet(poetHolder, contracts);
      await addWord(poetHolder, 1025, contracts);
      await expect(
        contracts.silence.connect(poetHolder).takeVow(1025)
      ).to.be.revertedWith("!mute");
    });

    it("transfers the caller's poet", async () => {
      expect(await contracts.lostPoets.balanceOf(poetHolder.address)).to.equal(
        0
      );
      await buyPage(poetHolder, contracts);
      await mintPoet(poetHolder, contracts);

      expect(await contracts.lostPoets.balanceOf(poetHolder.address)).to.equal(
        1
      );
      expect(
        await contracts.lostPoets.balanceOf(contracts.silence.address)
      ).to.equal(0);

      await contracts.lostPoets
        .connect(poetHolder)
        .approve(contracts.silence.address, 1025);
      await contracts.silence.connect(poetHolder).takeVow(1025);
      expect(await contracts.lostPoets.balanceOf(poetHolder.address)).to.equal(
        0
      );
      expect(
        await contracts.lostPoets.balanceOf(contracts.silence.address)
      ).to.equal(1);
    });

    it("creates a Vow record", async () => {
      await buyPage(poetHolder, contracts);
      await mintPoet(poetHolder, contracts);
      await contracts.lostPoets
        .connect(poetHolder)
        .approve(contracts.silence.address, 1025);
      const tx = await contracts.silence.connect(poetHolder).takeVow(1025);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      const [owner, updated] = await contracts.silence.vows(1025);
      expect(owner).to.equal(poetHolder.address);
      expect(updated).to.equal(block.timestamp);
    });
  });

  describe("breakVow", () => {
    beforeEach(async () => {
      await buyPage(poetHolder, contracts);
      await mintPoet(poetHolder, contracts);
      await contracts.lostPoets
        .connect(poetHolder)
        .approve(contracts.silence.address, 1025);
      await contracts.silence.connect(poetHolder).takeVow(1025);
    });

    it("reverts if vow does not exist", async () => {
      await expect(
        contracts.silence.connect(nonOwner).breakVow(1026)
      ).to.be.revertedWith("!vow");
    });

    it("reverts if caller did not create vow", async () => {
      await expect(
        contracts.silence.connect(nonOwner).breakVow(1025)
      ).to.be.revertedWith("!owner");
    });

    it("transfers back the caller's poet", async () => {
      expect(await contracts.lostPoets.balanceOf(poetHolder.address)).to.equal(
        0
      );

      await contracts.silence.connect(poetHolder).breakVow(1025);

      expect(await contracts.lostPoets.balanceOf(poetHolder.address)).to.equal(
        1
      );
      expect(await contracts.lostPoets.ownerOf(1025)).to.equal(
        poetHolder.address
      );
    });

    it("transfers accrued SILENCE", async () => {
      await ethers.provider.send("evm_increaseTime", [10 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).breakVow(1025);
      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(
        parseEther("10")
      );
    });

    it("deletes the vow", async () => {
      await contracts.silence.connect(poetHolder).breakVow(1025);
      const [owner, updated] = await contracts.silence.vows(1025);
      expect(owner).to.equal(ethers.constants.AddressZero);
      expect(updated).to.equal(0);
    });
  });

  describe("claim", () => {
    beforeEach(async () => {
      await buyPage(poetHolder, contracts);
      await mintPoet(poetHolder, contracts);
      await contracts.lostPoets
        .connect(poetHolder)
        .approve(contracts.silence.address, 1025);
      await contracts.silence.connect(poetHolder).takeVow(1025);
    });

    it("reverts if vow does not exist", async () => {
      await expect(
        contracts.silence.connect(nonOwner).claim(1026)
      ).to.be.revertedWith("!vow");
    });

    it("reverts if caller did not create vow", async () => {
      await expect(
        contracts.silence.connect(nonOwner).claim(1025)
      ).to.be.revertedWith("!owner");
    });

    it("transfers 1 SILENCE per day", async () => {
      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(0);

      await contracts.silence.connect(poetHolder).claim(1025);
      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(0);

      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1025);
      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(
        parseEther("1")
      );

      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1025);
      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(
        parseEther("2")
      );

      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1025);
      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(
        parseEther("3")
      );
    });

    it("rounds down days", async () => {
      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(0);

      await contracts.silence.connect(poetHolder).claim(1025);
      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(0);

      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 - 1]);
      await contracts.silence.connect(poetHolder).claim(1025);
      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(0);
    });
  });

  describe("claimable", () => {
    beforeEach(async () => {
      await buyPage(poetHolder, contracts);
      await mintPoet(poetHolder, contracts);
      await contracts.lostPoets
        .connect(poetHolder)
        .approve(contracts.silence.address, 1025);
      await contracts.silence.connect(poetHolder).takeVow(1025);
    });

    it("returns accrued SILENCE", async () => {
      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(0);

      expect(await contracts.silence.claimable(1025)).to.equal(0);

      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      expect(await contracts.silence.claimable(1025)).to.equal(
        parseEther("1")
      );

      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      expect(await contracts.silence.claimable(1025)).to.equal(
        parseEther("2")
      );

      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      expect(await contracts.silence.claimable(1025)).to.equal(
        parseEther("3")
      );

      await contracts.silence.connect(poetHolder).claim(1025);
      expect(await contracts.silence.claimable(1025)).to.equal(
        0

      );

      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      expect(await contracts.silence.claimable(1025)).to.equal(
        parseEther("1")
      );
    });

    it("rounds down days", async () => {
      expect(await contracts.silence.claimable(1025)).to.equal(0);

      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 - 1]);
      await ethers.provider.send("evm_mine", []);
      expect(await contracts.silence.claimable(1025)).to.equal(0);
    });
  });
});
