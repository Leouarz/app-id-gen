'use client';

import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { shortenAddress } from '@/lib/utils';
import { LogOut, RefreshCcw } from 'lucide-react';
import { WalletIcon } from './WalletIcon';

export const AccountSelector = () => {
    const { accounts, selectedAccount, selectAccount, disconnectWallet, connectWallet } = useWallet();
    const [isOpen, setIsOpen] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const handleOpenChange = async (open: boolean) => {
        setIsOpen(open);
        if (open && accounts.length === 0) {
            setIsConnecting(true);
            await connectWallet();
            setIsConnecting(false);
        }
    };


    const handleAccountSelect = (account: typeof accounts[0]) => {
        selectAccount(account);
        setIsOpen(false);
    };

    return (
        <div>
            {selectedAccount ? (
                <div className="flex items-center space-x-2">
                    <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${selectedAccount.address}`} />
                        <AvatarFallback>{selectedAccount.meta.name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <span>{selectedAccount.meta.name || shortenAddress(selectedAccount.address)}</span>
                    <Button variant="outline" size="icon" onClick={disconnectWallet}>
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <Button onClick={() => handleOpenChange(true)}>Connect Wallet</Button>
            )}

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Select an Account</DialogTitle>
                    </DialogHeader>
                    {isConnecting ? (
                        <div className="flex items-center justify-center p-4">
                            <span>Connecting to wallet extensions...</span>
                        </div>
                    ) : accounts.length > 0 ? (
                        <div className="space-y-2">
                            {accounts.map((account, index) => (
                                <div
                                    key={`${account.address}-${index}`}
                                    className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleAccountSelect(account)}
                                >
                                    <div className="flex items-center space-x-2">
                                        <Avatar>
                                            <AvatarImage
                                                src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${account.address}`}
                                            />
                                            <AvatarFallback>
                                                {account.meta.name?.[0] || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="text-sm font-medium">
                                                {account.meta.name || 'Unnamed Account'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {shortenAddress(account.address)}
                                            </div>
                                        </div>
                                    </div>
                                    <WalletIcon source={account.source}/>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-4">
                            <span>No accounts found.</span>
                            <p className="text-gray-500 text-center mt-2">
                                Please install a wallet extension like{' '}
                                <a
                                    href="https://polkadot.js.org/extension/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 underline"
                                >
                                    Polkadot.js
                                </a>
                                ,{' '}
                                <a
                                    href="https://www.subwallet.app/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 underline"
                                >
                                    Subwallet
                                </a>
                                ,{' '}
                                <a
                                    href="https://talisman.xyz/download"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 underline"
                                >
                                    Talisman
                                </a>
                                ,{' '}
                                <a
                                    href="https://nova-wallet.io/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 underline"
                                >
                                    Nova Wallet
                                </a>
                                , or others.
                            </p>
                            <Button onClick={connectWallet} className="mt-4">
                                <RefreshCcw className="mr-2 h-4 w-4" /> Retry Connection
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div >
    );
};
