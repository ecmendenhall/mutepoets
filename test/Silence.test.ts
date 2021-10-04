import { parseEther, parseUnits } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Address } from "cluster";
import { ethers } from "hardhat";

import {
  MockERC20,
  MockERC721,
  LostPoetPages,
  LostPoets,
  Silence,
} from "../typechain";

interface Contracts {
  mockAsh: MockERC20;
  mockNFT: MockERC721;
  lostPoetPages: LostPoetPages;
  lostPoets: LostPoets;
  silence: Silence;
}

async function deploy(): Promise<Contracts> {
  const MockERC20Factory = await ethers.getContractFactory("MockERC20");
  const mockAsh = (await (
    await MockERC20Factory.deploy("Mock Ash", "ASH")
  ).deployed()) as MockERC20;

  const MockERC721Factory = await ethers.getContractFactory("MockERC721");
  const mockNFT = (await (
    await MockERC721Factory.deploy("Not Poets", "NOTLOST")
  ).deployed()) as MockERC721;

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
  return { mockAsh, mockNFT, lostPoetPages, lostPoets, silence };
}

let contracts: Contracts;
let owner: SignerWithAddress,
  nonOwner: SignerWithAddress,
  poetHolder: SignerWithAddress,
  poetHolder1: SignerWithAddress,
  poetHolder2: SignerWithAddress;

const range = (n: number) => {
  return [...Array(n).keys()];
};

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

const mintPoets = async (
  signer: SignerWithAddress,
  poets: number,
  contracts: Contracts
) => {
  for (let i = 0; i < poets; i++) {
    mintPoet(signer, contracts);
  }
};

const mintOrigin = async (signer: SignerWithAddress, contracts: Contracts) => {
  await contracts.lostPoets
    .connect(signer)
    .mintOrigins([contracts.silence.address], [100]);
};

const mintOriginTo = async (
  signer: SignerWithAddress,
  to: string,
  contracts: Contracts
) => {
  await contracts.lostPoets.connect(signer).mintOrigins([to], [101]);
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
    [owner, nonOwner, poetHolder, poetHolder1, poetHolder2] =
      await ethers.getSigners();

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

  describe("getVowsByAddress", () => {
    beforeEach(async () => {
      await buyPages(poetHolder1, 3, contracts);
      await mintPoets(poetHolder1, 3, contracts);
      await buyPages(poetHolder2, 3, contracts);
      await mintPoets(poetHolder2, 3, contracts);
      await contracts.lostPoets
        .connect(poetHolder1)
        .approve(contracts.silence.address, 1025);
      await contracts.lostPoets
        .connect(poetHolder1)
        .approve(contracts.silence.address, 1026);
      await contracts.lostPoets
        .connect(poetHolder1)
        .approve(contracts.silence.address, 1027);
      await contracts.lostPoets
        .connect(poetHolder2)
        .approve(contracts.silence.address, 1028);
      await contracts.lostPoets
        .connect(poetHolder2)
        .approve(contracts.silence.address, 1029);
      await contracts.lostPoets
        .connect(poetHolder2)
        .approve(contracts.silence.address, 1030);
      await contracts.silence.connect(poetHolder1).takeVow(1025);
    });

    it("returns all vowIds for a given address", async () => {
      expect(
        await contracts.silence.getVowsByAddress(poetHolder1.address)
      ).to.eql([parseUnits("1", "wei")]);
      await contracts.silence.connect(poetHolder1).takeVow(1026);
      expect(
        await contracts.silence.getVowsByAddress(poetHolder1.address)
      ).to.eql([parseUnits("1", "wei"), parseUnits("2", "wei")]);
      await contracts.silence.connect(poetHolder2).takeVow(1028);
      await contracts.silence.connect(poetHolder2).takeVow(1029);
      await contracts.silence.connect(poetHolder1).takeVow(1027);
      expect(
        await contracts.silence.getVowsByAddress(poetHolder2.address)
      ).to.eql([parseUnits("3", "wei"), parseUnits("4", "wei")]);
      expect(
        await contracts.silence.getVowsByAddress(poetHolder1.address)
      ).to.eql([
        parseUnits("1", "wei"),
        parseUnits("2", "wei"),
        parseUnits("5", "wei"),
      ]);
      await contracts.silence.connect(poetHolder2).takeVow(1030);
      expect(
        await contracts.silence.getVowsByAddress(poetHolder2.address)
      ).to.eql([
        parseUnits("3", "wei"),
        parseUnits("4", "wei"),
        parseUnits("6", "wei"),
      ]);
    });

    it("does not remove vowIds when broken", async () => {
      expect(
        await contracts.silence.getVowsByAddress(poetHolder1.address)
      ).to.eql([parseUnits("1", "wei")]);
      await contracts.silence.connect(poetHolder1).breakVow(1);
      expect(
        await contracts.silence.getVowsByAddress(poetHolder1.address)
      ).to.eql([parseUnits("1", "wei")]);
    });
  });

  describe("counters", () => {
    beforeEach(async () => {
      await buyPage(poetHolder, contracts);
      await mintPoet(poetHolder, contracts);
      await contracts.lostPoets
        .connect(poetHolder)
        .approve(contracts.silence.address, 1025);
      await mintOrigin(owner, contracts);
    });

    it("returns vow count", async () => {
      expect(await contracts.silence.vowCount()).to.equal(0);
      await contracts.silence.connect(poetHolder).takeVow(1025);
      expect(await contracts.silence.vowCount()).to.equal(1);
    });

    it("returns proposal count", async () => {
      expect(await contracts.silence.proposalCount()).to.equal(0);
      await contracts.silence
        .connect(owner)
        .proposeTransfer(nonOwner.address, 100);
      expect(await contracts.silence.proposalCount()).to.equal(1);
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
      ).to.be.revertedWith("!tokenOwner");
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
      expect(await contracts.lostPoets.ownerOf(1025)).to.equal(
        contracts.silence.address
      );
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

      const [tokenOwner, tokenId, created, updated] =
        await contracts.silence.vows(1);
      expect(tokenOwner).to.equal(poetHolder.address);
      expect(tokenId).to.equal(1025);
      expect(created).to.equal(block.timestamp);
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
        contracts.silence.connect(nonOwner).breakVow(2)
      ).to.be.revertedWith("!vow");
    });

    it("reverts if caller did not create vow", async () => {
      await expect(
        contracts.silence.connect(nonOwner).breakVow(1)
      ).to.be.revertedWith("!tokenOwner");
    });

    it("transfers back the caller's poet", async () => {
      expect(await contracts.lostPoets.balanceOf(poetHolder.address)).to.equal(
        0
      );

      await contracts.silence.connect(poetHolder).breakVow(1);

      expect(await contracts.lostPoets.balanceOf(poetHolder.address)).to.equal(
        1
      );
      expect(await contracts.lostPoets.ownerOf(1025)).to.equal(
        poetHolder.address
      );
    });

    it("transfers accrued SILENCE", async () => {
      await ethers.provider.send("evm_increaseTime", [10 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).breakVow(1);
      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(
        parseEther("11.25")
      );
    });

    it("deletes the vow", async () => {
      await contracts.silence.connect(poetHolder).breakVow(1);
      const [tokenOwner, tokenId, created, updated] =
        await contracts.silence.vows(1);
      expect(tokenOwner).to.equal(ethers.constants.AddressZero);
      expect(tokenId).to.equal(0);
      expect(created).to.equal(0);
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
        contracts.silence.connect(nonOwner).claim(2)
      ).to.be.revertedWith("!vow");
    });

    it("transfers 1 SILENCE per day", async () => {
      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(0);

      await contracts.silence.connect(poetHolder).claim(1);
      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(
        parseEther("0.000011574075748563")
      );

      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);
      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(
        parseEther("1.012511863427600414")
      );

      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);
      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(
        parseEther("2.050012152779452265")
      );

      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);
      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(
        parseEther("3.112512442131304116")
      );
    });

    it("multiple small claims are equivalent to one big claim", async () => {
      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(0);

      await ethers.provider.send("evm_increaseTime", [1 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);

      await ethers.provider.send("evm_increaseTime", [5 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);

      await ethers.provider.send("evm_increaseTime", [10 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);

      await ethers.provider.send("evm_increaseTime", [15 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);

      await ethers.provider.send("evm_increaseTime", [20 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);

      await ethers.provider.send("evm_increaseTime", [5 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);

      await ethers.provider.send("evm_increaseTime", [5 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);

      await ethers.provider.send("evm_increaseTime", [5 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);

      await ethers.provider.send("evm_increaseTime", [5 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);

      await ethers.provider.send("evm_increaseTime", [1 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);

      await ethers.provider.send("evm_increaseTime", [1 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);

      await ethers.provider.send("evm_increaseTime", [1 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);

      await ethers.provider.send("evm_increaseTime", [1 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);

      await ethers.provider.send("evm_increaseTime", [1 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);

      await ethers.provider.send("evm_increaseTime", [5 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);

      await ethers.provider.send("evm_increaseTime", [20 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);

      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);

      await ethers.provider.send("evm_increaseTime", [3 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);

      await ethers.provider.send("evm_increaseTime", [14 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);

      await ethers.provider.send("evm_increaseTime", [6 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);

      await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);

      await ethers.provider.send("evm_increaseTime", [9 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);

      await ethers.provider.send("evm_increaseTime", [3 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);

      await ethers.provider.send("evm_increaseTime", [10 * 24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claim(1);

      const balance = await contracts.silence.balanceOf(poetHolder.address);

      expect(parseEther("485").sub(balance).lt(parseEther("0.0001"))).to.be
        .true;
    });
  });

  describe("claimBatch", () => {
    beforeEach(async () => {
      await buyPages(poetHolder, 3, contracts);
      await mintPoets(poetHolder, 3, contracts);
      for (let i = 0; i < 3; i++) {
        const tokenId = 1025 + i;
        await contracts.lostPoets
          .connect(poetHolder)
          .approve(contracts.silence.address, tokenId);
        await contracts.silence.connect(poetHolder).takeVow(tokenId);
      }
    });

    it("claims all accrued SILENCE for a batch of vows", async () => {
      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(0);

      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claimBatch([1, 2, 3]);

      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(
        parseEther("3.037571180589045352")
      );
    });

    it("ignores invalid vows", async () => {
      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(0);

      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claimBatch([1, 1234]);

      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(
        parseEther("1.012547453730495541")
      );
    });

    it("reverts on unowned vows", async () => {
      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(0);

      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await expect(
        contracts.silence.connect(nonOwner).claimBatch([1, 2, 3])
      ).to.be.revertedWith("!tokenOwner");
    });
  });

  describe("claimAll", () => {
    beforeEach(async () => {
      await buyPages(poetHolder, 10, contracts);
      await mintPoets(poetHolder, 10, contracts);
      for (let i = 0; i < 10; i++) {
        const tokenId = 1025 + i;
        await contracts.lostPoets
          .connect(poetHolder)
          .approve(contracts.silence.address, tokenId);
        await contracts.silence.connect(poetHolder).takeVow(tokenId);
      }
    });

    it("claims all accrued SILENCE for sender's vows", async () => {
      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(0);

      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claimAll();

      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(
        parseEther("10.126067710242251794")
      );
    });

    it("handles broken vows", async () => {
      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(0);
      await contracts.silence.connect(poetHolder).breakVow(1);
      await contracts.silence.connect(poetHolder).breakVow(5);

      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await contracts.silence.connect(poetHolder).claimAll();

      expect(await contracts.silence.balanceOf(poetHolder.address)).to.equal(
        parseEther("8.101284146031927827")
      );
    });
  });

  describe("accrualRate", () => {
    beforeEach(async () => {
      await buyPage(poetHolder, contracts);
      await mintPoet(poetHolder, contracts);
      await contracts.lostPoets
        .connect(poetHolder)
        .approve(contracts.silence.address, 1025);
      await contracts.silence.connect(poetHolder).takeVow(1025);
    });

    it("is 1 SILENCE/day for new vows", async () => {
      expect(await contracts.silence.accrualRate(1)).to.equal(parseEther("1"));
    });

    it("is 1.25 SILENCE/day at 10 days", async () => {
      await ethers.provider.send("evm_increaseTime", [10 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      expect(await contracts.silence.accrualRate(1)).to.equal(
        parseEther("1.25")
      );
    });

    it("is 2 SILENCE/day at 40 days", async () => {
      await ethers.provider.send("evm_increaseTime", [40 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      expect(await contracts.silence.accrualRate(1)).to.equal(parseEther("2"));
    });

    it("is 3 SILENCE/day at 80 days", async () => {
      await ethers.provider.send("evm_increaseTime", [80 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      expect(await contracts.silence.accrualRate(1)).to.equal(parseEther("3"));
    });

    it("is 4 SILENCE/day at 120 days", async () => {
      await ethers.provider.send("evm_increaseTime", [120 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      expect(await contracts.silence.accrualRate(1)).to.equal(parseEther("4"));
    });

    it("is 5 SILENCE/day at 160 days", async () => {
      await ethers.provider.send("evm_increaseTime", [160 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      expect(await contracts.silence.accrualRate(1)).to.equal(parseEther("5"));
    });

    it("is 5 SILENCE/day at more than 160 days", async () => {
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      expect(await contracts.silence.accrualRate(1)).to.equal(parseEther("5"));
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

      expect(await contracts.silence.claimable(1)).to.equal(0);

      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      expect(await contracts.silence.claimable(1)).to.equal(
        parseEther("1.0125")
      );

      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      expect(await contracts.silence.claimable(1)).to.equal(parseEther("2.05"));

      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      expect(await contracts.silence.claimable(1)).to.equal(
        parseEther("3.1125")
      );

      await contracts.silence.connect(poetHolder).claim(1);
      expect(await contracts.silence.claimable(1)).to.equal(0);

      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      expect(await contracts.silence.claimable(1)).to.equal(
        parseEther("1.087500289351851851")
      );
    });

    it("accrual is 11.25 SILENCE at 10 days", async () => {
      await ethers.provider.send("evm_increaseTime", [10 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      expect(await contracts.silence.claimable(1)).to.equal(
        parseEther("11.25")
      );
    });

    it("accrual is 480 SILENCE at 160 days", async () => {
      await ethers.provider.send("evm_increaseTime", [160 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      expect(await contracts.silence.claimable(1)).to.equal(parseEther("480"));
    });

    it("accrual is 485 SILENCE at 161 days", async () => {
      await ethers.provider.send("evm_increaseTime", [161 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      expect(await contracts.silence.claimable(1)).to.equal(parseEther("485"));
    });

    it("accrual is 490 SILENCE at 162 days", async () => {
      await ethers.provider.send("evm_increaseTime", [162 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      expect(await contracts.silence.claimable(1)).to.equal(parseEther("490"));
    });

    it("accrual is 1505 SILENCE at 365 days", async () => {
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      expect(await contracts.silence.claimable(1)).to.equal(parseEther("1505"));
    });

    it("returns zero for invalid vows", async () => {
      expect(await contracts.silence.claimable(1234)).to.equal(0);
    });

    it("accrual is stable after 160 days", async () => {
      await ethers.provider.send("evm_increaseTime", [160 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      expect(await contracts.silence.claimable(1)).to.equal(parseEther("480"));

      await contracts.silence.connect(poetHolder).claim(1);

      await ethers.provider.send("evm_increaseTime", [10 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine", []);
      expect(await contracts.silence.claimable(1)).to.equal(parseEther("50"));
    });
  });

  describe("onERC721Received", () => {
    beforeEach(async () => {
      await buyPage(poetHolder, contracts);
      await mintPoet(poetHolder, contracts);
      await contracts.lostPoets
        .connect(poetHolder)
        .approve(contracts.silence.address, 1025);
    });

    it("reverts if received token is not a Poet", async () => {
      await contracts.mockNFT.mint(nonOwner.address, 1);
      await expect(
        contracts.mockNFT
          .connect(nonOwner)
          ["safeTransferFrom(address,address,uint256)"](
            nonOwner.address,
            contracts.silence.address,
            1
          )
      ).to.be.revertedWith("!poet");
    });

    it("reverts if received token is a non-Origin Poet", async () => {
      await expect(
        contracts.lostPoets
          .connect(poetHolder)
          ["safeTransferFrom(address,address,uint256)"](
            poetHolder.address,
            contracts.silence.address,
            1025
          )
      ).to.be.revertedWith("!origin");
    });

    it("accepts Origin poets", async () => {
      await mintOriginTo(owner, owner.address, contracts);
      await contracts.lostPoets
        .connect(owner)
        ["safeTransferFrom(address,address,uint256)"](
          owner.address,
          contracts.silence.address,
          101
        );
      expect(
        await contracts.lostPoets.balanceOf(contracts.silence.address)
      ).to.equal(1);
    });
  });

  describe("proposeTransfer", () => {
    beforeEach(async () => {
      await mintOrigin(owner, contracts);
    });

    it("only owner can propose a transfer", async () => {
      await expect(
        contracts.silence
          .connect(nonOwner)
          .proposeTransfer(nonOwner.address, 100)
      ).to.be.revertedWith("caller is not the owner");
    });

    it("adds a transfer to the transfers mapping", async () => {
      const tx = await contracts.silence
        .connect(owner)
        .proposeTransfer(nonOwner.address, 100);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      const [to, tokenId, timelock] = await contracts.silence.proposals(1);
      expect(to).to.equal(nonOwner.address);
      expect(tokenId).to.equal(100);
      expect(timelock).to.equal(block.timestamp + 7 * 24 * 60 * 60);
    });

    it("increments transfer id", async () => {
      const tx1 = await contracts.silence
        .connect(owner)
        .proposeTransfer(nonOwner.address, 100);
      let receipt = await tx1.wait();
      let block1 = await ethers.provider.getBlock(receipt.blockNumber);

      const tx2 = await contracts.silence
        .connect(owner)
        .proposeTransfer(nonOwner.address, 101);
      receipt = await tx2.wait();
      const block2 = await ethers.provider.getBlock(receipt.blockNumber);

      let [to, tokenId, timelock] = await contracts.silence.proposals(1);
      expect(to).to.equal(nonOwner.address);
      expect(tokenId).to.equal(100);
      expect(timelock).to.equal(block1.timestamp + 7 * 24 * 60 * 60);
      [to, tokenId, timelock] = await contracts.silence.proposals(2);
      expect(to).to.equal(nonOwner.address);
      expect(tokenId).to.equal(101);
      expect(timelock).to.equal(block2.timestamp + 7 * 24 * 60 * 60);
    });
  });

  describe("executeTransfer", () => {
    beforeEach(async () => {
      await mintOrigin(owner, contracts);
      await contracts.silence
        .connect(owner)
        .proposeTransfer(nonOwner.address, 100);
    });

    it("only owner can execute a transfer", async () => {
      await expect(
        contracts.silence.connect(nonOwner).executeTransfer(1)
      ).to.be.revertedWith("caller is not the owner");
    });

    it("reverts if proposal does not exist", async () => {
      await expect(
        contracts.silence.connect(owner).executeTransfer(0)
      ).to.be.revertedWith("!proposal");
    });

    it("reverts if timelock is active", async () => {
      await expect(
        contracts.silence.connect(owner).executeTransfer(1)
      ).to.be.revertedWith("timelock");
    });

    it("reverts if tokenId is not origin", async () => {
      await buyPage(owner, contracts);
      await mintPoet(owner, contracts);
      await contracts.silence
        .connect(owner)
        .proposeTransfer(nonOwner.address, 1025);
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]);

      await expect(
        contracts.silence.connect(owner).executeTransfer(2)
      ).to.be.revertedWith("!origin");
    });

    it("executes proposal if timelock is inactive", async () => {
      expect(
        await contracts.lostPoets.balanceOf(contracts.silence.address)
      ).to.equal(1);
      expect(await contracts.lostPoets.balanceOf(nonOwner.address)).to.equal(0);
      expect(await contracts.lostPoets.ownerOf(100)).to.equal(
        contracts.silence.address
      );

      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]);
      await contracts.silence.connect(owner).executeTransfer(1);

      expect(
        await contracts.lostPoets.balanceOf(contracts.silence.address)
      ).to.equal(0);
      expect(await contracts.lostPoets.balanceOf(nonOwner.address)).to.equal(1);
      expect(await contracts.lostPoets.ownerOf(100)).to.equal(nonOwner.address);
    });
  });
});
