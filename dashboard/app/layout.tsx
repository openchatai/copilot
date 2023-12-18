import { cn } from "@/lib/utils";
import "./globals.css";
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { Tv2 } from "lucide-react";
import { IS_DEV } from "@/lib/consts";
import { SearchModal } from "./(main)/_parts/SearchModal";
import React from "react";
import { SWRProvider } from "./swr-provider";
import { Toaster } from "@/components/ui/toaster";
import { HandleOnComplete } from "@/lib/router-events";
import { TopLoader } from "@/lib/Toploader";
import dynamic from "next/dynamic";
import { JotaiProvider } from "./jotai-provider";

const Confetti = dynamic(() => import("@/components/domain/confetti-canvas"), {
  ssr: false,
});

const opensans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  fallback: ["Roboto", "sans-serif"],
});

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
              opensans.className,
              "h-screen min-h-[100svh] max-h-[100svh] w-screen overflow-hidden scroll-smooth bg-background text-accent-foreground antialiased",
              IS_DEV && "debug-screens",
            )}
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

            {/* search modal */}
            <SearchModal />
            {/* Toaster */}
            <Toaster />
            <TopLoader
              color="hsl(var(--primary))"
            />
            <Confetti />
            <HandleOnComplete />
          </body>
        </html>
      </JotaiProvider>
    </SWRProvider>
  );
}
