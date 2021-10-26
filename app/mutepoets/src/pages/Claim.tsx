import { useEthers } from "@usedapp/core";
import {
  usePoetsByAccount,
  useSilence,
  useVowsByAccount,
} from "../hooks/contracts";
import FullPage from "../layouts/FullPage";
import ClaimSilence from "../components/ClaimSilence";

const Claim = () => {
  const { account } = useEthers();
  const { silenceBalance, totalClaimableSilence, claimableByVow } =
    useSilence(account);
  const { loading: loadingMyPoets, silentPoets } = usePoetsByAccount(account);
  const vows = useVowsByAccount(account);

  return (
    <FullPage subhed='"So tell me librarian, do you want an army of mute Poets or a Poet who can speak a lot of things?"'>
      <div className="font-body text-l">
        <div className="flex flex-col mb-8">
          <ClaimSilence
            loading={loadingMyPoets}
            poets={silentPoets}
            silenceBalance={silenceBalance}
            vows={vows}
            claimableByVow={claimableByVow}
            totalClaimableSilence={totalClaimableSilence}
          />
        </div>
      </div>
    </FullPage>
  );
};

export default Claim;
