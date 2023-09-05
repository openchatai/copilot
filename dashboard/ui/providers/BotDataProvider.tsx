"use client";
import React from "react";
import useSWR from "swr";
import { Link, useRouter } from "@/ui/router-events";
import { createSafeContext } from "@/ui/utils/createSafeContext";
import EmptyState from "@/ui/partials/EmptyState";
import { Button } from "@/ui/components/Button";
import { Loading } from "@/ui/components/Loading";
import { Copilot, getCopilot } from "api/copilots";
const [BotDataSafeProvider, useBotData] = createSafeContext<{
  bot: Copilot;
}>("useBotData should be used within BotDataSafeProvider");

function BotDataProvider({
  children,
  bot_id,
}: {
  children: React.ReactNode;
  bot_id: string;
}) {
  const { refresh } = useRouter();
  console.log(bot_id);
  const { data: bot_data, isLoading, error } = useSWR([bot_id], getCopilot);
  console.log("bot Data, Error", bot_data, error);
  if ((!bot_data?.data?.chatbot || error) && !isLoading) {
    return (
      <div className="w-full h-full p-5 grid place-content-center">
        <div className="">
          <EmptyState
            label="Copilot not found"
            description="The Copilot you are looking for does not exist or you do not have permission to view it."
          >
            <div className="space-x-2">
              <Button
                onClick={() => refresh()}
                variant={{
                  intent: "primary-ghost",
                }}
              >
                Refresh
              </Button>
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
      </div>
    );
  }
  // no data and loading so loading response
  if (!bot_data?.data?.chatbot && isLoading) {
    return (
      <div className="w-full">
        <Loading size={50} />
      </div>
    );
  }

  // data and not loading => ready to view the bot data
  if (bot_data?.data?.chatbot && !isLoading) {
    return (
      <BotDataSafeProvider
        value={{
          bot: bot_data.data.chatbot,
        }}
      >
        {children}
      </BotDataSafeProvider>
    );
  }
}

export { useBotData, BotDataProvider };
