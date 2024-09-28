// components/CreateAppId.tsx
'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/context/WalletContext';
import { toast } from 'sonner';
import { web3FromSource } from '@polkadot/extension-dapp';
import { ApplicationData } from '@/lib/types';
import { ApplicationDataCard } from './ApplicationDataCard';

export const CreateAppId = () => {
    const { api, selectedAccount } = useWallet();
    const [appName, setAppName] = useState('');
    const [newAppId, setNewAppId] = useState<ApplicationData | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateAppId = async () => {
        if (typeof window != 'undefined') {
            if (!api || !selectedAccount) {
                toast.error('Please connect your wallet and select an account.');
                return;
            }

            if (!appName) {
                toast.error('Please enter an application name.');
                return;
            }

            setIsSubmitting(true);
            setNewAppId(null)

            const injector = await web3FromSource(selectedAccount.source);

            try {
                const unsub = await api.tx.dataAvailability
                    .createApplicationKey(appName)
                    .signAndSend(selectedAccount.address, { app_id: 0, signer: injector.signer } as any, ({ status, events, dispatchError }) => {
                        if (status.isInBlock || status.isFinalized) {
                            if (dispatchError) {
                                let message: string = dispatchError.type;

                                if (dispatchError.isModule) {
                                    const decoded = api.registry.findMetaError(dispatchError.asModule);
                                    message = `${decoded.docs.join(' ')}`;
                                }

                                toast.error(`Transaction failed: ${message}`);
                                setIsSubmitting(false);
                                unsub();
                            } else {
                                events.forEach(({ event }) => {
                                    if (
                                        event.section === 'dataAvailability' &&
                                        event.method === 'ApplicationKeyCreated'
                                    ) {
                                        const data: any = event.data.toHuman();
                                        setNewAppId({ id: data.id, owner: data.owner, name: data.key });
                                        toast.success('Application Key created successfully!');
                                    }
                                });
                                setIsSubmitting(false);
                                unsub();
                            }
                        }
                    });
            } catch (error: any) {
                console.error(error);
                if (error.message.includes("Inability to pay some fees")) {
                    toast.error("You don't have enough balance.");
                } else {
                    toast.error('An error occurred while creating the Application Key. You can open the console to view advances logs');
                }
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="space-y-4">
            <Input
                type="text"
                placeholder="Enter Application Name"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                disabled={!selectedAccount || isSubmitting}
            />
            <Button
                onClick={handleCreateAppId}
                disabled={!selectedAccount || isSubmitting}
                className="w-full"
            >
                {isSubmitting ? 'Submitting...' : 'Create Application Key'}
            </Button>
            {!selectedAccount && (
                <div>
                    <p>You need to connect to create an application id</p>
                </div>
            )}
            {newAppId !== null && (
                <div>
                    <ApplicationDataCard data={newAppId} />
                </div>
            )}
        </div>
    );
};
