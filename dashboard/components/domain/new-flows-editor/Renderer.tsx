'use client';
import ReactFlow, { Background, Controls, ReactFlowProvider, useEdgesState, useNodesState } from 'reactflow';
import actionBlock from './ActionBlock';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddActionDrawer, useActionFormState } from './AddFlowSheet';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useController } from './Controller';
import { ASIDE_DROPABLE_ID, ActionsList } from './ActionsList';
import { useEffect } from 'react';
import BlockEdge from './BlockEdge';
import { autoLayout } from './autoLayout';

const nodeTypes = {
    actionBlock
}

const edgeTypes = {
    BlockEdge
}


export function FlowRenderer() {
    const [nodes, setNodes, onNodeChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const { state: {
        actions,
        blocks
    }, reorderActions, addActionToBlock, reorderActionsInBlock, deleteBlock, deleteActionFromBlock } = useController();

    useEffect(() => {
        const { newNodes, edges } = autoLayout(blocks);
        setNodes(newNodes);
        setEdges(edges);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blocks, setNodes, setEdges, autoLayout]);

    function getNodeBlockById(id: string) {
        return nodes.find(node => node.id === id);
    }

    function getActionById(id: string) {
        return actions.find(action => action.id === id);
    }

    function handleDragEnd(result: DropResult) {
        if (!result.destination) return;
        const { source, destination, draggableId, mode, type } = result;
        console.log(result);
        if (!draggableId) return;
        // perform copy of the action to the flow's block;
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
        // delete action form block 
        if (source.droppableId.startsWith('BLOCK_DROPABLE') && destination.droppableId === ASIDE_DROPABLE_ID) {
            const sourceBlockId = source.droppableId.split('|')[1];
            const actionId = draggableId.split('|')[1];
            console.log(sourceBlockId, actionId);
            if (sourceBlockId && actionId) {
                deleteActionFromBlock(sourceBlockId, actionId);
            }
        }
    }
    const [, setDrawer] = useActionFormState();
    return (
        <ReactFlowProvider>
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className='flex items-center justify-between w-full h-full overflow-hidden'>
                    <aside className='w-full max-w-sm flex flex-col items-start h-full py-4 border-r bg-white overflow-hidden'>
                        <div className='flex flex-row justify-between w-full border-b pb-3 px-4 items-center'>
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
                    <ReactFlow
                        fitView
                        fitViewOptions={{
                            padding: 20,
                            duration: 0.5,
                        }}
                        onNodesDelete={(nodes) => {
                            nodes.forEach(node => {
                                const blockId = node.id;
                                if (blockId) {
                                    deleteBlock(blockId);
                                }
                            })
                        }}
                        edges={edges}
                        edgeTypes={edgeTypes}
                        onEdgesChange={onEdgesChange}
                        maxZoom={1} minZoom={1} nodeTypes={nodeTypes} nodes={nodes} onNodesChange={onNodeChange} className='flex-1'>
                        <Controls position='bottom-right' />
                        <Background color="var(--accent-foreground)" />
                    </ReactFlow>
                </div>
            </DragDropContext>
        </ReactFlowProvider>

    )
}