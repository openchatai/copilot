import ReactDOM from "react-dom/client";
import css from "./styles/index.css?inline";
import { CopilotWidget, Root } from "./lib";
import { Options } from "./lib/types";

declare global {
  interface Window {
    initAiCoPilot: typeof initAiCoPilot;
  }
}

function initAiCoPilot({ triggerSelector, ...options }: Options) {
  // load styles first.
  const styleElement = document.createElement("style");
  styleElement.innerHTML = css;
  document.body.appendChild(styleElement);

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
