import { shortenAddress, useEthers } from "@usedapp/core";
import { useCallback } from "react";

const Connect = () => {
  const { activateBrowserWallet, account } = useEthers();

  const activateWallet = useCallback(() => {
    activateBrowserWallet();
  }, [activateBrowserWallet]);

  return (
    <div className="md:fixed md:top-12 md:right-12 md:mb-0 md:z-50 mb-8 text-center">
      <button
        className="font-body text-l px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-300 shadow"
        onClick={activateWallet}
      >
        {account ? shortenAddress(account) : "Connect"}
      </button>
    </div>
  );
};

export default Connect;
