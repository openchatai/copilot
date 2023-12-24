import { useEffect, useRef } from "react";
import { useWidgetStateContext } from "./contexts/WidgetState";
import cn from "./utils/cn";
import ChatScreenWithSfxs from "./screens/ChatScreen";
import { IS_SERVER } from "./utils/is_server";

function useTrigger(selector: string, toggle: () => void) {
  const trigger = useRef<HTMLElement | null>(
    IS_SERVER ? null : document.querySelector(selector)
  ).current;
  useEffect(() => {
    if (trigger) {
      trigger.addEventListener("click", toggle);
      return () => trigger.removeEventListener("click", toggle);
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
  const [open, toggle] = useWidgetStateContext();
  useTrigger(triggerSelector, toggle)
  return (
    <div
      id="opencopilot-aicopilot"
      data-open={open}
      className={cn(
        "opencopilot-font-inter opencopilot-w-full opencopilot-overflow-hidden opencopilot-h-full sm:opencopilot-rounded-xl opencopilot-bg-white opencopilot-shadow",
        "opencopilot-opacity-0 opencopilot-transition-opacity opencopilot-ease",
        open &&
        "opencopilot-opacity-100 opencopilot-animate-in opencopilot-fade-in",
        !open &&
        "opencopilot-hidden opencopilot-animate-out opencopilot-fade-out"
      )}
    >
      <ChatScreenWithSfxs />
    </div>

  );
}
