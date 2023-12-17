"use client";
import React from "react";
import { BotIcon, Terminal } from "lucide-react";
import { Link } from "@/lib/router-events";
import useSwr from "swr";
import { CopilotType, listCopilots } from "@/data/copilot";
import Loading from "../loading";
import { Filter } from "./Search";
import _ from "lodash";
import { EmptyBlock } from "@/components/domain/EmptyBlock";
import { filterAtom } from "./Search";
import { useAtomValue } from "jotai";
import { Button } from "@/components/ui/button";
import { format } from "timeago.js";
import { Tooltip } from "@/components/domain/Tooltip";
import { motion, AnimatePresence } from 'framer-motion';

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
const AnimatedLink = motion(Link);

export function CopilotsContainer() {
  const { data: copilots, isLoading } = useSwr("copilotsList", listCopilots);
  const { sort, query } = useAtomValue(filterAtom);

  if (isLoading && !copilots)
    return (
      <div className="flex-center py-4">
        <Loading />
      </div>
    );
  const $copilots = customSort(
    _.filter(copilots?.data, (item) => item.name.toLowerCase().includes(query)),
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
    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 auto-rows-fr py-4 lg:grid-cols-4">
      {$copilots?.map((copilot, index) => {
        const copilotUrl = "/copilot/" + copilot.id;
        return (
          <AnimatePresence
            key={copilot.id}>
            <AnimatedLink
              key={copilot.id}
              href={copilotUrl}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              initial={{
                opacity: 0, y: 50,
                filter: "blur(10px)"
              }}
              exit={{
                opacity: 0, y: 50,
                filter: "blur(10px)"
              }}
              transition={{ duration: 0.2, delay: 0.01 * index }}
              className="group"
            >
              <div className="group relative flex h-56 items-center justify-center rounded-lg border-2 bg-accent group-hover:bg-secondary p-5 group-hover:shadow transition-shadow">
                <Tooltip
                  content={<>
                    created via{" "}
                    <span className="text-white">Web application</span>
                  </>}>
                  <span className="shadow bg-white absolute left-2 top-2 h-fit text-black p-1.5 rounded-full">
                    <Terminal className="h-4 w-4" />
                  </span>
                </Tooltip>
                <div className="grid aspect-square h-20 shadow-lg place-content-center group-hover:scale-95 transition-transform rounded-lg bg-slate-950 text-gray-100">
                  <BotIcon className="h-12 w-12" />
                </div>
              </div>
              <div className="mt-1.5 ps-1">
                <h2 className="line-clamp-1 text-sm font-semibold">
                  {copilot.name}
                </h2>
                <p className="text-xs text-gray-400">
                  created{" "}
                  <span className="font-semibold">{format(copilot.created_at)}</span>
                </p>
              </div>
            </AnimatedLink>
          </AnimatePresence>
        );
      })}
    </div>
  );
}
