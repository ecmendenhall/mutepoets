import {
  ChainId,
  getExplorerAddressLink,
  useEthers,
  shortenAddress,
} from "@usedapp/core";
import { getConfig } from "../config/contracts";

interface Props {
  name: string;
  address: string;
  chainId: ChainId;
}

const ContractItem = ({ name, address, chainId }: Props) => {
  return (
    <li key={name} className="my-2">
      {name}:{" "}
      <a
        className="bg-gray-100 p-1 font-mono text-sm hover:text-gray-700"
        href={getExplorerAddressLink(address, chainId)}
      >
        {shortenAddress(address)}
      </a>
    </li>
  );
};

const Contracts = () => {
  const { chainId } = useEthers();
  const config = getConfig(chainId);
  return (
    <>
      {chainId && (
        <div className="mb-4">
          <h4 className="font-black font-display uppercase">Contracts</h4>
          <ul className="mb-4">
            <ContractItem
              name="Silence"
              address={config.silence.address}
              chainId={chainId}
            />
          </ul>
        </div>
      )}
    </>
  );
};

export default Contracts;
