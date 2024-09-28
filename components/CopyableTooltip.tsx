// components/CopyableTooltip.tsx
'use client';

import React, { useState } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Clipboard, ClipboardCheck } from 'lucide-react';

type CopyableTooltipProps = {
  text: string;
  children: React.ReactNode;
};

export const CopyableTooltip = ({ text, children }: CopyableTooltipProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="flex items-center justify-between space-x-2">
        <span className="mr-2">{text}</span>
        <Button variant="ghost" size="icon" onClick={handleCopy}>
          {copied ? (
            <ClipboardCheck className="w-4 h-4 text-green-500" />
          ) : (
            <Clipboard className="w-4 h-4" />
          )}
        </Button>
      </TooltipContent>
    </Tooltip>
  );
};
