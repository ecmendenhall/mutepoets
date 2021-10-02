import { useEthers, useTokenBalance } from "@usedapp/core";
import FullPage from "../layouts/FullPage";
import { getConfig } from "../config/contracts";
import { formatEther, formatUnits } from "@ethersproject/units";
import { useVows, useVowsByAccount } from "../hooks/contracts";

const Vows = () => {
  const { account } = useEthers();
  const {
    silentPoetsCount,
    vows,
    silentPoets: { loading, data },
  } = useVows();
  const userVows = useVowsByAccount(account);

  return (
    <FullPage subhed='"So tell me librarian, do you want an army of mute Poets or a Poet who can speak a lot of things?"'>
      <div className="font-body text-l">
        <div className="flex flex-col items-center justify-evenly mb-8">
          <div>
            <h4 className="font-black font-display text-l text-center uppercase mb-2">
              {silentPoetsCount && formatUnits(silentPoetsCount, "wei")} Poets
              have taken a vow of silence.
            </h4>
            <div className="flex flex-col md:flex-row md:justify-around">
              {!loading &&
                data &&
                data.map((poet) => {
                  return (
                    <div
                      className="bg-gray-100 text-center shadow m-4"
                      key={poet.name}
                    >
                      <div className="w-48">
                        <img src={poet.image_url} />
                      </div>
                      <p className="py-4">{poet.name}</p>
                    </div>
                  );
                })}
            </div>
          </div>
          <div>{userVows && JSON.stringify(userVows)}</div>
          <div>{vows && JSON.stringify(vows)}</div>
        </div>
      </div>
    </FullPage>
  );
};

export default Vows;
