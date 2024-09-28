"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { ModeToggle } from "./mode-toggle";

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn(className)}>
      <div className="px-8 flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Image
            src={
              "https://www.availproject.org/_next/static/media/avail_logo.9c818c5a.png"
            }
            alt="Logo"
            width={"120"}
            height={"35"}
            style={{ width: 120, height: 35 }}
          />
          <p className="text-center text-sm leading-loose md:text-left">
            Built by{" "}
            <a
              href={"https://www.availproject.org"}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Avail
            </a>
            . Check us on{" "}
            <a
              href={"https://github.com/availproject/"}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </p>
        </div>
        <ModeToggle />
      </div>
    </footer>
  );
}
