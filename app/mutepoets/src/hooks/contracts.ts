import { BigNumber } from "@ethersproject/bignumber";
import { formatUnits } from "@ethersproject/units";
import {
  useContractCall,
  useContractCalls,
  useContractFunction,
  useEthers,
  useTokenBalance,
} from "@usedapp/core";
import { useEffect, useState } from "react";
import { getConfig } from "../config/contracts";

interface PoetAttribute {
  trait_type: string;
  value: string;
}

interface Poet {
  name: string;
  description: string;
  image: string;
  image_url: string;
  attributes: PoetAttribute[];
}

type Vow = [string, BigNumber, BigNumber];

const range = (i: number) => {
  return Array.from({ length: i }, (_x, i) => i);
};

export function useSilenceBalance(account: string | null | undefined) {
  const { chainId } = useEthers();
  const config = getConfig(chainId);
  return useTokenBalance(config.silence.address, account);
}

export function usePoetBalance(account: string | null | undefined) {
  const { chainId } = useEthers();
  const config = getConfig(chainId);
  return useTokenBalance(config.lostPoets.address, account);
}

const loadPoetMetadata = async (metadataURI: string) => {
  const response = await fetch(metadataURI);
  const data = await response.json();
  return data;
};

export function usePoet(id: number | undefined) {
  const { chainId } = useEthers();
  const config = getConfig(chainId);
  const [data, setData] = useState<Poet | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [tokenURI] =
    useContractCall({
      abi: config.lostPoets.abi,
      address: config.lostPoets.address,
      method: "tokenURI",
      args: [id],
    }) ?? [];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const metadata = await loadPoetMetadata(tokenURI);
      setData(metadata);
      setLoading(false);
    };
    loadData();
  }, [tokenURI]);
  return { data, loading, error };
}

export function useVows(account: string | null | undefined) {
  const { chainId } = useEthers();
  const config = getConfig(chainId);
  const [vows] =
    useContractCall({
      abi: config.silence.abi,
      address: config.silence.address,
      method: "getVowsByAddress",
      args: [account],
    }) ?? [];
  const vowCalls = (vows || []).map((id: number) => {
    return {
      abi: config.silence.abi,
      address: config.silence.address,
      method: "vows",
      args: [id],
    };
  });
  const vowsResponse = (useContractCalls(vowCalls) ?? []) as Vow[];
  const vowData = vowsResponse.map((vow: Vow) => {
    if (vow) {
      const [tokenOwner, tokenId, updated] = vow;
      return {
        tokenOwner,
        tokenId,
        updated,
      };
    }
  });
  return vowData;
}

export function useSilence() {
  const { chainId } = useEthers();
  const config = getConfig(chainId);
  const pledgedPoets = usePoetBalance(config.silence.address);
  return { pledgedPoets };
}
