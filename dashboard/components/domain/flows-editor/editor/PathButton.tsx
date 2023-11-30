import { MethodBtn } from "./MethodRenderer";
import { useMode } from "../stores/ModeProvider";
import { useController } from "../stores/Controller";
import { Method, TransformedPath } from "../types/Swagger";
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCallback } from "react";

export function PathButton({ path }: { path: TransformedPath }) {
  const { mode } = useMode();
  const {
    state: { activeFlowId },
    activeNodes,
    appendNode,
    addNodeBetween,
  } = useController();

  const isPresentInNodes = useCallback(
    (method: Method) => {
      return !!activeNodes?.find((node) => {
        return (
          node.path === path.path &&
          node.method.toLowerCase() === method.toLowerCase()
        );
      });
    },
    [activeNodes, path],
  );

  return (
    <div className="animate-in fade-in">
      <div className="h-full rounded-lg border border-border p-3 text-start !shadow-none transition-colors hover:bg-accent">
        <span className="text-base font-medium">{path.path}</span>
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
                      className="disabled:pointer-events-none disabled:opacity-50"
                      disabled={isPresentInNodes(method.method)}
                      onClick={() => {
                        if (isPresentInNodes(method.method)) {
                          return;
                        }
                        if (!activeFlowId) {
                          alert("Please select a flow first");
                          return;
                        }
                        const node = {
                          id: `${path.path}-${method.method}`,
                          ...method, ...path
                        }
                        if (mode.type === "append-node") {
                          appendNode(node);
                        }
                        if (mode.type === "add-node-between") {
                          const sourceId = mode.edge.source;
                          const targetId = mode.edge.target;
                          addNodeBetween(sourceId, targetId, node);
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