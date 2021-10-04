import { Poet } from "../types";
import Grid from "./Grid";

type PlaceChildren = "right" | "left";

interface Props {
  loading: boolean;
  poets: Poet[];
  children: React.ReactNode;
  placeChildren: PlaceChildren;
}

const PoetGrid = ({ loading, poets, children, placeChildren }: Props) => {
  return (
    <Grid>
      {placeChildren == "left" && children}
      {!loading &&
        poets &&
        poets.map((poet) => {
          return (
            <div className="bg-gray-100 text-center shadow" key={poet.name}>
              <div className="group relative flex flex-col place-content-center cursor-pointer">
                <img className="object-cover" src={poet.image_url} />
                <div className="hidden group-hover:block absolute text-white bg-gray-900 w-full bottom-4 p-2 2xl:p-4">
                  {poet.name}
                </div>
              </div>
            </div>
          );
        })}
      {placeChildren == "right" && children}
    </Grid>
  );
};

export default PoetGrid;
