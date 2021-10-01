import { useEthers, useTokenBalance } from "@usedapp/core";
import FullPage from "../layouts/FullPage";
import { getConfig } from "../config/contracts";
import { formatEther, formatUnits } from "@ethersproject/units";
import {
  usePoet,
  usePoetBalance,
  useSilence,
  useSilenceBalance,
  useVows,
} from "../hooks/contracts";

const Home = () => {
  const { account } = useEthers();
  const silence = useSilenceBalance(account);
  const poets = usePoetBalance(account);
  const { pledgedPoets } = useSilence();
  const vows = useVows(account);
  const { data, loading } = usePoet(vows[0]?.tokenId.toNumber());

  return (
    <FullPage subhed='"So tell me librarian, do you want an army of mute Poets or a Poet who can speak a lot of things?"'>
      <div className="font-body text-l">
        <div className="flex flex-col md:flex-row items-center justify-evenly mb-8">
          <div>
            <p>Your SILENCE: {silence && formatEther(silence)}</p>
            <p>Your Poets: {poets && formatUnits(poets, "wei")}</p>
            <p>
              Pledged Poets: {pledgedPoets && formatUnits(pledgedPoets, "wei")}
            </p>
          </div>
          <div>
            {!loading && data && (
              <div className="bg-gray-100 text-center shadow">
                <div className="w-48">
                  <img src={data.image_url} />
                </div>
                <p className="py-4">{data.name}</p>
              </div>
            )}
          </div>
          <div>{vows && JSON.stringify(vows)}</div>
        </div>
      </div>
    </FullPage>
  );
};

export default Home;
