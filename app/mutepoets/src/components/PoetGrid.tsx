import { Poet } from "../types";

type PlaceChildren = "right" | "left";

interface Props {
  loading: boolean;
  poets: Poet[];
  children: React.ReactNode;
  placeChildren: PlaceChildren;
}

const PoetGrid = ({ loading, poets, children, placeChildren }: Props) => {
  return (
    <div className="grid gap-0 grid-cols-3 md:grid-cols-5 lg:grid-cols-7 mb-8">
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
    </div>
  );
};

export default PoetGrid;
