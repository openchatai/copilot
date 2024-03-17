import { useSyncExternalStore } from "react";
import { useMessageHandler } from "@lib/contexts";

export function useChatState() {
  const { __handler } = useMessageHandler();

  return useSyncExternalStore(__handler.subscribe, __handler.getSnapshot);
}
