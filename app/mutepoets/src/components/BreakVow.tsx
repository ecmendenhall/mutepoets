import { useEthers } from "@usedapp/core";
import { BigNumber } from "ethers";
import { useCallback } from "react";
import { useBreakVow, useVowsByAccount } from "../hooks/contracts";
import { Poet } from "../types";
import Button from "./Button";
import PoetGrid from "./PoetGrid";

interface Props {
  loading: boolean;
  poets?: Poet[];
}

const BreakVow = ({ loading, poets }: Props) => {
  const { account } = useEthers();
  const userVows = useVowsByAccount(account);
  const { state: breakVowState, send: sendBreakVow } = useBreakVow();

  const breakVow = useCallback(() => {
    const send = async () => {
      if (poets && userVows) {
        const [lastPoet] = poets.slice(-1);
        const tokenId = BigNumber.from(lastPoet.tokenId);
        const vow = userVows.find((vow) => vow?.tokenId.eq(tokenId));
        if (vow) {
          console.log(vow);
          sendBreakVow(vow.vowId);
        }
      }
    };
    send();
  }, [poets, userVows]);

  return (
    <div>
      <PoetGrid placeChildren="left" loading={loading} poets={poets || []}>
        <Button color="gray" onClick={breakVow}>
          Break the vow
        </Button>
      </PoetGrid>
    </div>
  );
};

export default BreakVow;
