import type { FlowType } from "../types/Flow";

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
        steps: flow.steps.map(({ parameters, responses, requestBody, methods, ...step }) => ({
          ...step,
          open_api_operation_id: step.operationId,
          operation: "REQUEST"
        })),
        id: flow.id,
        requires_confirmation: true,
        on_success: [{}],
        on_failure: [{}],
      };
    }),
  };
}