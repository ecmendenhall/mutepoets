import { useEthers } from "@usedapp/core";
import { useCallback, useState } from "react";
import { getConfig } from "../config/contracts";
import { useApprove, useTakeVow } from "../hooks/contracts";
import { Poet } from "../types";
import Button from "./Button";
import SelectPoet from "./SelectPoet";
import TransactionStatus from "./TransactionStatus";

type ActionState = "start" | "approve" | "confirm";

interface Props {
  loading: boolean;
  poets?: Poet[];
}

const TakeVow = ({ loading, poets }: Props) => {
  const { chainId } = useEthers();
  const config = getConfig(chainId);
  const { state: approveState, send: sendApprove } = useApprove();
  const { state: takeVowState, send: sendTakeVow } = useTakeVow();
  const [selectEnabled, setSelectEnabled] = useState<boolean>(true);
  const [vowPending, setVowPending] = useState<boolean>(false);
  const [selectedPoet, setSelectedPoet] = useState<Poet>();
  const [actionState, setActionState] = useState<ActionState>("start");

  const takeVow = useCallback(() => {
    const send = async () => {
      setVowPending(true);
      try {
        if (selectedPoet) {
          setActionState("approve");
          await sendApprove(config.silence.address, selectedPoet.tokenId);
          setActionState("confirm");
          setSelectEnabled(false);
          await sendTakeVow(selectedPoet.tokenId);
          setActionState("start");
          setSelectedPoet(undefined);
          setSelectEnabled(true);
        }
      } finally {
        setVowPending(false);
      }
    };
    if (!vowPending) {
      send();
    }
  }, [selectedPoet, config, sendApprove, sendTakeVow]);

  const onPoetSelected = (poet: Poet) => {
    console.log(poet);
    setSelectedPoet(poet);
  };

  const buttonText = () => {
    switch (actionState) {
      case "start":
        return "Take the vow";
      case "approve":
        return "Approve";
      case "confirm":
        return "Confirm";
    }
  };

  return (
    <div>
      {loading ? (
        "Loading..."
      ) : (
        <SelectPoet
          placeChildren="right"
          loading={loading}
          poets={poets || []}
          enabled={selectEnabled}
          onSelect={onPoetSelected}
        >
          <Button color="gray" onClick={takeVow}>
            {buttonText()}
          </Button>
        </SelectPoet>
      )}
    </div>
  );
};

export default TakeVow;
