import { BigNumber } from "ethers";

export interface PoetAttribute {
  trait_type: string;
  value: string;
}

export interface Poet {
  tokenId: BigNumber;
  name: string;
  description: string;
  image: string;
  image_url: string;
  attributes: PoetAttribute[];
}

export interface VowData {
  vowId: BigNumber;
  tokenOwner: string;
  tokenId: BigNumber;
  updated: BigNumber;
}

export type MetadataURI = string;
export type Vow = [string, BigNumber, BigNumber];
