import { useEffect, useRef } from "react";
import { useWidgetState } from "./contexts/WidgetState";
import cn from "./utils/cn";
import ChatScreen from "./screens/ChatScreen";
import { IS_SERVER } from "./utils/is_server";
import { MessageCircle } from "lucide-react";

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

const TRIGGER_BOTTOM = "20px";
const TRIGGER_RIGHT = "20px";

export function CopilotWidget({
  triggerSelector,
  __isEmbedded,
}: {
  triggerSelector?: string;
  __isEmbedded?: boolean;
}) {
  const [open, toggle] = useWidgetState();
  useTrigger(triggerSelector, toggle);
  const SHOULD_RENDER_IN_THE_RIGHT_CORNER = !triggerSelector && __isEmbedded;
  return (
    <>
      <div
        data-open={open}
        className={cn(
          "w-full overflow-hidden pointer-events-auto h-full rounded-lg bg-white shadow relative",
          "opacity-0 transition-opacity ease",
          open
            ? "opacity-100 animate-in fade-in-10"
            : "hidden animate-out fade-out",
          SHOULD_RENDER_IN_THE_RIGHT_CORNER && "fixed max-w-sm w-full"
        )}
        style={{
          right: SHOULD_RENDER_IN_THE_RIGHT_CORNER
            ? `calc(${TRIGGER_RIGHT})`
            : undefined,
          bottom: SHOULD_RENDER_IN_THE_RIGHT_CORNER
            ? `calc(${TRIGGER_BOTTOM} + 60px)`
            : undefined,
          height: SHOULD_RENDER_IN_THE_RIGHT_CORNER
            ? `calc(95% - ${TRIGGER_BOTTOM} - 100px)`
            : "100%",
        }}
      >
        <ChatScreen />
      </div>

      {SHOULD_RENDER_IN_THE_RIGHT_CORNER && (
        <div
          className="fixed z-50 pointer-events-auto transition-all ease-in-out duration-300"
          style={{
            bottom: TRIGGER_BOTTOM,
            right: TRIGGER_RIGHT,
          }}
        >
          <button
            onClick={toggle}
            className="rounded-full p-2.5 text-white bg-primary flex-center"
          >
            <MessageCircle className="size-8 rtl:-scale-x-100" />
          </button>
        </div>
      )}
    </>
  );
}
