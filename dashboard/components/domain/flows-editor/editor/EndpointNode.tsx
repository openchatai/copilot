import {
  Handle,
  NodeProps,
  Position,
  useNodeId,
  useNodes,
  NodeToolbar,
  useReactFlow,
} from "reactflow";
import { useMode } from "../stores/ModeProvider";
import { memo, useCallback, useMemo } from "react";
import { Y, nodedimensions } from "./consts";
import { PlusIcon, TrashIcon } from "lucide-react";
import { MethodBtn } from "./MethodRenderer";
import { NodeData } from "../types/Swagger";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { updateNodesPositions } from "../utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import _ from "lodash";

const HideHandleStyles = {
  background: "transparent",
  fill: "transparent",
  color: "transparent",
  border: "none",
};
function EndpointNode({ data, zIndex }: NodeProps<NodeData>) {
  const nodes = useNodes<NodeData>();
  const { setNodes } = useReactFlow();
  const nodeId = useNodeId();
  const nodeObj = nodes.find((n) => n.id === nodeId);
  const { mode, setMode, reset: resetMode } = useMode();
  const isActive = useMemo(() => {
    if (mode.type === "edit-node") {
      return mode.node.id === nodeId;
    } else {
      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const isFirstNode = nodes?.[0]?.id === nodeId;
  const isLastNode = nodes?.[nodes.length - 1]?.id === nodeId;
  const deleteNode = useCallback(() => {
    setTimeout(() => {
      setNodes(
        updateNodesPositions(
          nodes.filter((nd) => nd.id !== nodeId),
          Y,
        ),
      );
      resetMode();
    }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <NodeToolbar align="center" isVisible={isActive} position={Position.Left}>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="rounded-full bg-accent p-2 text-lg text-rose-500 transition-colors">
              <TrashIcon />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              Are you sure you want to delete this node?
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={deleteNode} asChild>
                <Button variant="destructive">Yup!</Button>
              </AlertDialogAction>
              <AlertDialogCancel asChild>
                <Button variant="secondary">Nope!</Button>
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </NodeToolbar>
      {!isFirstNode && (
        <Handle
          type="source"
          position={Position.Top}
          id="in"
          style={HideHandleStyles}
        />
      )}
      <div
        className="relative"
        style={{
          height: `min(${nodedimensions.height}px,fit-content)`,
          width: `${nodedimensions.width}px`,
        }}
      >
        <div
          onClick={() => {
            nodeObj && setMode({ type: "edit-node", node: nodeObj });
          }}
          className={cn(
            "group h-full w-full cursor-pointer select-none rounded border bg-white transition-all duration-300 ease-in-out",
            isActive
              ? "border-primary [box-shadow:inset_0px_2.5px_0px_0px_theme(colors.indigo.500)]"
              : "border-border hover:shadow",
          )}
        >
          <div className="flex w-full flex-col gap-1 p-1.5">
            <code className="block text-xs text-accent-foreground">
              {data.path}
            </code>
            <p className="ms-2 line-clamp-2 text-xs font-medium text-slate-600">
              {data.description}
            </p>
            <MethodBtn
              method={data.method}
              className="ms-auto cursor-default !px-1 !py-0.5 !text-xs font-bold uppercase"
            >
              {data.method}
            </MethodBtn>
          </div>
        </div>
        {isLastNode && (
          <div
            data-btn="append-node"
            className="absolute left-1/2 flex w-0.5 items-center justify-center rounded bg-[#ddd]"
            style={{
              height: Y / 2 + "px",
              zIndex: zIndex,
            }}
          >
            <button
              onClick={() => setMode({ type: "append-node" })}
              className={cn(
                "rounded bg-[#ddd] p-0.5 text-sm transition-all duration-300 ease-in-out",
                mode.type === "append-node" &&
                  "text-primbg-primary bg-primary ring-4 ring-primary/20 ring-offset-transparent",
              )}
            >
              <PlusIcon />
            </button>
          </div>
        )}
      </div>

      <Handle
        type="target"
        style={HideHandleStyles}
        position={Position.Bottom}
        id="out"
      />
    </>
  );
}

const MemoizedEndpointNode = memo(EndpointNode);
export default MemoizedEndpointNode;
