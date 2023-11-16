import { Y } from "../editor/consts";
import type { EndpointNodeType } from "../types/Flow";
import { genId } from "./genId";
export function trasnformEndpointNodesData(nodes: EndpointNodeType[]) {
  return nodes
    .map((node) => node.data)
    .map((data) => ({
      operation: "call",
      stepId: data.operationId,
      open_api_operation_id: data.operationId,
      ...data,
    }));
}
// the reverse of the above function
export function transformaEndpointToNode(
  data: EndpointNodeType["data"][],
): EndpointNodeType[] {
  return data.map((nodeData, index) => ({
    id: genId(),
    type: "endpointNode",
    draggable: false,
    position: {
      x: 0,
      y: index * Y,
    },
    data: nodeData,
  }));
}
