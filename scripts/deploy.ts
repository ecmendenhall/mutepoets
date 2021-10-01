import { Contract, ethers } from "ethers";
import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MockERC20, LostPoetPages, LostPoets, Silence } from "../typechain";

type Ethers = typeof ethers & HardhatEthersHelpers;

interface Contracts {
  mockAsh: MockERC20;
  lostPoetPages: LostPoetPages;
  lostPoets: LostPoets;
  silence: Silence;
}

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
}
