import ReactFlow, {
  Background,
  OnConnect,
  addEdge,
  useEdgesState,
  MarkerType,
  Edge,
  applyNodeChanges,
  NodeChange,
  useReactFlow,
} from "reactflow";
import { useCallback, useEffect, useMemo } from "react";
import "reactflow/dist/style.css";
import { NodeEdge } from "./EndpointEdge";
import EndpointNode from "./EndpointNode";
import { AsideMenu } from "./AsideMenu";
import { useMode } from "../stores/ModeProvider";
import { BUILDER_SCALE } from "./consts";
import { useController } from "../stores/Controller";

export function FlowArena() {
  const nodeTypes = useMemo(
    () => ({
      endpointNode: EndpointNode,
    }),
    [],
  );
  const edgeTypes = useMemo(
    () => ({
      endpointEdge: NodeEdge,
    }),
    [],
  );
  const { fitView } = useReactFlow();
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const {
    activeNodes,
    setNodes,
    state: { activeFlowId },
  } = useController();
  const { setMode } = useMode();
  // auto connect nodes
  useEffect(() => {
    if (!activeNodes) return;
    if (activeNodes.length === 0) {
      setMode({ type: "append-node" });
      return;
    }
    fitView();
    const newEdges = activeNodes
      .map((v, i, a) => {
        const curr = v;
        const next = a.at(i + 1);
        if (curr && next) {
          const id = curr.id + "-" + next.id;
          return {
            id: id,
            target: curr.id,
            source: next.id,
            type: "endpointEdge",
            markerStart: {
              type: MarkerType.ArrowClosed,
            },
          };
        }
      })
      .filter((v) => typeof v !== "undefined") as Edge[];
    setEdges(newEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNodes]);

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const nodeChange = applyNodeChanges(changes, activeNodes || []);
      setNodes(nodeChange);
    },
    [setNodes, activeNodes],
  );
  const empty = useMemo(() => {
    return activeNodes?.length === 0 || activeFlowId === undefined;
  }, [activeNodes, activeFlowId]);
  return (
    <>
      <div className="relative h-full w-full overflow-hidden">
        <AsideMenu />
        <div className="relative h-full">
          {empty && (
            <div
              className="group absolute inset-0 z-10 select-none bg-accent transition-all duration-300 ease-in-out hover:bg-opacity-20"
              data-container="empty-state"
            >
              <div className="flex h-full items-center justify-center">
                <div className="w-full max-w-sm rounded border border-dashed border-accent-foreground p-2 text-center text-base text-accent-foreground transition-opacity">
                  {activeFlowId
                    ? "Start by selecting an endpoint from the menu"
                    : "Start by creating a flow"}
                </div>
              </div>
            </div>
          )}
          <ReactFlow
            nodeTypes={nodeTypes}
            nodes={activeFlowId ? activeNodes : []}
            edges={edges}
            onEdgeClick={(event, edge) => {
              event.stopPropagation();
              event.bubbles = false;
              setMode({
                type: "add-node-between",
                edge: edge,
              });
            }}
            className="h-full w-full origin-center transition-all duration-300"
            edgeTypes={edgeTypes}
            maxZoom={BUILDER_SCALE}
            minZoom={BUILDER_SCALE}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            deleteKeyCode={[]}
            fitView
          >
            <Background />
          </ReactFlow>
        </div>
      </div>
    </>
  );
}
