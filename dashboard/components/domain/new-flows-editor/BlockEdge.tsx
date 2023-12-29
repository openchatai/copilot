import { Plus } from "lucide-react";
import {
    BaseEdge,
    EdgeLabelRenderer,
    EdgeProps,
    getBezierPath
} from "reactflow";
import { cn } from "@/lib/utils";
import { memo } from "react";
import { useController } from "./Controller";

function BlockEdge({
    sourceX,
    sourceY,
    targetX,
    targetY,
    selected,
    sourcePosition,
    targetPosition,
    id,
    ...props
}: EdgeProps) {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        curvature: 0.2,
        sourcePosition,
        targetPosition,
    });
    const { addNextOnSuccess } = useController();
    const addBlock = () => {
        const [source, target] = id.split('|');
        if (source && target) {
            addNextOnSuccess(source, target);
        }
    }
    return (
        <>
            <EdgeLabelRenderer>
                <div
                    className="nodrag nopan"
                    style={{
                        position: "absolute",
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: "all",
                    }}
                >
                    <button
                        onClick={addBlock}
                        className={cn(
                            "rounded p-0.5 text-sm transition-colors",
                            selected ? "bg-sky-800 text-white" : "bg-sky-500 text-accent"
                        )}
                    >
                        <Plus size={25} />
                    </button>
                </div>
            </EdgeLabelRenderer>
            <BaseEdge {...props} path={edgePath} />
        </>
    );
}

export default memo(BlockEdge); 