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
              <div>
                <img src={poet.image_url} />
              </div>
            </div>
          );
        })}
      {placeChildren == "right" && children}
    </Grid>
  );
};

export default PoetGrid;
