"use client";
import { createContext, useContext } from "react";
export type eventType = "changeCompleted" | "changeStarted";
export const RouterEventsSafeContext = createContext<{
  event: eventType;
  change: React.Dispatch<React.SetStateAction<eventType>>;
}>({
  event: "changeCompleted",
  change: (c) => {},
});

export function useEvents() {
  const context = useContext(RouterEventsSafeContext);
  return context;
}
