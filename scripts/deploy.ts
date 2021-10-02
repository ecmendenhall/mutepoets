import { Contract, ethers } from "ethers";
import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MockERC20, LostPoetPages, LostPoets, Silence } from "../typechain";
import { parseEther } from "ethers/lib/utils";

type Ethers = typeof ethers & HardhatEthersHelpers;

interface Contracts {
  mockAsh: MockERC20;
  lostPoetPages: LostPoetPages;
  lostPoets: LostPoets;
  silence: Silence;
}

const range = (n: number) => {
  return [...Array(n).keys()];
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
    await mintPoet(signer, contracts);
  }
};

const sendPoets = async (
  signer: SignerWithAddress,
  to: string,
  poetIds: number[],
  contracts: Contracts
) => {
  for (let id of poetIds) {
    await contracts.lostPoets
      .connect(signer)
      .transferFrom(signer.address, to, id);
  }
};

const pledgePoets = async (
  signer: SignerWithAddress,
  poetIds: number[],
  contracts: Contracts
) => {
  for (let id of poetIds) {
    await contracts.lostPoets
      .connect(signer)
      ["safeTransferFrom(address,address,uint256)"](
        signer.address,
        contracts.silence.address,
        id
      );
  }
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

const setPrefixURI = async (owner: SignerWithAddress, contracts: Contracts) => {
  await contracts.lostPoets
    .connect(owner)
    .setPrefixURI("https://lostpoets.api.manifoldxyz.dev/metadata/");
};

async function deployMultiCall(ethers: Ethers) {
  const Multicall = await ethers.getContractFactory("Multicall");
  const multicall = await Multicall.deploy();
  await multicall.deployed();

  console.log("Multicall deployed to:", multicall.address);
}

async function deployLostPoets(ethers: Ethers) {
  const MockERC20Factory = await ethers.getContractFactory("MockERC20");
  const mockAsh = (await MockERC20Factory.deploy(
    "Mock Ash",
    "ASH"
  )) as MockERC20;
  await mockAsh.deployed();

  console.log("MockAsh deployed to:", mockAsh.address);

  const LostPoetPagesFactory = await ethers.getContractFactory("LostPoetPages");
  const lostPoetPages = (await LostPoetPagesFactory.deploy({
    gasLimit: 7_000_000,
  })) as LostPoetPages;
  await lostPoetPages.deployed();

  console.log("LostPoetPages deployed to:", lostPoetPages.address);

  const LostPoetsFactory = await ethers.getContractFactory("LostPoets");
  const lostPoets = (await LostPoetsFactory.deploy(lostPoetPages.address, {
    gasLimit: 7_000_000,
  })) as LostPoets;
  await lostPoets.deployed();

  console.log("LostPoets deployed to:", lostPoets.address);

  return { mockAsh, lostPoetPages, lostPoets };
}

async function deployCoreContracts(ethers: Ethers, lostPoetsAddress: string) {
  const SilenceFactory = await ethers.getContractFactory("Silence");
  const silence = (await SilenceFactory.deploy(lostPoetsAddress)) as Silence;
  await silence.deployed();

  console.log("Silence deployed to:", silence.address);
  return { silence };
}

export async function deployTestnet(ethers: Ethers) {
  const [owner] = await ethers.getSigners();

  const { mockAsh, lostPoetPages, lostPoets } = await deployLostPoets(ethers);
  const { silence } = await deployCoreContracts(ethers, lostPoets.address);
  const contracts = { mockAsh, lostPoetPages, lostPoets, silence };

  console.log("Activating page sale...");
  await activatePageSale(owner, contracts);

  console.log("Enabling page redemption...");
  await enablePageRedemption(owner, contracts);

  console.log("Unlocking words...");
  await unlockWords(owner, contracts);

  console.log("Setting prefix URI...");
  await setPrefixURI(owner, contracts);
}

export async function deployLocal(ethers: Ethers) {
  const [owner] = await ethers.getSigners();

  await deployMultiCall(ethers);

  const { mockAsh, lostPoetPages, lostPoets } = await deployLostPoets(ethers);
  const { silence } = await deployCoreContracts(ethers, lostPoets.address);
  const contracts = { mockAsh, lostPoetPages, lostPoets, silence };

  console.log("Activating page sale...");
  await activatePageSale(owner, contracts);

  console.log("Enabling page redemption...");
  await enablePageRedemption(owner, contracts);

  console.log("Unlocking words...");
  await unlockWords(owner, contracts);

  console.log("Setting prefix URI...");
  await setPrefixURI(owner, contracts);

  console.log("Buying pages...");
  await buyPages(owner, 20, contracts);

  console.log("Minting poets...");
  await mintPoets(owner, 20, contracts);

  console.log("Sending poets...");
  await sendPoets(
    owner,
    "0xBA713FE0Cf19B0CEa404b9c1E805cB2f95bE04FF",
    [1025, 1026, 1027, 1028, 1029],
    contracts
  );

  console.log("Pledging poets...");
  await pledgePoets(
    owner,
    [
      1030, 1031, 1032, 1033, 1034, 1035, 1036, 1037, 1038, 1039, 1040, 1041,
      1042, 1043,
    ],
    contracts
  );
}
