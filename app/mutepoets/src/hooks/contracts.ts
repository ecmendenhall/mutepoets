import { BigNumber } from "@ethersproject/bignumber";
import { id } from "@ethersproject/hash";
import { formatUnits, parseEther } from "@ethersproject/units";
import {
  addressEqual,
  useContractCall,
  useContractCalls,
  useContractFunction,
  useEthers,
  useTokenBalance,
} from "@usedapp/core";
import { Contract } from "@usedapp/core/node_modules/ethers";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { parseIsolatedEntityName } from "typescript";
import { getConfig } from "../config/contracts";
import { Poet, Vow, VowData } from "../types";

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

const loadPoetMetadata = async (metadataURI: string, id: BigNumber) => {
  const response = await fetch(metadataURI);
  const data = await response.json();
  return { tokenId: id, ...data };
};

export function usePoet(id: BigNumber | undefined) {
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
      if (id) {
        try {
          setLoading(true);
          const metadata = await loadPoetMetadata(tokenURI, id);
          setData(metadata);
          setLoading(false);
        } catch (error) {
          setError(true);
        }
      }
    };
    loadData();
  }, [tokenURI]);
  return { data, loading, error };
}

export function usePoets(ids: BigNumber[]) {
  const { chainId } = useEthers();
  const config = getConfig(chainId);
  const [data, setData] = useState<Poet[] | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const poetCalls = ids.map((id: BigNumber) => {
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
          poetsResponse.map(async (res, i) => {
            const [tokenURI] = res;
            return await loadPoetMetadata(tokenURI, ids[i]);
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
  const [vowCount] = useContractCall({
    abi: config.silence.abi,
    address: config.silence.address,
    method: "vowCount",
    args: [],
  }) ?? [BigNumber.from(0)];
  const vowIds = range(vowCount.add(1).toNumber())
    .slice(1)
    .map((n) => BigNumber.from(n));
  const vowCalls = vowIds.map((id: BigNumber) => {
    return {
      abi: config.silence.abi,
      address: config.silence.address,
      method: "vows",
      args: [id],
    };
  });
  const vowsResponse = (useContractCalls(vowCalls) ?? []) as Vow[];
  const vowData = vowsResponse.map((vow: Vow, i: number) => {
    if (vow) {
      const [tokenOwner, tokenId, updated] = vow;
      return {
        vowId: vowIds[i],
        tokenOwner,
        tokenId,
        updated,
      };
    }
  });
  const isVowData = (vow: VowData | undefined): vow is VowData => {
    return !!vow;
  };
  return vowData.filter(isVowData);
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
  const vowData = vowsResponse.map((vow: Vow, i: number) => {
    if (vow) {
      const [tokenOwner, tokenId, updated] = vow;
      return {
        vowId: vows[i],
        tokenOwner,
        tokenId,
        updated,
      };
    }
  });
  const isVowData = (vow: VowData | undefined): vow is VowData => {
    return !!vow;
  };
  return vowData.filter(isVowData);
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
  const claimableByVow = claimableResponse.map((res, i) => {
    if (res) {
      const [n] = res;
      return {
        vowId: vows[i],
        claimable: n,
      };
    } else {
      return {
        vowId: vows[i],
        claimable: BigNumber.from(0),
      };
    }
  });
  const totalClaimableSilence = claimableResponse.reduce((acc, res) => {
    if (res) {
      const [n] = res;
      return acc.add(n);
    } else {
      return acc;
    }
  }, parseEther("0"));
  return { totalClaimableSilence, claimableByVow };
}

export function useAllPoetsByAccount(account: string | null | undefined) {
  const { library, chainId } = useEthers();
  const config = getConfig(chainId);
  const [poetIds, setPoetIds] = useState<BigNumber[] | undefined>();
  const token = new ethers.Contract(
    config.lostPoets.address,
    config.lostPoets.abi,
    library
  );
  const poets = usePoets(poetIds || []);

  useEffect(() => {
    const loadTokenIds = async () => {
      if (account && library && token) {
        const sentLogs = await token.queryFilter(
          token.filters.Transfer(account, null)
        );
        const receivedLogs = await token.queryFilter(
          token.filters.Transfer(null, account)
        );
        const logs = sentLogs
          .concat(receivedLogs)
          .sort(
            (a, b) =>
              a.blockNumber - b.blockNumber ||
              a.transactionIndex - b.transactionIndex
          );
        const owned = new Set<string>();
        for (const log of logs) {
          if (log.args) {
            const { from, to, tokenId } = log.args;
            if (addressEqual(to, account)) {
              owned.add(tokenId.toString());
            } else if (addressEqual(from, account)) {
              owned.delete(tokenId.toString());
            }
          }
        }
        const poetIds = Array.from(owned).map((id) => BigNumber.from(id));
        setPoetIds(poetIds);
      }
    };
    loadTokenIds();
  }, [account, library, config]);

  return poets;
}

export function usePoetsByAccount(account: string | null | undefined) {
  const { chainId } = useEthers();
  const config = getConfig(chainId);
  const vows = useVowsByAccount(account);
  const { loading: loadingUserPoets, data: userPoets } =
    useAllPoetsByAccount(account);
  const { loading: loadingAllSilentPoets, data: allSilentPoets } =
    useAllPoetsByAccount(config.silence.address);

  const silentPoets = allSilentPoets?.filter((poet) => {
    return vows.some((vow) => vow?.tokenId.eq(poet.tokenId));
  });

  const muteCalls = (userPoets || []).map((poet: Poet) => {
    return {
      abi: config.lostPoets.abi,
      address: config.lostPoets.address,
      method: "getWordCount",
      args: [poet.tokenId],
    };
  });
  const muteResponse = (useContractCalls(muteCalls) ?? []) as BigNumber[][];
  const mutePoets = userPoets?.filter((_poet, i) => {
    const res = muteResponse[i];
    return res && res[0].eq(0);
  });

  const loading = loadingUserPoets || loadingAllSilentPoets;
  return { loading, userPoets, mutePoets, silentPoets };
}

export function useSilence(account: string | null | undefined) {
  const silenceBalance = useSilenceBalance(account);
  const { totalClaimableSilence, claimableByVow } =
    useClaimableSilence(account);
  return { silenceBalance, totalClaimableSilence, claimableByVow };
}

export function useVows() {
  const { chainId } = useEthers();
  const config = getConfig(chainId);
  const silentPoetsCount = usePoetBalance(config.silence.address);
  const vows = useAllVows();
  const poetIds = vows.map((vow) => vow.tokenId).filter((id) => !id.eq(0));
  console.log(poetIds);
  const silentPoets = usePoets(poetIds);
  return { silentPoetsCount, vows, silentPoets };
}

export function useApprove() {
  const { chainId } = useEthers();
  const config = getConfig(chainId);
  const contract = new Contract(config.lostPoets.address, config.lostPoets.abi);
  return useContractFunction(contract, "approve");
}

export function useTakeVow() {
  const { chainId } = useEthers();
  const config = getConfig(chainId);
  const contract = new Contract(config.silence.address, config.silence.abi);
  return useContractFunction(contract, "takeVow");
}

export function useBreakVow() {
  const { chainId } = useEthers();
  const config = getConfig(chainId);
  const contract = new Contract(config.silence.address, config.silence.abi);
  return useContractFunction(contract, "breakVow");
}

export function useClaimAll() {
  const { chainId } = useEthers();
  const config = getConfig(chainId);
  const contract = new Contract(config.silence.address, config.silence.abi);
  return useContractFunction(contract, "claimAll");
}
