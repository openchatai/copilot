import ReactFlow, {
  Background,
  OnConnect,
  addEdge,
  useEdgesState,
  MarkerType,
  Edge,
  useNodesState,
  Node,
} from "reactflow";
import { useCallback, useEffect } from "react";
import "reactflow/dist/style.css";
import { NodeEdge } from "./EndpointEdge";
import EndpointNode from "./EndpointNode";
import { AsideMenu } from "./AsideMenu";
import { useMode } from "../stores/ModeProvider";
import { BUILDER_SCALE, Y } from "./consts";
import { useController } from "../stores/Controller";
import { NodeData } from "../types/Swagger";

function autoLayout(nodes: NodeData[]) {
  const newNodes: Node<NodeData>[] = nodes.map((node, index) => {
    return {
      position: {
        x: 0,
        y: index * Y,
      },
      draggable: false,
      type: "endpointNode",
      id: node.id,
      data: node,
    };
  });
  const edges: Edge[] = newNodes.map((node, index) => {
    const next = newNodes[index + 1];
    if (next) {
      return {
        id: node.id + "-" + next.id,
        target: node.id,
        source: next.id,
        type: "endpointEdge",
        sourceHandleId: "out",
        targetHandleId: "in",
        markerStart: {
          type: MarkerType.ArrowClosed,
        },
      };
    }
  }).filter((v) => typeof v !== "undefined") as Edge[];
  return {
    newNodes,
    edges,
  };
}

const nodeTypes = {
  endpointNode: EndpointNode,
}
const edgeTypes = {
  endpointEdge: NodeEdge,
}

export function FlowArena() {
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const { activeNodes, state } = useController();
  const { setMode } = useMode();

  useEffect(() => {
    const { newNodes, edges } = autoLayout(activeNodes || []);
    setNodes(newNodes);
    setEdges(edges);
  }, [state.flows, activeNodes]);

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );


  return (
    <div className="relative h-full w-full overflow-hidden">
      <AsideMenu />
      <div className="relative h-full">
        <ReactFlow
          nodeTypes={nodeTypes}
          nodes={nodes}
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
  );
}