import { task } from "hardhat/config";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-solhint";
import "hardhat-gas-reporter";
import "solidity-coverage";
import dotenv from "dotenv";
import { deployLocal, deployTestnet, deployMainnet } from "./scripts/deploy";
import { ethers } from "ethers";

dotenv.config();

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("deploy:local", "Deploys contracts", async (args, hre) => {
  await deployLocal(hre.ethers, hre.network);
});

task("deploy:testnet", "Deploys contracts", async (args, hre) => {
  await deployTestnet(hre.ethers);
});

task("deploy:mainnet", "Deploys contracts", async (args, hre) => {
  await deployMainnet(hre.ethers);
});

export default {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      forking: {
        enabled: false,
        url: process.env.ALCHEMY_API_KEY,
      },
      allowUnlimitedContractSize: true,
      initialBaseFeePerGas: 0, // workaround from https://github.com/sc-forks/solidity-coverage/issues/652#issuecomment-896330136 . Remove when that issue is closed.
    },
    rinkeby: {
      url: process.env.RINKEBY_URL || "",
      accounts: { mnemonic: process.env.RINKEBY_MNEMONIC },
    },
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts: { mnemonic: process.env.ROPSTEN_MNEMONIC },
    },
    kovan: {
      url: process.env.KOVAN_URL || "",
      accounts: { mnemonic: process.env.KOVAN_MNEMONIC },
    },
    mainnet: {
      url: process.env.MAINNET_URL || "",
      accounts: { mnemonic: process.env.MAINNET_MNEMONIC },
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
