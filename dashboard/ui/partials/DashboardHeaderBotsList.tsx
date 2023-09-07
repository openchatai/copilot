"use client";
import { Link } from "@/ui/router-events";
import { Popover, PopoverContent, PopoverTrigger } from "../components/Popover";
import NavLink from "../components/NavLink";
import { ScrollArea } from "../components/ScrollArea";
import { Input } from "../components/inputs/BaseInput";
import { useState } from "react";
import { useParams } from "next/navigation";
import EmptyState from "./EmptyState";
import { Button } from "../components/Button";
import useSWR from "swr";
import { motion } from "framer-motion";
import { CgSpinnerAlt } from "react-icons/cg";
import { HiStar } from "react-icons/hi";
import { BiSearchAlt } from "react-icons/bi";
import { HiChevronUpDown } from "react-icons/hi2";
import { getCopilots } from "api/copilots";

export function Bots() {
  const { bot_id } = useParams();
  const [search, setSearch] = useState("");
  const { data, error, isLoading, mutate } = useSWR("/copilots", getCopilots, {
    revalidateIfStale: true,
    refreshInterval: 1000,
  });
  const bots = data?.data;
  const activeBot = bots?.find((bot) => bot.id === bot_id);
  const filteredBots = bots?.filter((bot) =>
    bot?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover>
      <div className="flex items-center gap-2 px-1.5 py-0.5">
        <div className="flex-1">
          <Link
            href={`/app/bot/${activeBot?.id}`}
            className="overflow-hidden whitespace-nowrap min-w-0 font-medium max-w-full text-base"
          >
            {activeBot?.name}
          </Link>
        </div>
        <PopoverTrigger className="shrink-0 rounded p-1 hover:text-indigo-600 transition-colors">
          <HiChevronUpDown />
        </PopoverTrigger>
        <PopoverContent
          style={{
            maxHeight: "calc(100vh - var(--header-height))",
          }}
          asChild
        >
          <div className="max-w-xs">
            <div className="flex flex-col w-full items-start">
              <Input
                placeholder="Find Bot..."
                prefix={<BiSearchAlt />}
                value={search}
                onChange={(ev) => setSearch(ev.target.value)}
              />
              <span className="block text-sm p-2">Bots</span>
              <div className="flex-1 w-full overflow-auto">
                <ScrollArea className="w-full min-h-fit h-[calc(80vh-var(--header-height))] max-h-[calc(50vh-var(--header-height))]">
                  <ul className="space-y-2">
                    {filteredBots?.length && filteredBots.length > 0 ? (
                      filteredBots.map((bot, index) => {
                        return (
                          <motion.li
                            key={bot.id}
                            transition={{
                              delay: 0.2 * index,
                              duration: 0.2,
                            }}
                            initial={{
                              opacity: 0,
                              x: -10,
                            }}
                            animate={{
                              opacity: 1,
                              x: 0,
                            }}
                            className="w-full"
                          >
                            <NavLink
                              className="rounded p-2 group text-sm font-normal dark:text-slate-400 text-slate-500 w-full overflow-hidden flex items-center justify-between"
                              activeClasses="font-medium bg-indigo-50 text-indigo-500 dark:bg-slate-700 dark:text-indigo-400"
                              inactiveClasses="hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-500"
                              href={`/app/bot/${bot.id}`}
                              segment={bot.id}
                            >
                              <span className="overflow-ellipsis inline-block whitespace-nowrap line-clamp-1 flex-1">
                                {bot.name}
                              </span>
                              <div className="shrink-0 hidden">
                                <span className="group-hover:inline hidden fade-in-0 animate-in text-yellow-500 transition-all">
                                  <HiStar />
                                </span>
                              </div>
                            </NavLink>
                          </motion.li>
                        );
                      })
                    ) : data || error ? (
                      <EmptyState
                        size="sm"
                        label="No Bots Found"
                        description="No bots found, create a new bot to get started."
                      >
                        <Button
                          variant={{
                            size: "xs",
                          }}
                          onClick={() => mutate()}
                        >
                          refetch
                        </Button>
                        <Button
                          asChild
                          variant={{
                            intent: "primary",
                            size: "xs",
                          }}
                        >
                          <Link href="/app/bot/create">Create Bot</Link>
                        </Button>
                      </EmptyState>
                    ) : isLoading ? (
                      <div className="flex items-center justify-center w-full h-full">
                        <CgSpinnerAlt className="animate-spin" />
                      </div>
                    ) : (
                      <>error occured</>
                    )}
                  </ul>
                </ScrollArea>
              </div>
            </div>
          </div>
        </PopoverContent>
      </div>
    </Popover>
  );
}
