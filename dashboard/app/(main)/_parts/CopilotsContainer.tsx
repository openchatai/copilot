"use client";
import React from "react";
import { GalleryHorizontalEnd } from "lucide-react";
import { Link } from "@/lib/router-events";
import useSwr from "swr";
import { CopilotType, listCopilots } from "@/data/copilot";
import Loading from "../loading";
import _ from "lodash";
import { EmptyBlock } from "@/components/domain/EmptyBlock";
import { filterAtom } from "./Search";
import { useAtomValue } from "jotai";
import { Button } from "@/components/ui/button";
import { format } from "timeago.js";
import { motion, AnimatePresence } from 'framer-motion';
import { Stack } from "@/components/ui/Stack";
function orderByCreatedAt(copilots: CopilotType[]) {
  return copilots.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
const AnimatedLink = motion(Link);

export function CopilotsContainer() {
  const { data: copilots, isLoading } = useSwr("copilotsList", listCopilots);
  const { query } = useAtomValue(filterAtom);

  const $copilots = React.useMemo(() => {
    if (!copilots?.data) return [];
    if (!query) return copilots.data;
    return copilots.data.filter((copilot) => {
      return copilot.name.toLowerCase().includes(query.toLowerCase());
    });
  }, [copilots, query]);
  if (isLoading)
    return (
      <div className="flex-center py-4">
        <Loading />
      </div>
    );
    // when the server is down
  if (copilots?.status && copilots.status.toString().startsWith('50')){
    return (
      <div className="flex-center py-4">
        <p className="text-center text-gray-400">
        we are facing high load at the moment, please give us some time
        </p>
      </div>
    );
  }
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
    <>
      <datalist id="search-copilots-list">
        {
          $copilots.map(copilot => <option key={copilot.id} value={copilot.name} />)
        }
      </datalist>
      <div className="grid gap-4 py-4 grid-cols-12 copilot__container">
        {orderByCreatedAt($copilots).map((copilot, index) => {
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
                transition={{ duration: 0.2, delay: 0.1 * index }}
                className="group col-span-full lg:col-span-6 xl:col-span-3 copilot"
              >
                <div
                  style={{
                    transitionDelay: `max(0.1s, ${0.1 * index}ms)`,
                  }}
                  className="group relative flex h-56 items-center justify-center rounded-lg border-2 transition-colors box">
                  <div className="flex-center size-20 shadow-lg group-hover:scale-95 transition-transform rounded-lg bg-primary text-gray-100">
                    <GalleryHorizontalEnd className="size-12" />
                  </div>
                </div>
                <Stack className="mt-1.5 ps-1 justify-between" gap={10} fluid>
                  <h2 className="flex-1 text-sm font-semibold line-clamp-1" title={copilot.name}>
                    {copilot.name}
                  </h2>
                  <p className="text-xs text-black">
                    Created{" "}
                    <span className="font-semibold">{format(copilot.created_at)}</span>
                  </p>
                </Stack>
              </AnimatedLink>
            </AnimatePresence>
          );
        })}
      </div>
    </>

  );
}
