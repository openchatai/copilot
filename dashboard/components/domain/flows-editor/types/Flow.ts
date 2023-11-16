import type { Node } from "reactflow";
import type { NodeData } from "./Swagger";

export type Step = {
  stepId?: string;
  operation: string;
  open_api_operation_id: string;
  parameters?: Record<string, unknown>[];
};

export type Flow = {
  name: string;
  description?: string;
  requires_confirmation: boolean;
  steps: Step[];
};

export type FlowSchema = {
  opencopilot: string;
  info: {
    title: string;
    version: string;
  };
  flows: Flow[];
  on_success: {
    handler: string;
  }[];
  on_failure: {
    handler: string;
  }[];
};
export type FlowType = {
  id: string;
  name: string;
  description?: string;
  createdAt?: number;
  updatedAt?: number;
  steps: EndpointNodeType[];
};
export type EndpointNodeType = Node<NodeData>;
