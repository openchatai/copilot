import React, { type ReactNode } from "react";
import { Nav } from "./_parts/BotLayoutNavLink";
import { BotDataProvider } from "@/ui/providers/BotDataProvider";
import { getCopilot } from "api/copilots";
import { Button } from "@/ui/components/Button";
import { Link } from "@/ui/router-events";
import EmptyState from "@/ui/partials/EmptyState";

export default async function BotLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { bot_id: string };
}) {
  const { data: copilot, status } = await getCopilot(params?.bot_id);
  return (
    <div
      data-layout="bot"
      className="w-full min-h-full flex items-start justify-start flex-col"
    >
      {/*bot layout navigation */}
      <div className="w-full max-w-[96rem] sticky inset-x-0 top-[var(--header-height)] z-30 min-w-full">
        <div className="px-4 sm:px-6 w-full bg-white dark:bg-[#182235] border-b border-b-slate-200 dark:border-b-slate-700 ">
          {/* py-2 controls the offset => -bottom-2 in Nav */}
          <div className="flex items-center gap-2 py-2 w-full max-w-full overflow-x-scroll relative no-scrollbar whitespace-nowrap flex-nowrap">
            {/* <Nav href={`/app/bot/${params.bot_id}`}>Overview</Nav> */}
            <Nav href={`/app/bot/${params.bot_id}`}>Try & Share</Nav>
            <Nav href={`/app/bot/${params.bot_id}/settings`} segment="settings">
              Settings
            </Nav>
            <Nav href={`/app/bot/${params.bot_id}/workflows`}>Workflows</Nav>
          </div>
        </div>
      </div>

      <div
        data-container="bot-layout"
        className="px-4 sm:px-6 lg:px-8 py-8 max-w-[96rem] mx-auto flex-1 grow w-full min-h-fit h-full relative"
      >
        {status === 200 ? (
          <BotDataProvider copilot={copilot.chatbot}>
            {children}
          </BotDataProvider>
        ) : (
          <div>
            <EmptyState
              label="Copilot not found"
              description="The Copilot you are looking for does not exist or you do not have permission to view it."
            >
              <div className="space-x-2">
                <Button
                  asChild
                  variant={{
                    intent: "primary",
                  }}
                >
                  <Link href="/app">Index</Link>
                </Button>
              </div>
            </EmptyState>
          </div>
        )}
      </div>
    </div>
  );
}
