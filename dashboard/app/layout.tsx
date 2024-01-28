import { cn } from "@/lib/utils";
import "./globals.css";
import type { Metadata } from "next";
import { Tv2 } from "lucide-react";
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
            {/* browser too small message */}
            <div className="fixed inset-0 z-[500] flex items-center justify-center bg-primary-foreground/70 p-5 backdrop-blur md:!hidden">
              <div className="flex flex-col items-center justify-center text-lg">
                <span>
                  <Tv2 className="h-20 w-20 text-primary" />
                </span>
                <h2 className="font-semibold">Your browser is too small</h2>
                <p className="text-base font-medium">
                  Resize your browser to at least 900px wide to continue.
                </p>
              </div>
            </div>
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
