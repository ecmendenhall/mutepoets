import { useEthers } from "@usedapp/core";
import FullPage from "../layouts/FullPage";
import { usePoetsByAccount, useVows } from "../hooks/contracts";
import Poets from "../components/Poets";
import TakeVow from "../components/TakeVow";
import BreakVow from "../components/BreakVow";

const Vows = () => {
  const { account } = useEthers();
  const {
    silentPoetsCount,
    silentPoets: { loading: loadingSilentPoets, data: allSilentPoets },
  } = useVows();
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
