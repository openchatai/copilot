'use client';
import React from "react";
import { BotIcon, Terminal } from "lucide-react";
import { Link } from "@/lib/router-events";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CopilotType } from "@/data/copilot";
import { Filter } from "./Search";
import _ from "lodash";
import { EmptyBlock } from "@/components/domain/EmptyBlock";
import { filterAtom } from "./Search";
import { useAtomValue } from "jotai";
import { format } from "timeago.js";
import { Button } from "@/components/ui/button";

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

export function CopilotsContainer({ copilots }: {
  copilots: CopilotType[]
}) {
  const { sort, query } = useAtomValue(filterAtom);
  const $copilots = customSort(
    _.filter(copilots, (item) => item.name.toLowerCase().includes(query)),
    sort,
  );
  return _.isEmpty($copilots) ? (
    <EmptyBlock>
      {_.isEmpty(query) ? (
        <>
          <p className="text-center text-gray-400">
            You don't have any copilots yet
          </p>
          <Button size="sm" asChild>
            <Link href="/create/copilot">Create a new copilot</Link>
          </Button>
        </>
      ) : (
        <p className="text-center text-gray-400">
          No copilots found for your search
        </p>
      )}
    </EmptyBlock>
  ) : (
    <div className="grid grid-cols-2 gap-8 py-4 xl:grid-cols-4">
      {$copilots?.map((copilot) => {
        const copilotUrl = "/copilot/" + copilot.id;
        return (
          <Link
            href={copilotUrl}
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
              <h2 className="line-clamp-1 text-ellipsis whitespace-nowrap text-sm font-semibold">
                {copilot.name}
              </h2>
              <p className="text-xs text-gray-400">
                created{" "}
                <span className="font-semibold">{format(copilot.created_at)}</span>
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
