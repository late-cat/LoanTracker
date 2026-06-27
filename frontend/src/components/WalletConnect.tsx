"use client";

import { useWalletStore } from "@/store/wallet";
import { Button } from "@/components/ui/button";
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit";
import { fetchWalletBalance } from "@/lib/soroban";
import { useEffect, useState } from "react";
import { Coins } from "lucide-react";

export default function WalletConnect() {
  const { address, connect, disconnect, network, setNetwork } = useWalletStore();
  const [balance, setBalance] = useState<string>("0.00");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (address && mounted) {
      fetchWalletBalance(address).then(setBalance).catch(console.error);
      
      const interval = setInterval(() => {
        fetchWalletBalance(address).then(setBalance).catch(console.error);
      }, 15000);
      return () => clearInterval(interval);
    } else {
      setBalance("0.00");
    }
  }, [address, mounted]);

  const toggleNetwork = () => {
    setNetwork(network === WalletNetwork.TESTNET ? WalletNetwork.PUBLIC : WalletNetwork.TESTNET);
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <div className="hidden lg:flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">
        <span className={network === WalletNetwork.TESTNET ? "text-orange-500" : "text-green-500"}>●</span>
        <button onClick={toggleNetwork} className="hover:underline">
          {network === WalletNetwork.TESTNET ? "Testnet" : "Public"}
        </button>
      </div>
      
      {mounted && address ? (
        <div className="flex items-center bg-white shadow-sm border border-gray-200 rounded-full overflow-hidden h-9 sm:h-10">
          <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 bg-gray-50 border-r border-gray-200 text-[11px] sm:text-sm font-semibold text-gray-700 h-full">
            <Coins size={14} className="text-orange-500" />
            <span className="max-w-[4rem] sm:max-w-none truncate">{balance} XLM</span>
          </div>
          <Button onClick={disconnect} variant="ghost" className="group rounded-none hover:bg-red-50 text-gray-700 hover:text-red-600 px-2 sm:px-4 text-[11px] sm:text-sm font-medium h-full flex-1 relative">
            <span className="hidden sm:block group-hover:opacity-0 transition-opacity duration-200">
              {address.slice(0, 4)}...{address.slice(-4)}
            </span>
            <span className="hidden sm:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-bold">
              Disconnect
            </span>
            {/* On mobile, just show Disconnect or an icon, because hover doesn't exist */}
            <span className="sm:hidden font-bold text-red-500">
              Disconnect
            </span>
          </Button>
        </div>
      ) : (
        <Button onClick={connect} className="rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-sm font-semibold px-3 sm:px-4 text-xs sm:text-sm h-9 sm:h-10">
          <span className="sm:hidden">Connect</span>
          <span className="hidden sm:inline">Connect Wallet</span>
        </Button>
      )}
    </div>
  );
}
