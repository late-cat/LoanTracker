import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
} from '@creit.tech/stellar-wallets-kit';

interface WalletState {
  address: string | null;
  kit: StellarWalletsKit | null;
  network: WalletNetwork;
  connect: () => Promise<void>;
  disconnect: () => void;
  setNetwork: (network: WalletNetwork) => void;
}

const createKit = (network: WalletNetwork) => {
  if (typeof window === 'undefined') return null; // Avoid SSR issues
  return new StellarWalletsKit({
    network,
    selectedWalletId: 'freighter',
    modules: allowAllModules(),
  });
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      address: null,
      kit: createKit(WalletNetwork.TESTNET),
      network: WalletNetwork.TESTNET,
      connect: async () => {
        let { kit } = get();
        if (!kit) {
          kit = createKit(get().network);
          set({ kit });
        }

        try {
          await kit!.openModal({
            onWalletSelected: async (option) => {
              kit?.setWallet(option.id);
              const { address } = await kit!.getAddress();
              set({ address });
            },
          });
        } catch (e) {
          console.error("Wallet connection failed", e);
        }
      },
      disconnect: () => {
        set({ address: null });
      },
      setNetwork: (network: WalletNetwork) => {
        const newKit = createKit(network);
        set({ kit: newKit, network });
      }
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({ address: state.address, network: state.network }),
    }
  )
);
