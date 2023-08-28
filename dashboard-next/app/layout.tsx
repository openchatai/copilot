import Toaster from "@/ui/components/headless/toast/Toaster";
import "styles/globals.css";
import { Inter } from "next/font/google";
import cn from "@/ui/utils/cn";
import ThemeProvider from "@/ui/providers/ThemeProvider";
import { SWRConfigProvider } from "@/ui/providers/SWRConfigProvider";
import { RouterEventsProvider } from "@/ui/router-events";
import { TopLoader } from "@/ui/partials/TopLoader";
import { OnlineProvider } from "@/ui/providers/OnlineStateProvider";
import type { Metadata } from "next";

const inter = Inter({
  subsets: ["latin"],
  fallback: ["system-ui", "Roboto", "sans-serif"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "OpenCopilot - Build your own ChatGPT",
  description:
    "OpenCopilot - Build your own ChatGPT for yor website, PDF files, Notion and many more integrations for free, no coding required!",
  viewport:
    "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0",
  keywords: [
    "OpenCopilot",
    "OpenCopilot-ai",
    "Chat-GPT",
    "Chat Widgets",
    "customer support",
    "AI-bots",
    "ai-chatbots",
  ],
  robots: "index, follow",
  authors: [
    {
      name: "OpenChatai",
      url: "https://openchat.so",
    },
    {
      name: "openchatai",
      url: "https://github.com/openchatai",
    },
  ],
  category: "Chatbots",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnlineProvider>
      <RouterEventsProvider>
        <SWRConfigProvider>
          <html lang="en" suppressHydrationWarning>
            <body
              className={cn(
                inter.variable,
                "font-inter antialiased bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 min-h-screen min-w-full"
              )}
            >
              <ThemeProvider>
                <TopLoader color="#6366f1" />
                {children}
              </ThemeProvider>
              <Toaster />
            </body>
          </html>
        </SWRConfigProvider>
      </RouterEventsProvider>
    </OnlineProvider>
  );
}
