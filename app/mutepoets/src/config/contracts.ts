import { ChainId } from "@usedapp/core";
import { Interface } from "ethers/lib/utils";

const config = {
  [ChainId.Mainnet]: {
    lostPoets: {
      address: "0x4b3406a41399c7FD2BA65cbC93697Ad9E7eA61e5",
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
      address: "0xC8f7707462921A1d0653189708e0265831aefD8b",
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
        "event TakeVow(address indexed owner, uint256 tokenId)",
        "event BreakVow(address indexed owner, uint256 vowId, uint256 tokenId)",
        "event Claim(address indexed owner, uint256 vowId, uint256 amount)",
        "event ClaimBatch(address indexed owner, uint256[] vowIds, uint256 total)",
        "event ProposeTransfer(address indexed to, uint256 tokenId)",
      ]),
    },
  },
  [ChainId.Hardhat]: {
    lostPoets: {
      address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
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
      address: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
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
        "event TakeVow(address indexed owner, uint256 tokenId)",
        "event BreakVow(address indexed owner, uint256 vowId, uint256 tokenId)",
        "event Claim(address indexed owner, uint256 vowId, uint256 amount)",
        "event ClaimBatch(address indexed owner, uint256[] vowIds, uint256 total)",
        "event ProposeTransfer(address indexed to, uint256 tokenId)",
      ]),
    },
  },
  [ChainId.Ropsten]: {
    lostPoets: {
      address: "0x39E689C76a89409dB925bC7c4100d8fBe75d5F45",
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
        "function vowCount() returns (uint256)",
        "function balanceOf(address owner) returns (uint256)",
        "event Transfer(address indexed from, address indexed to, uint256 value)",
        "event TakeVow(address indexed owner, uint256 tokenId)",
        "event BreakVow(address indexed owner, uint256 vowId, uint256 tokenId)",
        "event Claim(address indexed owner, uint256 vowId, uint256 amount)",
        "event ClaimBatch(address indexed owner, uint256[] vowIds, uint256 total)",
        "event ProposeTransfer(address indexed to, uint256 tokenId)",
      ]),
    },
  },
  [ChainId.Kovan]: {
    lostPoets: {
      address: "0x39E689C76a89409dB925bC7c4100d8fBe75d5F45",
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
        "function vowCount() returns (uint256)",
        "function balanceOf(address owner) returns (uint256)",
        "event Transfer(address indexed from, address indexed to, uint256 value)",
        "event TakeVow(address indexed owner, uint256 tokenId)",
        "event BreakVow(address indexed owner, uint256 vowId, uint256 tokenId)",
        "event Claim(address indexed owner, uint256 vowId, uint256 amount)",
        "event ClaimBatch(address indexed owner, uint256[] vowIds, uint256 total)",
        "event ProposeTransfer(address indexed to, uint256 tokenId)",
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
        "function getWordCount(uint256 tokenId) returns (uint256)",
        "function approve(address to, uint256 tokenId)",
        "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
        "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
      ]),
    },
    silence: {
      address: "0x7834e8d37126dD002D70780b082b39DFE7E998d7",
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
        "event TakeVow(address indexed owner, uint256 tokenId)",
        "event BreakVow(address indexed owner, uint256 vowId, uint256 tokenId)",
        "event Claim(address indexed owner, uint256 vowId, uint256 amount)",
        "event ClaimBatch(address indexed owner, uint256[] vowIds, uint256 total)",
        "event ProposeTransfer(address indexed to, uint256 tokenId)",
      ]),
    },
  },
};

export const getConfig = (chainId: ChainId | undefined) => {
  switch (chainId) {
    case ChainId.Mainnet:
      return config[ChainId.Mainnet];
    case ChainId.Hardhat:
      return config[ChainId.Hardhat];
    case ChainId.Ropsten:
      return config[ChainId.Ropsten];
    case ChainId.Rinkeby:
      return config[ChainId.Rinkeby];
    case ChainId.Kovan:
      return config[ChainId.Kovan];
    default:
      return config[ChainId.Hardhat];
  }
};

export default config;
