'use client';
import ReactFlow, { Background, Controls, Edge, MarkerType, Node, ReactFlowProvider, useNodesState } from 'reactflow';
import actionBlock from './ActionBlock';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddActionDrawer, useActionFormState } from './AddFlowSheet';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useActions } from './actionsAtom';
import { ASIDE_DROPABLE_ID } from './consts';
import { useController } from './Controller';
import { useEffect } from 'react';
import { ActionsList } from './ActionsList';

const nodeTypes = {
    actionBlock
}

function autoLayout(blocks: any[]) {
    const newNodes: Node<any>[] = blocks.map((node, index) => {
        return {
            position: {
                x: 0,
                y: index * 150,
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

export function FlowRenderer() {
    const [actions] = useActions();
    const [nodes, setNodes, onNodeChange] = useNodesState([]);
    const { state: {
        blocks
    } } = useController();
    useEffect(() => {
        const { newNodes, edges } = autoLayout(blocks || []);
        setNodes(newNodes);
    }, [blocks, setNodes])
    function getNodeBlockById(id: string) {
        return nodes.find(node => node.id === id);
    }

    function getActionById(id: string) {
        return actions.find(action => action.id === id);
    }
    // use lodash
    function handleDragEnd(result: DropResult) {
        if (!result.destination) return;
        const { source, destination, draggableId, mode, type } = result;
        if (!draggableId) return;
        // perform copy of the action to the flow's block;
        console.log('source', source);
        console.log('destination', destination);
        console.log('draggableId', draggableId);
        if (source.droppableId === ASIDE_DROPABLE_ID) {
            if (destination.droppableId === ASIDE_DROPABLE_ID) return;
            // copy the action to the flow's block
            const actionId = draggableId.split('-')[1];
            if (actionId) {
                const action = getActionById(actionId);
                console.log('action', action);
                const block = getNodeBlockById(destination.droppableId);
            }
        }

    }
    const [, setDrawer] = useActionFormState();
    return (
        <ReactFlowProvider>
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className='flex items-center justify-between w-full h-full overflow-hidden'>
                    <aside className='w-full max-w-sm flex flex-col items-start h-full py-4 border-r bg-white overflow-hidden'>
                        <div className='flex flex-row justify-between w-full border-b pb-4 px-4 items-center'>
                            <div>
                                <h2 className='text-base font-semibold'>Actions</h2>
                                <p className='text-xs'>
                                    Drag and drop actions to the Blocks inside the flow
                                </p>
                            </div>
                            <Button size='fit' onClick={() => setDrawer(true)}>
                                <Plus size={16} />
                            </Button>
                        </div>
                        <div className='flex-1 w-full overflow-auto'>
                            <ActionsList />
                        </div>
                    </aside>
                    <AddActionDrawer />
                    <ReactFlow maxZoom={1} minZoom={1} nodeTypes={nodeTypes} nodes={nodes} onNodesChange={onNodeChange} className='flex-1'>
                        <Controls position='bottom-right' />
                        <Background color="var(--accent-foreground)" />
                    </ReactFlow>
                </div>
            </DragDropContext>
        </ReactFlowProvider>

    )
}