import { ChainId, Config, MULTICALL_ADDRESSES } from "@usedapp/core";

const config: Config = {
  readOnlyChainId: ChainId.Hardhat,
  readOnlyUrls: {
    [ChainId.Hardhat]: "http://localhost:8545",
    [ChainId.Rinkeby]: "https://eth-rinkeby.alchemyapi.io/v2/",
  },
  multicallAddresses: {
    [ChainId.Hardhat]: "0x1fA02b2d6A771842690194Cf62D91bdd92BfE28d", //"0x5FbDB2315678afecb367f032d93F642f64180aa3",
    ...MULTICALL_ADDRESSES,
  },
};

export default config;
