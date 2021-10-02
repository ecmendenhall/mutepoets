import BlockCounter from "../components/BlockCounter";
import Connect from "../components/Connect";
import Nav from "../components/Nav";

interface Props {
  subhed: React.ReactNode;
  children: React.ReactNode;
}

const FullPage = ({ subhed, children }: Props) => {
  return (
    <div className="p-16 min-h-screen bg-gray-200">
      <div className="mb-4">
        <h1 className="font-display uppercase tracking-wider text-gray-700 font-bold text-4xl lg:text-6xl text-center">
          Silence
        </h1>
        <div className="font-body text-center text-l">
          <p className="italic">{subhed}</p>
        </div>
      </div>
      <div className="my-8">
        <Connect />
        <Nav />
        {children}
      </div>
      <BlockCounter />
    </div>
  );
};

export default FullPage;
