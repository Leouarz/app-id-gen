"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useWallet } from "../context/WalletContext";
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { AccountSelector } from './AccountSelector';
import { useEffect } from "react";
import SparklesText from "./ui/sparkles-text";

export function SiteHeader({ className }: React.HTMLAttributes<HTMLElement>) {
    const { selectNetwork, api } = useWallet();

    const mainnet_rpc = 'wss://mainnet-rpc.avail.so/ws'
    const testnet_rpc = 'wss://turing-rpc.avail.so/ws'

    const default_rpc = mainnet_rpc

    const handleNetworkChange = async (network: string) => {
        await selectNetwork(network);
        const networkName = network.includes('turing') ? 'Avail Turing Testnet' : 'Avail Da Mainnet'
        toast.success("Connected to " + networkName);
    };

    useEffect(() => {
        let shouldUpdate = true
        if (shouldUpdate && !api?.isConnected) {
            handleNetworkChange(default_rpc)
        }

        return () => {
            shouldUpdate = false
        }
    }, [])


    return (
        <header className={cn(className)}>
            <div className="px-8 flex flex-col items-center justify-between gap-4 py-8 md:h-24 md:flex-row md:py-0">
                <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-4 md:px-0">
                    <Image
                        src={
                            "https://www.availproject.org/_next/static/media/avail_logo.9c818c5a.png"
                        }
                        alt="Logo"
                        width={"120"}
                        height={"35"}
                        style={{ width: 120, height: 35 }}
                    />
                    <SparklesText text="Avail Application ID Management" as={<h1 />} className="text-md" />
                </div>
                <div className="flex items-center space-x-4">
                    <Select onValueChange={handleNetworkChange} defaultValue={default_rpc}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={mainnet_rpc}>Avail DA Mainnet</SelectItem>
                            <SelectItem value={testnet_rpc}>Avail Turing Testnet</SelectItem>
                        </SelectContent>
                    </Select>
                    <AccountSelector />
                </div>
            </div>
        </header>
    );
}
