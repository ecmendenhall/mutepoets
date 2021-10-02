import { BigNumber } from "@ethersproject/bignumber";
import { formatEther } from "ethers/lib/utils";
import { useCallback } from "react";
import { roundEther } from "../helpers";
import { useClaimAll } from "../hooks/contracts";
import Vows from "../pages/Vows";
import { Poet } from "../types";
import Button from "./Button";
import Grid from "./Grid";

interface ClaimableByVow {
  vowId: BigNumber;
  claimable: BigNumber;
}

interface Vow {
  vowId: BigNumber;
  tokenOwner: string;
  tokenId: BigNumber;
  updated: BigNumber;
}

interface Props {
  silenceBalance?: BigNumber;
  totalClaimableSilence: BigNumber;
  claimableByVow: ClaimableByVow[];
  loading: boolean;
  vows: Vow[];
  poets?: Poet[];
}

const getClaimableAmountByPoetId = (
  id: BigNumber,
  claimableByVow: ClaimableByVow[],
  vows: Vow[]
): BigNumber => {
  const vow = vows.find((vow) => vow.tokenId.eq(id));
  if (vow) {
    const claimable = claimableByVow.find((claimable) =>
      claimable.vowId.eq(vow.vowId)
    );
    return (claimable && claimable.claimable) || BigNumber.from(0);
  } else {
    return BigNumber.from(0);
  }
};

const ClaimSilence = ({
  silenceBalance,
  totalClaimableSilence,
  claimableByVow,
  vows,
  loading,
  poets,
}: Props) => {
  const { state: claimAllState, send: sendClaimAll } = useClaimAll();

  const claimAll = useCallback(() => {
    const send = async () => {
      await sendClaimAll();
    };
    send();
  }, []);

  return (
    <Grid>
      <div className="flex flex-col place-content-center bg-gray-100 shadow p-4">
        <p className="font-l text-center uppercase">
          {silenceBalance && roundEther(silenceBalance)}
          <p className="font-black font-display font-l text-center uppercase">
            SILENCE
          </p>
        </p>
      </div>
      {!loading &&
        poets &&
        poets.map((poet) => {
          return (
            <div className="bg-gray-100 text-center shadow" key={poet.name}>
              <div className="group relative flex flex-col place-content-center place-items-end">
                <img className="object-cover" src={poet.image_url} />
                <div className="hidden group-hover:block cursor-pointer absolute bg-gray-50 opacity-80 w-full p-2">
                  {roundEther(
                    getClaimableAmountByPoetId(
                      poet.tokenId,
                      claimableByVow,
                      vows
                    )
                  )}
                  <p className="font-black font-display font-l text-center uppercase">
                    Claimable
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      <div className="flex flex-col place-content-center bg-gray-100 shadow p-4">
        <p className="font-l text-center">
          {roundEther(totalClaimableSilence)}
          <p className="font-black font-display font-l text-center uppercase">
            Total
          </p>
        </p>
      </div>
      <Button color="gray" onClick={claimAll}>
        Claim all
      </Button>
      {JSON.stringify(claimAllState)}
    </Grid>
  );
};

export default ClaimSilence;
