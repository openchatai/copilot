import ReactDOM from "react-dom/client";
import { Options } from "@lib/types";
import Root from "@lib/Root";
import { CopilotWidget } from "@lib/CopilotWidget";

declare global {
  interface Window {
    initAiCoPilot: typeof initAiCoPilot;
  }
}

function initAiCoPilot({ triggerSelector, ...options }: Options) {
  const container = document.createElement("div") as HTMLDivElement;
  container.id = "opencopilot-aicopilot";
  document.body.appendChild(container);
  ReactDOM.createRoot(container).render(
    <Root
      options={{
        ...options,
      }}
    >
      <CopilotWidget triggerSelector={triggerSelector} />
    </Root>
  );
}

window.initAiCoPilot = initAiCoPilot;
