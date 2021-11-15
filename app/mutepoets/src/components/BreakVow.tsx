import { useEthers } from "@usedapp/core";
import { useCallback, useState } from "react";
import { useBreakVow, useVowsByAccount } from "../hooks/contracts";
import { Poet } from "../types";
import Button from "./Button";
import SelectPoet from "./SelectPoet";

type ActionState = "start" | "select" | "confirm";

interface Props {
  loading: boolean;
  poets?: Poet[];
}

const BreakVow = ({ loading, poets }: Props) => {
  const { account } = useEthers();
  const userVows = useVowsByAccount(account);
  const { state: breakVowState, send: sendBreakVow } = useBreakVow();
  const [selectEnabled, setSelectEnabled] = useState<boolean>(true);
  const [breakVowPending, setBreakVowPending] = useState<boolean>(false);
  const [selectedPoet, setSelectedPoet] = useState<Poet>();
  const [actionState, setActionState] = useState<ActionState>("start");

  const breakVow = useCallback(() => {
    const send = async () => {
      setBreakVowPending(true);
      try {
        if (selectedPoet && userVows) {
          const vow = userVows.find((vow) =>
            vow?.tokenId.eq(selectedPoet.tokenId)
          );
          if (vow) {
            setActionState("confirm");
            setSelectEnabled(false);
            await sendBreakVow(vow.vowId);
            setActionState("start");
            setSelectedPoet(undefined);
            setSelectEnabled(true);
          }
        }
      } finally {
        setBreakVowPending(false);
      }
    };
    if (!breakVowPending) {
      send();
    }
  }, [selectedPoet, userVows, breakVowPending, sendBreakVow]);

  const onPoetSelected = (poet: Poet) => {
    setSelectedPoet(poet);
  };

  const buttonText = () => {
    switch (actionState) {
      case "start":
        return "Break the vow";
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
          placeChildren="left"
          loading={loading}
          poets={poets || []}
          enabled={selectEnabled}
          onSelect={onPoetSelected}
        >
          <Button color="gray" onClick={breakVow}>
            {buttonText()}
          </Button>
        </SelectPoet>
      )}
    </div>
  );
};

export default BreakVow;
