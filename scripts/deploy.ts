import { Contract, ethers } from "ethers";
import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { parseEther } from "ethers/lib/utils";
import { Network } from "hardhat/types";
import readlineSync from "readline-sync";

type Ethers = typeof ethers & HardhatEthersHelpers;

interface Contracts {
  mockAsh: Contract;
  lostPoetPages: Contract;
  lostPoets: Contract;
  silence: Contract;
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

const mintOrigins = async (signer: SignerWithAddress, contracts: Contracts) => {
  await contracts.lostPoets
    .connect(signer)
    .mintOrigins(
      [
        contracts.silence.address,
        contracts.silence.address,
        contracts.silence.address,
        contracts.silence.address,
      ],
      [100, 101, 102, 103]
    );
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
      .approve(contracts.silence.address, id);
    await contracts.silence.connect(signer).takeVow(id);
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

const setEtherBalance = async (
  account: string,
  amount: string,
  network: Network
) => {
  await network.provider.send("hardhat_setBalance", [account, amount]);
};

async function deployMultiCall(ethers: Ethers) {
  const Multicall = await ethers.getContractFactory("Multicall");
  const multicall = await Multicall.deploy();
  await multicall.deployed();

  console.log("Multicall deployed to:", multicall.address);
}

async function deployLostPoets(ethers: Ethers) {
  const MockERC20Factory = await ethers.getContractFactory("MockERC20");
  const mockAsh = await MockERC20Factory.deploy("Mock Ash", "ASH");
  await mockAsh.deployed();

  console.log("MockAsh deployed to:", mockAsh.address);

  const LostPoetPagesFactory = await ethers.getContractFactory("LostPoetPages");
  const lostPoetPages = await LostPoetPagesFactory.deploy({
    gasLimit: 7_000_000,
  });
  await lostPoetPages.deployed();

  console.log("LostPoetPages deployed to:", lostPoetPages.address);

  const LostPoetsFactory = await ethers.getContractFactory("LostPoets");
  const lostPoets = await LostPoetsFactory.deploy(lostPoetPages.address, {
    gasLimit: 7_000_000,
  });
  await lostPoets.deployed();

  console.log("LostPoets deployed to:", lostPoets.address);

  return { mockAsh, lostPoetPages, lostPoets };
}

async function deployCoreContracts(ethers: Ethers, lostPoetsAddress: string) {
  const SilenceFactory = await ethers.getContractFactory("Silence");
  console.log("Deploying Silence...");
  const silence = await SilenceFactory.deploy(lostPoetsAddress);
  console.log("Deploy tx: ", silence.deployTransaction.hash);
  console.log(
    "Gas price:",
    ethers.utils.formatUnits(silence.deployTransaction.gasPrice || "0", "gwei")
  );
  console.log(
    "Max fee per gas:",
    ethers.utils.formatUnits(
      silence.deployTransaction.maxFeePerGas || "0",
      "gwei"
    )
  );
  console.log(
    "Max priority fee per gas:",
    ethers.utils.formatUnits(
      silence.deployTransaction.maxPriorityFeePerGas || "0",
      "gwei"
    )
  );
  await silence.deployed();

  console.log("Silence deployed to:", silence.address);
  return { silence };
}

export async function deployMainnet(ethers: Ethers) {
  const [owner] = await ethers.getSigners();
  console.log("Deployer address:", owner.address);

  const gasEstimate = await ethers.provider.getFeeData();
  console.log("Gas estimate:");
  console.log(
    "Gas price:",
    ethers.utils.formatUnits(gasEstimate.gasPrice || "0", "gwei")
  );
  console.log(
    "Max fee per gas:",
    ethers.utils.formatUnits(gasEstimate.maxFeePerGas || "0", "gwei")
  );
  console.log(
    "Max priority fee per gas:",
    ethers.utils.formatUnits(gasEstimate.maxPriorityFeePerGas || "0", "gwei")
  );

  if (readlineSync.keyInYN("Accept this gas estimate and continue?")) {
    const LOST_POETS_MAINNET_ADDRESS =
      "0x4b3406a41399c7FD2BA65cbC93697Ad9E7eA61e5";
    const { silence } = await deployCoreContracts(
      ethers,
      LOST_POETS_MAINNET_ADDRESS
    );
  } else {
    console.log("Skipping deployment...");
  }
}

export async function deployTestnet(ethers: Ethers) {
  const [owner] = await ethers.getSigners();

  const { mockAsh, lostPoetPages, lostPoets } = await deployLostPoets(ethers);
  const { silence } = await deployCoreContracts(ethers, lostPoets.address);
  const contracts = { silence, mockAsh, lostPoetPages, lostPoets };

  console.log("Activating page sale...");
  await activatePageSale(owner, contracts);

  console.log("Enabling page redemption...");
  await enablePageRedemption(owner, contracts);

  console.log("Unlocking words...");
  await unlockWords(owner, contracts);

  console.log("Setting prefix URI...");
  await setPrefixURI(owner, contracts);

  console.log("Buying pages...");
  await buyPages(owner, 6, contracts);

  console.log("Minting poets...");
  await mintPoets(owner, 1, contracts);

  console.log("Sending poets...");
  await sendPoets(
    owner,
    "0xe979054eB69F543298406447D8AB6CBBc5791307",
    [1025, 1026, 1027],
    contracts
  );

  console.log("Pledging poets...");
  await pledgePoets(owner, [1028, 1029, 1030], contracts);
}

export async function deployLocal(ethers: Ethers, network: Network) {
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
  await buyPages(owner, 300, contracts);

  console.log("Minting poets...");
  await mintPoets(owner, 300, contracts);

  console.log("Sending poets...");
  await sendPoets(
    owner,
    "0xe979054eB69F543298406447D8AB6CBBc5791307",
    [
      1025, 1026, 1027, 1028, 1029, 1030, 1031, 1032, 1033, 1034, 1035, 1036,
      1037, 1038, 1039, 1040, 1041, 1042, 1043, 1044, 1045,
    ],
    contracts
  );

  console.log("Pledging poets...");
  await pledgePoets(
    owner,
    [
      1046, 1047, 1048, 1049, 1050, 1051, 1052, 1053, 1054, 1055, 1056, 1057,
      1058, 1059, 1060, 1061, 1062, 1063, 1064, 1065, 1066, 1067, 1068, 1069,
      1070, 1071, 1072, 1073, 1074, 1075, 1076, 1077, 1078, 1079, 1080, 1081,
      1082, 1083, 1084, 1085, 1086, 1087, 1088, 1089, 1090, 1091, 1092, 1093,
      1094, 1095, 1096, 1097, 1098, 1099, 1100, 1101, 1102, 1103, 1104, 1105,
      1106, 1107, 1108, 1109, 1110, 1111, 1112, 1113, 1114, 1115, 1116, 1117,
      1118, 1119, 1120, 1121, 1122, 1123, 1124, 1125, 1126, 1127, 1128, 1129,
      1130, 1131, 1132, 1133, 1134, 1135, 1136, 1137, 1138, 1139, 1140, 1141,
      1142, 1143, 1144, 1145, 1146, 1147, 1148, 1149, 1150, 1151, 1152, 1153,
    ],
    contracts
  );

  console.log("Minting origins...");
  await mintOrigins(owner, contracts);

  console.log("Setting Ether balance...");
  await setEtherBalance(
    "0xe979054eB69F543298406447D8AB6CBBc5791307",
    parseEther("10").toHexString(),
    network
  );
}
