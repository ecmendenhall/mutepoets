import { useEthers } from "@usedapp/core";
import { BigNumber } from "ethers";
import { useCallback } from "react";
import { getConfig } from "../config/contracts";
import { useApprove, useTakeVow } from "../hooks/contracts";
import { Poet } from "../types";
import Button from "./Button";
import PoetGrid from "./PoetGrid";
import SelectPoet from "./SelectPoet";

interface Props {
  loading: boolean;
  poets?: Poet[];
}

const TakeVow = ({ loading, poets }: Props) => {
  const { chainId } = useEthers();
  const config = getConfig(chainId);
  const { state: approveState, send: sendApprove } = useApprove();
  const { state: takeVowState, send: sendTakeVow } = useTakeVow();

  const takeVow = useCallback(() => {
    const send = async () => {
      if (poets) {
        const [lastPoet] = poets.slice(-1);
        const tokenId = BigNumber.from(lastPoet.tokenId);
        await sendApprove(config.silence.address, tokenId);
        await sendTakeVow(tokenId);
      }
    };
    send();
  }, [poets, config]);

  return (
    <div>
      {loading ? (
        "Loading..."
      ) : (
        <SelectPoet placeChildren="right" loading={loading} poets={poets || []}>
          <Button color="gray" onClick={takeVow}>
            Take the vow
          </Button>
        </SelectPoet>
      )}
    </div>
  );
};

export default TakeVow;
