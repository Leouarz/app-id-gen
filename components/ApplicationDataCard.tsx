// components/ApplicationDataCard.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { CopyableTooltip } from '@/components/CopyableTooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clipboard } from 'lucide-react';
import { shortenAddress } from '@/lib/utils';
import { ApplicationData } from '@/lib/types';

export const ApplicationDataCard = ({ data }: { data: ApplicationData }) => {
    return (
        <Card className="w-full p-4 shadow-lg border border-muted">
            <CardHeader>
                <CardTitle className="text-lg">Application ID: {data.id}</CardTitle>
                <CardDescription>Below is detailed information about this application.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="font-medium">App Key</span>
                    <CopyableTooltip text={data.name}>
                        <Badge variant="outline">{data.name.length > 20 ? `${data.name.slice(0, 20)}...` : data.name}</Badge>
                    </CopyableTooltip>
                </div>

                <div className="flex items-center justify-between">
                    <span className="font-medium">Owner</span>
                    <CopyableTooltip text={data.owner}>
                        <Badge variant="outline">{shortenAddress(data.owner)}</Badge>
                    </CopyableTooltip>
                </div>
            </CardContent>

            <CardFooter className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(JSON.stringify(data, null, 2))}>
                    <Clipboard className="w-4 h-4 mr-2" /> Copy JSON
                </Button>
            </CardFooter>
        </Card>
    );
};
