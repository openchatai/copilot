'use client';
import ReactFlow, { Background, Controls, useEdgesState, useNodesState, OnConnectStart, OnConnect, OnConnectEnd, OnConnectStartParams, Node } from 'reactflow';
import actionBlock from './ActionBlock';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { AlertCircle, Plus } from 'lucide-react';
import { AddActionDrawer, useActionFormState } from './addActionDrawer';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useController } from './Controller';
import { ASIDE_DROPABLE_ID, ActionsList } from './ActionsList';
import { ReactNode, useCallback, useEffect, useRef } from 'react';
import BlockEdge from './BlockEdge';
import { autoLayout } from './autoLayout';
import _ from 'lodash';
import { ActionWithModifiedParametersResponse } from '@/data/actions';
import { MagicAction } from './MagicAction';
import { SwaggerDnd } from './SwaggerDnd';
import { useCopilot } from '@/app/(authenticated)/(copilot)/copilot/CopilotProvider';

const nodeTypes = {
    actionBlock
}

const edgeTypes = {
    BlockEdge
}
function DndContext({ children, nodes, actions }: {
    children: ReactNode, nodes: Node[], actions: ActionWithModifiedParametersResponse[]
}) {
    const { reorderActions, addActionToBlock, reorderActionsInBlock,
        deleteActionFromBlock,
        moveActionFromBlockToBlock } = useController();
    async function handleDragEnd(result: DropResult) {
        if (!result.destination || !result.draggableId || !result.source) return;
        const { source, destination, draggableId } = result;
        console.log(result)
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
            return;
        }
        else if (source.droppableId.startsWith('BLOCK_DROPABLE')) {
            const sourceBlockId = source.droppableId.split('|')[1];

            if (destination.droppableId.startsWith('BLOCK_DROPABLE')) {
                // reorder the actions inside the block
                const destinationBlockId = destination.droppableId.split('|')[1];
                // reorder the actions inside the block
                if (sourceBlockId && destinationBlockId && (sourceBlockId === destinationBlockId)) {
                    reorderActionsInBlock(sourceBlockId, source.index, destination.index);
                }
                // move action from one block to another
                if (sourceBlockId && destinationBlockId && (sourceBlockId !== destinationBlockId)) {
                    const actionId = draggableId.split('|')[1];
                    if (actionId) {
                        moveActionFromBlockToBlock(sourceBlockId, destinationBlockId, destination.index, actionId);
                    }
                }
            }

            // delete action form block
            else if (destination.droppableId === ASIDE_DROPABLE_ID) {
                const actionId = draggableId.split('|')[1];
                if (sourceBlockId && actionId) {
                    deleteActionFromBlock(sourceBlockId, actionId);
                }
            }
        }
        else {
            console.log(result)
        }
    }
    const getNodeBlockById = useCallback((id: string) => {
        return nodes.find(node => node.id === id);
    }, [nodes])

    const getActionById = useCallback((id: string) => {
        return actions.find(action => action.id === id);
    }, [actions])

    return (
        <DragDropContext
            onDragEnd={handleDragEnd}>
            {children}
        </DragDropContext>
    )
}

export function FlowRenderer() {
    const reactFlowWrapper = useRef(null);
    const connectingNodeParams = useRef<OnConnectStartParams | null>(null);
    const [nodes, setNodes, onNodeChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { state: { blocks, actions, description }, deleteBlock, insertEmptyBlockAfter } = useController();
    const isBlocksEmpty = _.isEmpty(blocks);
    const {
        id: copilotId
    } = useCopilot();
    useEffect(() => {
        _.throttle(async () => {
            const { newNodes, edges } = autoLayout(blocks);
            setNodes(newNodes);
            setEdges(edges);
        }, 500)()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blocks, setNodes, setEdges, autoLayout]);

    const [, setDrawer] = useActionFormState();

    const onConnectStart: OnConnectStart = (ev, params) => {
        connectingNodeParams.current = params
    }

    const onConnectEnd: OnConnectEnd = (ev) => {
        if (!connectingNodeParams.current) return;
        const source = connectingNodeParams.current;
        if (ev.target) {
            const targetIsPane = ev.target
            if (targetIsPane) {
                // add a new block after the source block id
                if (source.nodeId) {
                    if (connectingNodeParams.current.handleType === 'source') {
                        insertEmptyBlockAfter(source.nodeId);
                    }
                }
            }
        }
    }

    const onConnect: OnConnect = () => {
        connectingNodeParams.current = null;
    }
    return (
        <DndContext nodes={nodes} actions={actions}>
            <div className='flex items-center justify-between w-full h-full overflow-hidden'>
                <aside className='w-full backdrop-blur-sm max-w-xs flex *:w-full flex-col items-start h-full pt-2 border-r border-accent bg-white'>
                    <div className='flex flex-row justify-between border-b pb-4 gap-2 px-4 items-center'>
                        <div>
                            <h2 className='text-base font-bold'>Actions</h2>
                            <p className='text-xs'>
                                Drag and drop actions to the Blocks inside the flow
                            </p>
                        </div>
                        <Button size='fit' variant='secondary' onClick={() => setDrawer(true)}>
                            <Plus size={12} />
                        </Button>
                    </div>
                    <SwaggerDnd copilotId={copilotId}>
                        <ActionsList disabled={isBlocksEmpty} />
                    </SwaggerDnd>
                    <div className='px-4 py-3 border-t bg-accent'>
                        <h2 className='text-xs text-start font-medium'>
                            <AlertCircle size={14} className='inline-block me-0.5' /> Drag & drop any swagger file for bulk actions import
                        </h2>
                    </div>
                </aside>
                <AddActionDrawer />
                <div className='flex-1 relative h-full overflow-clip' ref={reactFlowWrapper}>
                    {
                        isBlocksEmpty && <div data-container='Empty block add button' className='absolute inset-0 z-50 flex-center bg-secondary p-4'>
                            <div className='space-y-2'>
                                <p className='text-base text-center font-medium'>
                                    Start building your flow actions/steps
                                </p>
                                <div className='px-4 flex items-center gap-3'>
                                    <Button size='sm' onClick={() => insertEmptyBlockAfter()}>
                                        I'll do it myself (recommended)
                                        <Plus className='ms-1.5 size-4' />
                                    </Button>
                                    <span className='text-base font-semibold'>/OR/</span>
                                    <MagicAction defaultValue={description ?? ''} />
                                </div>
                            </div>
                        </div>
                    }

                    <ReactFlow
                        nodeOrigin={[0.5, 0]}
                        fitView
                        ref={reactFlowWrapper}
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
                        onConnect={onConnect}
                        onConnectStart={onConnectStart}
                        onConnectEnd={onConnectEnd}
                        maxZoom={1}
                        minZoom={1}
                        nodeTypes={nodeTypes}
                        nodes={nodes}
                        onNodesChange={onNodeChange}
                        className='w-full h-full'>
                        <Controls position='bottom-right' />
                        <Background color="var(--accent-foreground)" />
                    </ReactFlow>
                </div>
            </div>
        </DndContext>

    )
}