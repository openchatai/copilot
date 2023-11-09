import { Plus } from "lucide-react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getStraightPath,
} from "reactflow";
import { useMode } from "../stores/ModeProvider";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export function NodeEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  ...props
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
  const { mode } = useMode();
  const activeEdge = useMemo(() => {
    if (mode.type === "add-node-between") return mode.edge;
  }, [mode]);
  return (
    <>
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan text-sm"
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
        >
          <button
            className={cn(
              "rounded bg-accent p-0.5 text-sm transition-all duration-300 ease-in-out",
              activeEdge?.id === props.id &&
                "bg-primary text-primary ring-4 ring-indigo-200 ring-offset-transparent",
            )}
          >
            <Plus />
          </button>
        </div>
      </EdgeLabelRenderer>
      <BaseEdge
        {...props}
        path={edgePath}
        style={{
          strokeWidth: 2,
          stroke: "var(--border)",
        }}
      />
    </>
  );
}
