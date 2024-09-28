'use client'

import React, { useState, useContext, createContext, ReactNode } from "react";
import { ApiPromise, disconnect, initialize, signedExtensions, types } from "avail-js-sdk";
import { web3Enable, web3Accounts, web3FromSource } from "@polkadot/extension-dapp";
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { toast } from "sonner";

type AccountWithProvenance = InjectedAccountWithMeta & {
  source: string;
};

type WalletContextType = {
  accounts: AccountWithProvenance[];
  selectedAccount: AccountWithProvenance | null;
  api: ApiPromise | null;
  connectWallet: () => Promise<void>;
  selectNetwork: (network: string) => Promise<void>;
  selectAccount: (account: AccountWithProvenance) => void;
  disconnectWallet: () => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [accounts, setAccounts] = useState<AccountWithProvenance[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AccountWithProvenance | null>(null);
  const [api, setApi] = useState<ApiPromise | null>(null);

  const getInjectorMetadata = (api: ApiPromise) => {
    return {
      chain: api.runtimeChain.toString(),
      specVersion: api.runtimeVersion.specVersion.toNumber(),
      tokenDecimals: api.registry.chainDecimals[0] || 18,
      tokenSymbol: api.registry.chainTokens[0] || "AVAIL",
      genesisHash: api.genesisHash.toHex(),
      ss58Format: api.registry.chainSS58 || 42,
      chainType: "substrate" as "substrate",
      icon: "substrate",
      types: types as any,
      userExtensions: signedExtensions,
    };
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined') {
      const extensions = await web3Enable("Avail Application id generator");
      if (extensions.length === 0) {
        console.warn('No extensions installed.');
        toast.error("No extensions installed.");
        return;
      }
      const injectedAccounts = await web3Accounts();
      const accountsWithProvenance = injectedAccounts.map((account) => ({
        ...account,
        source: account.meta.source,
      }));
      setAccounts(accountsWithProvenance);
    }
  };

  const selectNetwork = async (network: string) => {
    if (api && api.isConnected) {
      await disconnect()
    }
    const newApi = await initialize(network)
    setApi(newApi);
  };

  const selectAccount = async (account: AccountWithProvenance) => {
    if (typeof window !== 'undefined') {
      setSelectedAccount(account);
      if (api) {
        const injector = await web3FromSource(account.source)
        if (injector.metadata) {
          const metadata = getInjectorMetadata(api);
          await injector.metadata.provide(metadata);
        }
      }
      toast.success("Connected.");
    }
  };

  const disconnectWallet = () => {
    setAccounts([]);
    setSelectedAccount(null);
    toast.success("Disconnected.");
  };

  return (
    <WalletContext.Provider
      value={{
        accounts,
        selectedAccount,
        api,
        connectWallet,
        selectNetwork,
        selectAccount,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
