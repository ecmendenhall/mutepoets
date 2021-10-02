import { useEthers, useTokenBalance } from "@usedapp/core";
import FullPage from "../layouts/FullPage";
import { getConfig } from "../config/contracts";
import { formatEther, formatUnits } from "@ethersproject/units";
import {
  useAllPoetsByAccount,
  usePoetsByAccount,
  useTakeVow,
  useVows,
  useVowsByAccount,
} from "../hooks/contracts";
import Button from "../components/Button";
import PoetGrid from "../components/PoetGrid";
import Poets from "../components/Poets";
import TakeVow from "../components/TakeVow";
import BreakVow from "../components/BreakVow";
import { useCallback } from "react";

const Vows = () => {
  const { account } = useEthers();
  const {
    silentPoetsCount,
    vows,
    silentPoets: { loading: loadingSilentPoets, data: allSilentPoets },
  } = useVows();
  const userVows = useVowsByAccount(account);
  const {
    loading: loadingMyPoets,
    silentPoets,
    mutePoets,
  } = usePoetsByAccount(account);

  return (
    <FullPage subhed='"So tell me librarian, do you want an army of mute Poets or a Poet who can speak a lot of things?"'>
      <div className="font-body text-l">
        <div className="flex flex-col mb-8">
          <TakeVow loading={loadingMyPoets} poets={mutePoets} />
          <BreakVow loading={loadingMyPoets} poets={silentPoets} />
          <Poets
            loading={loadingSilentPoets}
            poets={allSilentPoets}
            silentPoetsCount={silentPoetsCount}
          />
        </div>
      </div>
    </FullPage>
  );
};

export default Vows;
