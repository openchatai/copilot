'use client';
import ReactFlow, { Background, Controls, Edge, MarkerType, Node, ReactFlowProvider, useNodesState } from 'reactflow';
import actionBlock from './ActionBlock';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddActionDrawer, useActionFormState } from './AddFlowSheet';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { reorderList, useController } from './Controller';
import { ASIDE_DROPABLE_ID, ActionsList } from './ActionsList';
import _ from 'lodash';
import { useEffect } from 'react';

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
            type: "actionBlock",
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
    const [nodes, setNodes, onNodeChange] = useNodesState([]);
    const { state: {
        actions,
        blocks
    }, reorderActions, addActionToBlock, reorderActionsInBlock } = useController();

    useEffect(() => {
        const { newNodes, edges } = autoLayout(blocks);
        console.log('newNodes', newNodes);
        setNodes(newNodes);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blocks, setNodes]);

    function getNodeBlockById(id: string) {
        return nodes.find(node => node.id === id);
    }

    function getActionById(id: string) {
        return actions.find(action => action.id === id);
    }

    function handleDragEnd(result: DropResult) {
        if (!result.destination) return;
        const { source, destination, draggableId, mode, type } = result;
        if (!draggableId) return;
        // perform copy of the action to the flow's block;
        console.log('source', source);
        console.log('destination', destination);
        console.log('draggableId', draggableId);
        if (source.droppableId === ASIDE_DROPABLE_ID) {
            if (destination.droppableId === ASIDE_DROPABLE_ID) {
                // reorder the actions inside the aside list
                reorderActions(source.index, destination.index);
            }
            // copy the action to the flow's block
            const actionId = draggableId.split('|')[1];
            const blockId = destination.droppableId.split('|')[1];
            if (actionId && blockId) {
                const block = getNodeBlockById(blockId);
                const action = getActionById(actionId);
                if (action && block) {
                    addActionToBlock(blockId, action, destination.index);
                }
            }
        }
        if (source.droppableId.startsWith('BLOCK_DROPABLE') && destination.droppableId.startsWith('BLOCK_DROPABLE')) {
            // reorder the actions inside the block
            const sourceBlockId = source.droppableId.split('|')[1];
            const destinationBlockId = destination.droppableId.split('|')[1];
            if (sourceBlockId && destinationBlockId && (sourceBlockId === destinationBlockId)) {
                // reorder the actions inside the block
                reorderActionsInBlock(sourceBlockId, source.index, destination.index);
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
                            <Button size='fit' variant='secondary' onClick={() => setDrawer(true)}>
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