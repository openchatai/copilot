import { useEffect, useRef } from "react";
import { useWidgetState } from "@lib/contexts";
import cn from "@lib/utils/cn";
import { ChatScreen } from "@lib/screens/ChatScreen";
import { isServer } from "@lib/utils/isServer";
import { MessageCircle } from "lucide-react";
import { GlobalResetStyles } from "./components/ResetWrapper";
import styled, { StyleSheetManager } from "styled-components";

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

const Container = styled.div<{
  $open: boolean;
  $shouldRenderInRightCorner?: boolean;
}>`
  width: 100%;
  height: 100%;
  max-width: 385px;
  position: relative;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 1rem;
  transform: translateX(0) translateY(0);
  transition: transform 0.3s ease-in-out;
  pointer-events: auto;
  overflow: hidden;
  
  ${({ $open }) => {
    return $open
      ? `
      transform: translateX(0) translateY(0);
      opacity: 1;
      visibility: visible;
    `
      : `
      transform: translateX(100%) translateY(0);
      opacity: 0;
      visibility: hidden;
    `;
  }}
  ${({ $shouldRenderInRightCorner }) =>
      $shouldRenderInRightCorner &&
      `
      position: fixed;
      right: var(--offset-right);
      bottom: var(--offset-bottom);
      height: calc(95% - var(--offset-bottom) - 100px);
  `}

`;

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
        style={{ display: "contents", ...cssColors }}
        id="opencopilot-widget"
      >
        <Container
          $open={open}
          data-open={open}
          $shouldRenderInRightCorner={SHOULD_RENDER_IN_THE_RIGHT_CORNER}
          className={cn(
            "w-full overflow-hidden pointer-events-auto h-full rounded-lg ",
            "opacity-0 transition-opacity ease",
            open
              ? "opacity-100 animate-in fade-in-10"
              : "hidden animate-out fade-out",
            SHOULD_RENDER_IN_THE_RIGHT_CORNER && "fixed max-w-sm w-full"
          )}
          style={{
            "--offset-right": OFFSET_RIGHT,
            "--offset-bottom": OFFSET_BOTTOM,
          } as any}
        >
          <ChatScreen />
        </Container>
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
