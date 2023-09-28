import { useEffect } from "react";
import { useWidgetStateContext } from "./contexts/WidgetState";
import cn from "./utils/cn";
import ChatScreenWithSfxs from "./screens/ChatScreen";
import { IS_SERVER } from "./utils/is_server";

export function CopilotWidget({
  triggerSelector,
}: {
  triggerSelector: string;
}) {
  const [open, toggle] = useWidgetStateContext();
  useEffect(() => {
    if (IS_SERVER) return;
    const trigger = document.querySelector(triggerSelector);
    if (trigger) {
      trigger.addEventListener("click", toggle);
      return () => trigger.removeEventListener("click", toggle);
    } else {
      console.warn(
        "the trigger element can't be found,make sure it present in the DOM"
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerSelector]);
  return (
    <div
      className={cn(
        open &&
          "!opencopilot-z-[100000] opencopilot-transition-all opencopilot-shadow-lg opencopilot-ease-in sm:opencopilot-w-96 opencopilot-fixed opencopilot-w-screen opencopilot-h-screen opencopilot-top-0 opencopilot-bottom-0 opencopilot-right-0"
      )}
    >
      <div
        data-open={open}
        className={cn(
          "opencopilot-font-inter opencopilot-overflow-hidden opencopilot-h-full sm:opencopilot-rounded-xl opencopilot-bg-white",
          "opencopilot-opacity-0 opencopilot-transition-opacity opencopilot-ease",
          open &&
            "opencopilot-opacity-100 opencopilot-animate-in opencopilot-fade-in",
          !open &&
            "opencopilot-hidden opencopilot-animate-out opencopilot-fade-out"
        )}
      >
        <ChatScreenWithSfxs />
      </div>
    </div>
  );
}
