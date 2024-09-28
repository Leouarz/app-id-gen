'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { Input } from '@/components/ui/input';
import type { ApplicationData } from '@/lib/types';
import { ApplicationDataTable } from './ApplicationDataTable';


export const SearchAppIds = () => {
    const { api } = useWallet();
    const [appData, setAppData] = useState<ApplicationData[]>([]);
    const [filterTerm, setFilterTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (api) {
                await api.isReady;
                try {
                    const entries = await api.query.dataAvailability.appKeys.entries();
                    const data: ApplicationData[] = entries.map(([key, value]) => {
                        const name = key.args[0].toHuman() as string;
                        const appKey = value.toHuman() as {
                            owner: string;
                            id: string | number;
                        };
                        return {
                            name,
                            owner: appKey.owner,
                            id: Number(appKey.id),
                        };
                    });
                    setAppData(data.sort((a, b) => a.id - b.id));
                } catch (error) {
                    console.error('Error fetching application data:', error);
                }

            }
        };

        fetchData();
    }, [api]);

    const filteredData = appData.filter((app) => {
        const term = filterTerm.toLowerCase();

        return (
            app.name.toLowerCase().includes(term) ||
            app.id.toString().includes(term)
        );
    });


    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
                <Input
                    type="text"
                    placeholder="Filter by ID or application name"
                    value={filterTerm}
                    onChange={(e) => setFilterTerm(e.target.value)}
                    className="w-full"
                />
            </div>

            <ApplicationDataTable data={filteredData} />
        </div>
    );

}
