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
import { CopilotType, listCopilots } from "@/data/copilot";
import { timeSince } from "@/lib/timesince";
import Loading from "../loading";
import { useSearchParams } from "next/navigation";
import { Filter, QUERY_KEY, SORT_KEY } from "./Search";
import _ from "lodash";
import Image from "next/image";

function customSort(list: CopilotType[], sortBy: Filter["sort"]) {
  if (sortBy === "last-viewed") {
    return _.orderBy(list, ["last_viewed", "name"], ["desc", "asc"]);
  } else if (sortBy === "date-created") {
    return _.orderBy(list, ["created_at", "name"], ["desc", "asc"]);
  } else if (sortBy === "alphapetically") {
    return _.orderBy(list, ["name", "created_at"], ["asc", "desc"]);
  } else {
    // Default to alphabetical sorting if sortBy is not recognized
    return _.orderBy(list, ["name", "created_at"], ["asc", "desc"]);
  }
}

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
  const sort = (searchParams.get(SORT_KEY) || "last-viewed") as Filter["sort"];
  const $copilots = customSort(
    _.filter(copilots?.data, (item) => item.name.toLowerCase().includes(query)),
    sort,
  );
  return _.isEmpty($copilots) ? (
    <div className="flex-center flex-col gap-2 py-4 animate-in fade-in">
      <Image
        src="/random_icons_2.svg"
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
      {$copilots?.map((copilot) => {
        const copilotUrl = "/copilot/" + copilot.id;
        const createdSince = timeSince(copilot.created_at);
        return (
          <div
            className="transition-transform animate-in fade-in slide-in-from-top-2 xl:aspect-square"
            key={copilot.id}
          >
            <div className="group relative flex h-56 items-center justify-center rounded-lg border bg-secondary p-5 shadow-sm">
              <div className="absolute left-2 top-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="rounded-full bg-white p-1.5 shadow">
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
                created{" "}
                <span className="font-semibold">{createdSince} ago</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
