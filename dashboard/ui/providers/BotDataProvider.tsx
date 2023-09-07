"use client";
import React from "react";
import { createSafeContext } from "@/ui/utils/createSafeContext";
import { Copilot } from "api/copilots";
const [BotDataSafeProvider, useBotData] = createSafeContext<{
  bot: Copilot;
}>("useBotData should be used within BotDataSafeProvider");

function BotDataProvider({
  children,
  copilot,
}: {
  children: React.ReactNode;
  copilot: Copilot;
}) {
  return (
    <BotDataSafeProvider
      value={{
        bot: copilot,
      }}
    >
      {children}
    </BotDataSafeProvider>
  );
}

export { useBotData, BotDataProvider };
