"use client";
import React from "react";
import { Link } from "@/lib/router-events";
import useSwr from "swr";
import { CopilotType, listCopilots } from "@/data/copilot";
import Loading from "../loading";
import _ from "lodash";
import { EmptyBlock } from "@/components/domain/EmptyBlock";
import { filterAtom } from "./Search";
import { useAtomValue } from "jotai";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from "framer-motion";
import { CopilotCard } from "./CopilotCard";

function orderByCreatedAt(copilots: CopilotType[]) {
  return copilots.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

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
    <div className="grid gap-4 py-4 grid-cols-12 copilot__container">
      {orderByCreatedAt($copilots).map((copilot, index) => {
        return (
          <AnimatePresence
            key={copilot.id}>
              <CopilotCard
                copilot={copilot}
                index={index}
              />
          </AnimatePresence>
        );
      })}
    </div>
  );
}
