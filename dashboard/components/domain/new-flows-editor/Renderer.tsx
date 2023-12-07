'use client';
import { Background, ReactFlow } from 'reactflow';

export function FlowRenderer() {
    return (
        <ReactFlow>
            <Background color="#aaa" gap={16} />
        </ReactFlow>
    )
}