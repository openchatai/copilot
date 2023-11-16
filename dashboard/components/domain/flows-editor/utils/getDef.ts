import type { FlowType } from "../types/Flow";
import { trasnformEndpointNodesData } from "./transformEndpointNodes";

export function getDef(flows: FlowType[]) {
  return {
    opencopilot: "0.1",
    info: {
      title: "My OpenCopilot definition",
      version: "1.0.0",
    },
    flows: flows.map((flow) => {
      return {
        name: flow.name,
        description: flow.description,
        steps: trasnformEndpointNodesData(flow.steps),
        requires_confirmation: true,
        on_success: [{}],
        on_failure: [{}],
      };
    }),
  };
}
