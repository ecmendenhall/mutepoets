import { ChainId, Config, MULTICALL_ADDRESSES } from "@usedapp/core";

const config: Config = {
  notifications: {
    checkInterval: 500,
    expirationPeriod: 15000,
  },
  readOnlyChainId: ChainId.Mainnet,
  readOnlyUrls: {
    [ChainId.Mainnet]: "https://eth-mainnet.alchemyapi.io/v2/yKp4fRLWn1RjOU4E2oNxHK4oxEUz3Wl7",
    [ChainId.Hardhat]: "http://localhost:8545",
    [ChainId.Rinkeby]: "https://eth-rinkeby.alchemyapi.io/v2/",
    [ChainId.Ropsten]: "https://eth-ropsten.alchemyapi.io/v2/",
    [ChainId.Kovan]: "https://eth-kovan.alchemyapi.io/v2/",

  },
  multicallAddresses: {
    [ChainId.Hardhat]: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    ...MULTICALL_ADDRESSES,
  },
};

export default config;
