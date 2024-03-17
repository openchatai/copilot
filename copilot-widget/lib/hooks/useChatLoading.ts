import { useSyncExternalStore } from "react";
import { useMessageHandler } from "@lib/contexts";

export function useChatLoading() {
  const { __handler } = useMessageHandler();

  return useSyncExternalStore(__handler.subscribe, __handler.isLoading);
}
