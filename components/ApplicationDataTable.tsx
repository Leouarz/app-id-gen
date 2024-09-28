// components/ApplicationDataTable.tsx
import React from 'react';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from '@/components/ui/table';
import type { ApplicationData } from '@/lib/types';
import { shortenAddress, trimString } from '@/lib/utils';
import { CopyableTooltip } from './CopyableTooltip';
import { AlertCircle } from 'lucide-react';

export const ApplicationDataTable = ({ data }: { data: ApplicationData[] }) => {
    return (
        <div>
            {data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                    <AlertCircle className="h-10 w-10 mb-2" />
                    <p className="text-lg font-medium">No results found</p>
                    <p className="text-sm">Try adjusting your filter or search term.</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>App Key</TableHead>
                            <TableHead>ID</TableHead>
                            <TableHead>Owner</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((app) => (
                            <TableRow key={`${app.name}-${app.id}`}>
                                <TableCell>{app.id}</TableCell>
                                <TableCell><CopyableTooltip text={app.name}>
                                    <span>{trimString(app.name)}</span>
                                </CopyableTooltip></TableCell>
                                <TableCell>
                                    <CopyableTooltip text={app.owner}>
                                        <span>{shortenAddress(app.owner)}</span>
                                    </CopyableTooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
};
