import { ChainId } from "@usedapp/core";
import { Interface } from "ethers/lib/utils";

const LOST_POETS_MAINNET = "0x4b3406a41399c7FD2BA65cbC93697Ad9E7eA61e5";

const config = {
  [ChainId.Hardhat]: {
    lostPoets: {
      address: LOST_POETS_MAINNET, //"0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
      abi: new Interface([
        "function balanceOf(address owner) returns (uint256)",
        "function tokenURI(uint256 tokenId) returns (string)",
        "function totalSupply() returns (uint256)",
        "function getWordCount(uint256 tokenId) returns (uint256)",
        "function approve(address to, uint256 tokenId)",
        "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
        "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
      ]),
    },
    silence: {
      address: "0x21dF544947ba3E8b3c32561399E88B52Dc8b2823", //"0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
      abi: new Interface([
        "function takeVow(uint256 tokenId)",
        "function breakVow(uint256 vowId)",
        "function claim(uint256 vowId)",
        "function claimAll()",
        "function claimBatch(uint256[] memory vowIds)",
        "function claimable(uint256 vowId) returns (uint256)",
        "function getVowsByAddress(address tokenOwner) returns (uint256[] memory)",
        "function vows(uint256 vowId) returns (address, uint256, uint256)",
        "function vowCount() returns (uint256)",
        "function balanceOf(address owner) returns (uint256)",
        "event Transfer(address indexed from, address indexed to, uint256 value)",
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
