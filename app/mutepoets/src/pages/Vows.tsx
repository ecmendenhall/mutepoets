import { useEthers, useTokenBalance } from "@usedapp/core";
import FullPage from "../layouts/FullPage";
import { getConfig } from "../config/contracts";
import { formatEther, formatUnits } from "@ethersproject/units";
import {
  usePoetsByAccount,
  useVows,
  useVowsByAccount,
} from "../hooks/contracts";

const Vows = () => {
  const { account } = useEthers();
  const {
    silentPoetsCount,
    vows,
    silentPoets: { loading, data },
  } = useVows();
  const userVows = useVowsByAccount(account);
  const { loading: loadingMyPoets, data: myPoets } = usePoetsByAccount(account);

  return (
    <FullPage subhed='"So tell me librarian, do you want an army of mute Poets or a Poet who can speak a lot of things?"'>
      <div className="font-body text-l">
        <div className="flex flex-col mb-8">
          <div>
            <h4 className="font-black font-display text-l text-center uppercase mb-2">
              take the vow
            </h4>
            <div className="grid gap-0 grid-cols-3 md:grid-cols-5 lg:grid-cols-7 mb-8">
              {!loadingMyPoets &&
                myPoets &&
                myPoets.map((poet) => {
                  return (
                    <div
                      className="bg-gray-100 text-center shadow"
                      key={poet.name}
                    >
                      <div>
                        <img src={poet.image_url} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
          <div>
            <h4 className="font-black font-display text-l text-center uppercase mb-2">
              {silentPoetsCount && formatUnits(silentPoetsCount, "wei")} Poets
              have taken the vow
            </h4>
            <div className="grid gap-0 grid-cols-3 md:grid-cols-5 lg:grid-cols-7 mb-8">
              {!loading &&
                data &&
                data.map((poet) => {
                  return (
                    <div
                      className="bg-gray-100 text-center shadow"
                      key={poet.name}
                    >
                      <div>
                        <img src={poet.image_url} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </FullPage>
  );
};

export default Vows;
