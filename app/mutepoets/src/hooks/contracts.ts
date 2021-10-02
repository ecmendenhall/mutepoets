import { BigNumber } from "@ethersproject/bignumber";
import { id } from "@ethersproject/hash";
import { formatUnits, parseEther } from "@ethersproject/units";
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

type MetadataURI = string;
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
      try {
        setLoading(true);
        const metadata = await loadPoetMetadata(tokenURI);
        setData(metadata);
        setLoading(false);
      } catch (error) {
        setError(true);
      }
    };
    loadData();
  }, [tokenURI]);
  return { data, loading, error };
}

export function usePoets(ids: number[]) {
  const { chainId } = useEthers();
  const config = getConfig(chainId);
  const [data, setData] = useState<Poet[] | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const poetCalls = ids.map((id: number) => {
    return {
      abi: config.lostPoets.abi,
      address: config.lostPoets.address,
      method: "tokenURI",
      args: [id],
    };
  });
  const poetsResponse = (useContractCalls(poetCalls) ?? []) as string[][];
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const metadata = await Promise.all(
          poetsResponse.map(async (res) => {
            const [tokenURI] = res;
            return await loadPoetMetadata(tokenURI);
          })
        );
        setData(metadata);
        setLoading(false);
      } catch (error) {
        setError(true);
      }
    };
    if (!data && ids.length > 0) {
      loadData();
    }
  }, [ids]);
  return { data, loading, error };
}

export function useAllVows() {
  const { chainId } = useEthers();
  const config = getConfig(chainId);
  const vowCalls = range(100).map((id: number) => {
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

export function useVowsByAccount(account: string | null | undefined) {
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

export function useClaimableSilenceByVow(vowId: number) {
  const { chainId } = useEthers();
  const config = getConfig(chainId);
  const [claimable] =
    useContractCall({
      abi: config.silence.abi,
      address: config.silence.address,
      method: "claimable",
      args: [vowId],
    }) ?? [];
  return claimable || 0;
}

export function useClaimableSilence(account: string | null | undefined) {
  const { chainId } = useEthers();
  const config = getConfig(chainId);
  const [vows] =
    useContractCall({
      abi: config.silence.abi,
      address: config.silence.address,
      method: "getVowsByAddress",
      args: [account],
    }) ?? [];
  const claimableCalls = (vows || []).map((id: number) => {
    return {
      abi: config.silence.abi,
      address: config.silence.address,
      method: "claimable",
      args: [id],
    };
  });
  const claimableResponse = (useContractCalls(claimableCalls) ??
    []) as BigNumber[][];
  return claimableResponse.reduce((acc, res) => {
    if (res) {
      const [n] = res;
      return acc.add(n);
    } else {
      return acc;
    }
  }, parseEther("0"));
}

export function useSilence(account: string | null | undefined) {
  const { chainId } = useEthers();
  const config = getConfig(chainId);
  const silenceBalance = useSilenceBalance(account);
  const totalClaimableSilence = useClaimableSilence(account);
  return { silenceBalance, totalClaimableSilence };
}

export function useVows() {
  const { chainId } = useEthers();
  const config = getConfig(chainId);
  const silentPoetsCount = usePoetBalance(config.silence.address);
  const vows = useAllVows();
  const isId = (id: number | undefined): id is number => {
    return !!id;
  };
  const poetIds = vows.map((vow) => vow?.tokenId.toNumber()).filter(isId);
  const silentPoets = usePoets(poetIds);
  return { silentPoetsCount, vows, silentPoets };
}
