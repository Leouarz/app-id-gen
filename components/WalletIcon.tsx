import React from 'react';
import Image from 'next/image';

type WalletIconProps = {
    source: string;
};

export const WalletIcon = ({ source }: WalletIconProps) => {
    const walletLogos: { [key: string]: string } = {
        'polkadot-js': '/polkadot-js.png',
        'talisman': '/talisman.png',
        'subwallet-js': '/subwallet-js.png',
        'nova': '/nova.png',
    };

    const logoSrc = walletLogos[source] || '/default.png';

    return (
        <Image src={logoSrc} alt={source} width={28} height={28} className="rounded-md" />
    );
};
