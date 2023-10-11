import { cn } from "@/lib/utils";
import "./globals.css";
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { Tv2 } from "lucide-react";
import { IS_DEV } from "@/lib/consts";

const opensans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Proof of concept for a design system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          opensans.className,
          "min-h-screen relative h-screen text-accent-foreground overflow-hidden w-screen bg-background [&>*]:h-full",
          IS_DEV && "debug-screens"
        )}
      >
        {children}
        {/* browser too small message */}
        <div className="absolute flex items-center justify-center lg:hidden inset-0 z-[500] backdrop-blur bg-primary-foreground/70">
          <div className="flex flex-col text-lg items-center justify-center">
            <span>
              <Tv2 className="h-20 w-20 text-primary" />
            </span>
            <h2 className="font-semibold">Your browser is too small</h2>
            <p className="text-base font-medium">
              Resize your browser to at least 900px wide to continue.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
