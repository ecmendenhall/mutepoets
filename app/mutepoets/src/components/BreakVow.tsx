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
  const [selectedPoet, setSelectedPoet] = useState<Poet>();
  const [actionState, setActionState] = useState<ActionState>("start");

  const breakVow = useCallback(() => {
    const send = async () => {
      if (selectedPoet && userVows) {
        const vow = userVows.find((vow) =>
          vow?.tokenId.eq(selectedPoet.tokenId)
        );
        if (vow) {
          console.log(vow);
          setActionState("confirm");
          setSelectEnabled(false);
          await sendBreakVow(vow.vowId);
          setActionState("start");
          setSelectedPoet(undefined);
          setSelectEnabled(true);
        }
      }
    };
    send();
  }, [selectedPoet, userVows, sendBreakVow]);

  const onPoetSelected = (poet: Poet) => {
    console.log(poet);
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
