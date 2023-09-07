"use client";
import { ReactNode } from "react";
import { createSafeContext } from "../utils/createSafeContext";
import { useOnline } from "../hooks";

const [OnlineSafeProvider, useIsOnline] = createSafeContext<{
  online: boolean;
}>("useIsOnline is used outside of OnlineProvider");

/**
 * @description detects if the user is online or not
 */
function OnlineProvider({ children }: { children: ReactNode }) {
  const online = useOnline();
  return <OnlineSafeProvider value={{ online }}>{children}</OnlineSafeProvider>;
}

export { OnlineProvider, useIsOnline };
