import { useEffect, useRef } from "react";
import { useWidgetState } from "@lib/contexts";
import cn from "@lib/utils/cn";
import { ChatScreen } from "@lib/screens/ChatScreen";
import { isServer } from "@lib/utils/isServer";
import { MessageCircle } from "lucide-react";
import { GlobalResetStyles } from "./components/ResetWrapper";
import { StyleSheetManager } from "styled-components";
import { get } from "./utils/pkg";

const version = get("version");

function useTrigger(selector?: string, toggle?: () => void) {
  const trigger = useRef<HTMLElement | null>(
    !selector ? null : isServer ? null : document.querySelector(selector)
  ).current;

  useEffect(() => {
    if (!selector) {
      return;
    }

    if (trigger && !isServer) {
      trigger.addEventListener("click", () => toggle?.());
      return () => trigger.removeEventListener("click", () => toggle?.());
    } else {
      console.warn(
        "The trigger element can't be found, make sure it is present in the DOM"
      );
    }
  }, [selector, toggle, trigger]);
}

const cssColors = {
  "--opencopilot-primary-clr": "hsl(200 18% 46%)",
  "--opencopilot-accent-clr": "hsl(300, 7%, 97%)",
};

const OFFSET_BOTTOM = "20px";
const OFFSET_RIGHT = "20px";

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
    <StyleSheetManager namespace="#opencopilot-widget">
      <GlobalResetStyles />
      <div
        data-version={version}
        style={{ display: "contents", ...cssColors }}
        id="opencopilot-widget"
      >
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
              ? `calc(${OFFSET_RIGHT})`
              : undefined,
            bottom: SHOULD_RENDER_IN_THE_RIGHT_CORNER
              ? `calc(${OFFSET_BOTTOM} + 60px)`
              : undefined,
            height: SHOULD_RENDER_IN_THE_RIGHT_CORNER
              ? `calc(95% - ${OFFSET_BOTTOM} - 100px)`
              : "100%",
          }}
        >
          <ChatScreen />
        </div>
        {SHOULD_RENDER_IN_THE_RIGHT_CORNER && (
          <div
            className="fixed z-50 pointer-events-auto transition-all ease-in-out duration-300"
            style={{
              bottom: OFFSET_BOTTOM,
              right: OFFSET_RIGHT,
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
      </div>
    </StyleSheetManager>
  );
}
