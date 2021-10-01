import { ChainId } from "@usedapp/core";
import { Interface } from "ethers/lib/utils";

const config = {
  [ChainId.Hardhat]: {
    lostPoets: {
      address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
      abi: new Interface([
        "function balanceOf(address owner) returns (uint256)",
        "function tokenURI(uint256 tokenId) returns (string)",
        "function totalSupply() returns (uint256)",
      ]),
    },
    silence: {
      address: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
      abi: new Interface([
        "function takeVow(uint256 tokenId)",
        "function breakVow(uint256 vowId)",
        "function claim(uint256 vowId)",
        "function claimAll()",
        "function claimBatch(uint256[] memory vowIds)",
        "function claimable(uint256 vowId) returns (uint256)",
        "function getVowsByAddress(address tokenOwner) returns (uint256[] memory)",
        "function balanceOf(address owner) returns (uint256)",
      ]),
    },
  },
  [ChainId.Rinkeby]: {
    lostPoets: {
      address: "0x39E689C76a89409dB925bC7c4100d8fBe75d5F45",
      abi: new Interface([
        "function balanceOf(address owner) returns (uint256)",
        "function tokenURI(uint256 tokenId) returns (string)",
        "function totalSupply() returns (uint256)",
      ]),
    },
    silence: {
      address: "0x3C7dfEEaBb3a801ca779479C9b23259FF1C67269",
      abi: new Interface([
        "function takeVow(uint256 tokenId)",
        "function breakVow(uint256 vowId)",
        "function claim(uint256 vowId)",
        "function claimAll()",
        "function claimBatch(uint256[] memory vowIds)",
        "function claimable(uint256 vowId) returns (uint256)",
        "function getVowsByAddress(address tokenOwner) returns (uint256[] memory)",
        "function vows(uint256 vowId) returns (address, uint256, uint256)",
        "function balanceOf(address owner) returns (uint256)",
      ]),
    },
  },
};

export const getConfig = (chainId: ChainId | undefined) => {
  switch (chainId) {
    case ChainId.Hardhat:
      return config[ChainId.Hardhat];
    case ChainId.Rinkeby:
      return config[ChainId.Rinkeby];
    default:
      return config[ChainId.Hardhat];
  }
};

export default config;
