'use client';
import ReactFlow, { Background, Controls, Node, ReactFlowProvider, useNodesState } from 'reactflow';
import actionBlock from './ActionBlock';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddActionDrawer, useDrawerState } from './AddFlowSheet';
import { DragDropContext, Draggable, DropResult, Droppable } from 'react-beautiful-dnd';
import { useActions } from './actionsAtom';
import { ASIDE_DROPABLE_ID } from './consts';

const nodeTypes = {
    actionBlock
}

// aside actions are vergin actions that are not yet copied to the flow.
// they are used to drag and drop to the flow block to add them to the flow.
function AsideAction({ id, index, name }: {
    id: string,
    index: number,
    name: string
}) {
    return <Draggable
        key={id}
        draggableId={"ACTION-" + id.toString()}
        index={index}>
        {
            (provided) => (
                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className='w-full h-12 flex items-center justify-center'>
                    {name}
                </div>
            )
        }
    </Draggable>
}

function ActionsList() {
    const [actions] = useActions();
    const [, setDrawerState] = useDrawerState();

    return (
        <aside className='w-full max-w-xs h-full border-r bg-white overflow-hidden'>
            <div className='flex items-center justify-between p-4'>
                <h2>Actions</h2>
                <Button variant='ghost' size='fit' onClick={() => setDrawerState(true)}>
                    <Plus className='w-4 h-4' />
                </Button>
            </div>
            <div>
                <Droppable droppableId={ASIDE_DROPABLE_ID}>
                    {
                        (provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className='w-full h-full flex flex-col items-center justify-center nodrag nopan'>

                                {actions.map((action, index) => (
                                    <AsideAction key={action.id} id={action.id} index={index} name={action.name} />
                                ))}
                                {provided.placeholder}
                            </div>
                        )
                    }
                </Droppable>
            </div>
        </aside>
    )
}

const initialNodes: Node[] = [{
    type: 'actionBlock',
    id: 'action_id',
    position: { x: 150, y: 150 },
    data: {
        actions: []
    }
}]

export function FlowRenderer() {
    const [actions] = useActions();
    const [nodes, setNodes, onNodeChange] = useNodesState(initialNodes);


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

    return (
        <ReactFlowProvider>
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className='flex items-center justify-between w-full h-full overflow-hidden'>
                    <ActionsList />
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