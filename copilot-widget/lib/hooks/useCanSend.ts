import { useChatLoading } from "@lib/hooks";
import { useSocket } from "@lib/contexts";
import { useMemo } from "react";

export function useCanSend({ input }: { input: string }) {
  const isLoading = useChatLoading();
  const { state } = useSocket();
  const canSend =
    input.trim().length > 0 && !isLoading && state.state === "connected";

  const cantSendReason = useMemo(() => {
    if (isLoading) return "loading";
    if (state.state !== "connected") return "disconnected";
    return "empty";
  }, [isLoading, state.state]) as "loading" | "disconnected" | "empty";

  return { canSend, cantSendReason };
}
