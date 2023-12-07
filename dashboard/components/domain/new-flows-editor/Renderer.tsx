'use client';
import ReactFlow, { Background, Controls } from 'reactflow';
import actionBlock from './ActionBlock';
import 'reactflow/dist/style.css';
import { FloatingActionBar } from './FloatingActionBar';
const nodeTypes = {
    actionBlock
}
export function FlowRenderer() {
    return (
        <ReactFlow nodeTypes={nodeTypes}>
            <Controls position='bottom-right' />
            <Background color="var(--accent-foreground)" />
            <FloatingActionBar />
        </ReactFlow>
    )
}