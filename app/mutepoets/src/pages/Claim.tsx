import { useEthers } from "@usedapp/core";
import { formatEther, formatUnits } from "@ethersproject/units";
import { useSilence } from "../hooks/contracts";
import FullPage from "../layouts/FullPage";

const Claim = () => {
  const { account } = useEthers();
  const { silenceBalance, totalClaimableSilence } = useSilence(account);

  return (
    <FullPage subhed='"So tell me librarian, do you want an army of mute Poets or a Poet who can speak a lot of things?"'>
      <div className="font-body text-l">
        <div className="flex flex-col items-center justify-evenly mb-8">
          <div>SILENCE: {silenceBalance && formatEther(silenceBalance)}</div>
          <div>Claimable: {formatEther(totalClaimableSilence)}</div>
        </div>
      </div>
    </FullPage>
  );
};

export default Claim;
