import React, { type ReactNode } from "react";
import { BotDataProvider } from "@/ui/providers/BotDataProvider";
import { Nav } from "./_parts/BotLayoutNavLink";

export default function BotLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { bot_id: string };
}) {
  return (
    <>
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
              <Nav href={`/app/bot/${params.bot_id}/try&share`}>
                Try & Share
              </Nav>
              <Nav
                href={`/app/bot/${params.bot_id}/settings`}
                segment="settings"
              >
                Settings
              </Nav>
            </div>
          </div>
        </div>

        <div
          data-container="bot-layout"
          className="px-4 sm:px-6 lg:px-8 py-8 max-w-[96rem] mx-auto flex-1 grow w-full"
        >
          <BotDataProvider bot_id={params.bot_id}>{children}</BotDataProvider>
        </div>
      </div>
    </>
  );
}
