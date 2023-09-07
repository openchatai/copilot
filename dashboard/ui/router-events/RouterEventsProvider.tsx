"use client";
import { usePathname, useSearchParams } from "next/navigation";
import React, { type ReactNode, useEffect, useState } from "react";
import { RouterEventsSafeContext, type eventType } from "./Context";
import { usePrevious } from "./use-previous";

export function RouterEventsProvider({ children }: { children: ReactNode }) {
  const [event, setEvent] = useState<eventType>("changeCompleted");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const previous = usePrevious(pathname + searchParams.toString());

  useEffect(() => {
    // if the previous pathname is different from the current pathname => changeCompleted
    if (previous !== pathname + searchParams.toString()) {
      setEvent("changeCompleted");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return (
    <RouterEventsSafeContext.Provider
      value={{
        event,
        change: setEvent,
      }}
    >
      {children}
    </RouterEventsSafeContext.Provider>
  );
}
