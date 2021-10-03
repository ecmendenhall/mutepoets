import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { Poet } from "../types";
import PoetGrid from "./PoetGrid";

interface Props {
  loading: boolean;
  poets?: Poet[];
  silentPoetsCount?: BigNumber;
}

const Poets = ({ loading, poets, silentPoetsCount }: Props) => {
  return (
    <div>
      {loading ? (
        "Loading..."
      ) : (
        <PoetGrid placeChildren="left" loading={loading} poets={poets || []}>
          <div className="flex flex-col place-content-center bg-gray-100 shadow p-4">
            <h4 className="font-black font-display font-l text-center uppercase">
              {silentPoetsCount && formatUnits(silentPoetsCount, "wei")} Poets
              have taken the vow
            </h4>
          </div>
        </PoetGrid>
      )}
    </div>
  );
};

export default Poets;
