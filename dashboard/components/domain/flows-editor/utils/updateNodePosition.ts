import type { Node } from 'reactflow';
export function updateNodesPositions(nodes: Node[], Y: number): Node[] {
    // Choose a suitable distance
    const updatedNodes = nodes.map((node, index) => ({
        ...node,
        position: { x: 0, y: index * Y },
    }));
    return updatedNodes;
}
