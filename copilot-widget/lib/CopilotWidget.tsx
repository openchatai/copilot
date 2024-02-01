import { useEffect, useRef } from "react";
import { useWidgetState } from "./contexts/WidgetState";
import cn from "./utils/cn";
import ChatScreenWithSfxs from "./screens/ChatScreen";
import { IS_SERVER } from "./utils/is_server";

function useTrigger(selector?: string, toggle?: () => void) {
  const trigger = useRef<HTMLElement | null>(
    !selector ? null : IS_SERVER ? null : document.querySelector(selector)
  ).current;

  useEffect(() => {
    if (!selector) {
      return;
    }
    if (trigger && !IS_SERVER) {
      trigger.addEventListener("click", () => toggle?.());
      return () => trigger.removeEventListener("click", () => toggle?.());
    } else {
      console.warn(
        "The trigger element can't be found, make sure it is present in the DOM"
      );
    }
  }, [selector, toggle, trigger]);
}

export function CopilotWidget({
  triggerSelector,
}: {
  triggerSelector: string;
}) {
  const [open, toggle] = useWidgetState();
  useTrigger(triggerSelector, toggle);
  return (
    <div
      data-open={open}
      className={cn(
        "w-full overflow-hidden pointer-events-auto h-full rounded-lg bg-white shadow relative",
        "opacity-0 transition-opacity ease",
        open ? "opacity-100 animate-in fade-in" : "hidden animate-out fade-out"
      )}
    >
      <ChatScreenWithSfxs />
    </div>
  );
}
