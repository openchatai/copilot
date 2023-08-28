"use client";
import React from "react";
import { createSafeContext } from "../utils/createSafeContext";
import useSWR from "swr";
import axiosInstance from "utils/axiosInstance";
import { type Bot } from "schemas";
import EmptyState from "../partials/EmptyState";
import { Button } from "../components/Button";
import { Loading } from "../components/Loading";
import { useRouter } from "../router-events";
const [BotDataSafeProvider, useBotData] = createSafeContext<{
  bot: Bot;
}>("BotLayout");

function BotDataProvider({
  children,
  bot_id,
}: {
  children: React.ReactNode;
  bot_id: string;
}) {
  const { refresh, back } = useRouter();
  const { data: bot_data, isLoading } = useSWR(bot_id, () =>
    axiosInstance.get<Bot>(`/bots/${bot_id}`)
  );
  // no data and not loading
  if (!bot_data?.data && !isLoading)
    return (
      <div className="w-full h-full p-5 grid place-content-center">
        <div className="">
          <EmptyState
            label="Bot not found"
            description="The bot you are looking for does not exist or you do not have permission to view it."
          >
            <div className="space-x-2">
              <Button
                onClick={() => refresh()}
                variant={{
                  intent: "primary-ghost",
                }}
              >
                refresh
              </Button>
              <Button
                onClick={() => back()}
                variant={{
                  intent: "primary",
                }}
              >
                navigate back
              </Button>
            </div>
          </EmptyState>
        </div>
      </div>
    );
  // no data and loading so loading response
  if (!bot_data?.data && isLoading)
    return (
      <div className="w-full">
        <Loading size={50} />
      </div>
    );
  // data and not loading => ready to view the bot data
  if (bot_data && !isLoading)
    return (
      <BotDataSafeProvider
        value={{
          bot: bot_data.data,
        }}
      >
        {children}
      </BotDataSafeProvider>
    );
}

export { useBotData, BotDataProvider };
