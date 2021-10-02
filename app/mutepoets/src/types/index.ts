import { BigNumber } from "ethers";

export interface PoetAttribute {
  trait_type: string;
  value: string;
}

export interface Poet {
  tokenId: number;
  name: string;
  description: string;
  image: string;
  image_url: string;
  attributes: PoetAttribute[];
}

export type MetadataURI = string;
export type Vow = [string, BigNumber, BigNumber];
