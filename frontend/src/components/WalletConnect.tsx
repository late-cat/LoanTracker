"use client";

import { useWalletStore } from "@/store/wallet";
import { Button } from "@/components/ui/button";
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit";

export default function WalletConnect() {
  const { address, connect, disconnect, network, setNetwork } = useWalletStore();

  const toggleNetwork = () => {
    setNetwork(network === WalletNetwork.TESTNET ? WalletNetwork.PUBLIC : WalletNetwork.TESTNET);
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <div className="hidden sm:flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">
        <span className={network === WalletNetwork.TESTNET ? "text-orange-500" : "text-green-500"}>●</span>
        <button onClick={toggleNetwork} className="hover:underline">
          {network === WalletNetwork.TESTNET ? "Testnet" : "Public"}
        </button>
      </div>
      
      {address ? (
        <Button onClick={disconnect} variant="outline" className="rounded-full bg-white shadow-sm hover:bg-gray-50 border-orange-200 text-orange-600 px-3 sm:px-4 text-xs sm:text-sm">
          {address.slice(0, 4)}...{address.slice(-4)}
        </Button>
      ) : (
        <Button onClick={connect} className="rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-sm font-semibold px-3 sm:px-4 text-xs sm:text-sm">
          <span className="sm:hidden">Connect</span>
          <span className="hidden sm:inline">Connect Wallet</span>
        </Button>
      )}
    </div>
  );
}
