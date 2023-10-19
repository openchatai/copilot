"use client";
import React from "react";
import { BotIcon, Terminal } from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useSwr from "swr";
import { listCopilots } from "@/data/copilot";
import { timeSince } from "@/lib/timesince";
import Loading from "../loading";
import { useSearchParams } from "next/navigation";
import { QUERY_KEY, SORT_KEY } from "./Search";
import _ from "lodash";
import Image from "next/image";
export function CopilotsContainer() {
  const { data: copilots, isLoading } = useSwr("copilotsList", listCopilots);
  const searchParams = useSearchParams();

  if (isLoading && !copilots)
    return (
      <div className="flex-center py-4">
        <Loading />
      </div>
    );
  const query = searchParams.get(QUERY_KEY) || "";
  const sort = searchParams.get(SORT_KEY) || "date-created";
  const $copilots = _.filter(copilots?.data, (item) =>
    item.name.toLowerCase().includes(query),
  );
  return _.isEmpty($copilots) ? (
    <div className="flex-center flex-col gap-2 animate-in fade-in py-4">
      <Image
        src={"/random_icons_2.svg"}
        width={60}
        height={60}
        alt="Random icon"
      />
      <p className="text-center text-gray-400">
        No copilots found for your search
      </p>
    </div>
  ) : (
    <div className="grid grid-cols-2 gap-8 py-4 xl:grid-cols-4">
      {$copilots?.map((copilot, i) => {
        const copilotUrl = "/copilot/" + copilot.id;
        const createdSince = timeSince(copilot.created_at);
        return (
          <div className="xl:aspect-square animate-in fade-in slide-in-from-top-2" key={i}>
            <div className="group relative flex h-56 items-center justify-center rounded-lg border bg-secondary p-5 shadow-sm">
              <div className="absolute left-2 top-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="rounded-full bg-white p-1.5 shadow-lg">
                      <Terminal className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      created via{" "}
                      <span className="text-white">Web application</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div>
                <div className="grid aspect-square h-20 place-content-center rounded-lg bg-slate-950 text-gray-100">
                  <BotIcon className="h-12 w-12" />
                </div>
              </div>
            </div>
            <div className="mt-1.5 ps-1">
              <Link
                href={copilotUrl}
                className="line-clamp-1 text-ellipsis whitespace-nowrap text-sm font-semibold"
              >
                {copilot.name}
              </Link>
              <p className="text-xs text-gray-400">
                created <span className="font-semibold">{createdSince}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
