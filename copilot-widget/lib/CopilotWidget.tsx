import { useEffect } from "react";
import { useWidgetStateContext } from "./contexts/WidgetState";
import cn from "./utils/cn";
import ChatScreenWithSfxs from "./screens/ChatScreen";
import { IS_SERVER } from "./utils/is_server";
import css from "../styles/index.css?inline";
import root from 'react-shadow'

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

      // Return cleanup function to remove event listener
      return () => trigger.removeEventListener("click", toggle);
    } else {
      console.warn(
        "The trigger element can't be found, make sure it is present in the DOM"
      );
    }
  }, [triggerSelector, toggle]);
  return (
    <root.div>
      <style>{css}</style>
      <div
        id="opencopilot-aicopilot"
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
    </root.div>

  );
}
