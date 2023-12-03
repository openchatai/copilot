import {
  Handle,
  NodeProps,
  Position,
  NodeToolbar,
} from "reactflow";
import { useMode } from "../stores/ModeProvider";
import { memo, useMemo } from "react";
import { Y, nodedimensions } from "./consts";
import { PlusIcon, TrashIcon } from "lucide-react";
import { MethodBtn } from "./MethodRenderer";
import { NodeData } from "../types/Swagger";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPrimitiveAction,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useController } from "..";

const HideHandleStyles = {
  background: "transparent",
  fill: "transparent",
  color: "transparent",
  border: "none",
};
function EndpointNode({ data, zIndex }: NodeProps<NodeData>) {
  const { deleteNode, state: { steps } } = useController();
  const nodeObj = steps ?.find((n) => n.id === data.id);
  const { mode, setMode, reset: resetMode } = useMode();
  const isActive = useMemo(() => {
    if (mode.type === "edit-node") {
      return mode.nodeId === data.id;
    } else {
      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const isFirstNode = steps ?.[0]?.id === data.id;
  const isLastNode = steps ?.[steps .length - 1]?.id === data.id;
  return (
    <>
      <NodeToolbar align="center" isVisible={isActive} position={Position.Left}>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="rounded-full bg-destructive p-2 text-white">
              <TrashIcon className="w-4 h-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              Are you sure you want to delete this node?
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogPrimitiveAction onClick={() => { deleteNode(data.id); resetMode() }} asChild>
                <Button variant="destructive">Yup!</Button>
              </AlertDialogPrimitiveAction>
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
            nodeObj && setMode({ type: "edit-node", nodeId: data.id });
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
            <p className="ms-2 line-clamp-2 text-xs font-medium">
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
                "text-white bg-primary ring-4 ring-primary/20 ring-offset-transparent",
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

export default memo(EndpointNode);