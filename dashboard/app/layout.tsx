import { cn } from "@/lib/utils";
import "./globals.css";
import type { Metadata } from "next";
import { IS_DEV } from "@/lib/consts";
import React from "react";
import { SWRProvider } from "./swr-provider";
import { Toaster } from "@/components/ui/sonner"
import { HandleOnComplete } from "@/lib/router-events";
import { TopLoader } from "@/lib/Toploader";
import { JotaiProvider } from "./jotai-provider";
import { cairoFont, opensansFont } from "./fonts";

export const metadata: Metadata = {
  title: "OpenCopilot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SWRProvider>
      <JotaiProvider>
        <html lang="en">
          <body
            className={cn(
              cairoFont.variable,
              opensansFont.variable,
              "h-svh min-h-svh max-h-svh w-svw overflow-hidden scroll-smooth bg-background text-accent-foreground antialiased",
              IS_DEV && "debug-screens",
            )}
            style={{
              fontFamily: 'var(--opensans-font),var(--cairo-font),ui-sans-serif,system-ui,sans-serif'
            }}
          >
            {children}
            {/* Toaster */}
            <Toaster />
            <TopLoader
              color="hsl(var(--primary))"
            />
            <HandleOnComplete />
          </body>
        </html>
      </JotaiProvider>
    </SWRProvider>
  );
}
