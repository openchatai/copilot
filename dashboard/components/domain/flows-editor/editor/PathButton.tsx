import { useReactFlow, type Node, Edge } from "reactflow";
import { MethodBtn } from "./MethodRenderer";
import { Y } from "./consts";
import { useMode } from "../stores/ModeProvider";
import { useCallback } from "react";
import { useController } from "../stores/Controller";
import { Method, NodeData, TransformedPath } from "../types/Swagger";
import { genId, updateNodesPositions } from "../utils";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function PathButton({ path }: { path: TransformedPath }) {
  const { mode } = useMode();
  const { setNodes, getNodes, setEdges } = useReactFlow<NodeData>();
  const nodes = getNodes();
  const {
    state: { activeFlowId },
  } = useController();
  const appendNode = useCallback(
    (payload: NodeData) => {
      const id = genId();
      const newNode: Node = {
        id: id,
        type: "endpointNode",
        data: payload,
        draggable: false,
        position: { x: 0, y: Y * nodes.length },
      };
      setNodes((nds) => updateNodesPositions([...nds, newNode], Y));
    },
    [nodes.length, setNodes],
  );

  const addNodeBetween = useCallback(
    (edge: Edge, payload: NodeData) => {
      const targetNode = nodes.find((node) => node.id === edge.target);
      const sourceNode = nodes.find((node) => node.id === edge.source);
      if (!targetNode || !sourceNode) {
        return;
      }
      // delete the edge
      setEdges((eds) => eds.filter((ed) => ed.id !== edge.id));
      // add the new node
      const id = genId();
      const newNode: Node = {
        id: id,
        type: "endpointNode",
        data: payload,
        draggable: false,
        position: {
          x: 0,
          y: (sourceNode.position.y + targetNode.position.y) / 2,
        },
      };
      // put the new node in the middle of the two nodes that were connected (make sure the node is sorted in array too)
      const sourceIndex = nodes.findIndex((node) => node.id === sourceNode.id);
      const newNodes = nodes
        .slice(0, sourceIndex)
        .concat(newNode)
        .concat(nodes.slice(sourceIndex));
      setNodes(updateNodesPositions(newNodes, Y));
    },
    [nodes, setEdges, setNodes],
  );

  const isPresentInNodes = useCallback(
    (method: Method) => {
      return !!nodes.find((node) => {
        return (
          node.data.path === path.path &&
          node.data.method.toLowerCase() === method.toLowerCase()
        );
      });
    },
    [nodes, path],
  );

  return (
    <div className="animate-in fade-in">
      <div className="h-full rounded-lg border border-border p-3 text-start !shadow-none transition-colors hover:bg-accent">
        <span className="text-lg font-medium">{path.path}</span>
        <span className="mt-2 flex w-full items-center gap-1">
          <TooltipProvider>
            {path.methods.map((method, i) => {
              return (
                <Tooltip key={i}>
                  <TooltipContent>{method.description}</TooltipContent>
                  <TooltipTrigger asChild>
                    <MethodBtn
                      key={method.method}
                      method={method.method}
                      className="data-[present=true]:pointer-events-none data-[present=true]:opacity-50"
                      data-present={isPresentInNodes(method.method)}
                      onClick={() => {
                        if (isPresentInNodes(method.method)) {
                          return;
                        }
                        if (!activeFlowId) {
                          alert("Please create a flow first");
                          return;
                        }
                        const newNode: NodeData = {
                          path: path.path,
                          ...method,
                        };
                        if (mode.type === "append-node") {
                          appendNode(newNode);
                        } else if (mode.type === "add-node-between") {
                          addNodeBetween(mode.edge, newNode);
                        }
                      }}
                    >
                      {method.method.toUpperCase()}
                    </MethodBtn>
                  </TooltipTrigger>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </span>
      </div>
    </div>
  );
}
