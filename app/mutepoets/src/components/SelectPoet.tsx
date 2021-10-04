import { useState } from "react";
import { Poet } from "../types";
import Grid from "./Grid";

type PlaceChildren = "right" | "left";

interface Props {
  loading: boolean;
  poets: Poet[];
  children: React.ReactNode;
  placeChildren: PlaceChildren;
}

const SelectPoet = ({ loading, poets, children, placeChildren }: Props) => {
  const [selected, setSelected] = useState<Poet>();

  return (
    <Grid>
      {placeChildren == "left" && children}
      {!loading &&
        poets &&
        poets.map((poet) => {
          const active = selected && selected.tokenId.eq(poet.tokenId);
          const className = `${
            active ? "block" : "hidden"
          } group-hover:block absolute text-white bg-gray-900 w-full bottom-4 p-2 2xl:p-4`;
          return (
            <div className="bg-gray-100 text-center shadow" key={poet.name}>
              <div
                onClick={() => {
                  setSelected(poet);
                }}
                className="group relative flex flex-col place-content-center cursor-pointer"
              >
                <img className="object-cover" src={poet.image_url} />
                <div className={className}>{poet.name}</div>
                {active && (
                  <div className="absolute w-full h-full ring-8 ring-gray-50 ring-opacity-80 ring-inset" />
                )}
              </div>
            </div>
          );
        })}
      {placeChildren == "right" && children}
    </Grid>
  );
};

export default SelectPoet;
