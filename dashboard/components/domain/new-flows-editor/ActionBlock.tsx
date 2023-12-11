import React, { useEffect, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { Draggable, DraggableProvided, Droppable } from 'react-beautiful-dnd';
import { Action } from './actionsAtom';
import { createPortal } from 'react-dom';
import { DraggingStyle } from 'react-beautiful-dnd'
import { ReactElement } from 'react';
import { BLOCK_ACTION_DRAGGABLE_ID_PREFIX } from './consts';

// @patch for the transform issue;
export const useDraggableInPortal = () => {
    const element = useRef<HTMLDivElement>(document.createElement('div')).current

    useEffect(() => {
        if (element) {
            element.style.pointerEvents = 'none'
            element.style.position = 'absolute'
            element.style.height = '100%'
            element.style.width = '100%'
            element.style.top = '0'

            document.body.appendChild(element)

            return () => {
                document.body.removeChild(element)
            }
        }
    }, [element])

    return (render: (provided: DraggableProvided) => ReactElement) => (provided: DraggableProvided) => {
        const result = render(provided)
        const style = provided.draggableProps.style as DraggingStyle
        if (style.position === 'fixed') {
            return createPortal(result, element)
        }
        return result
    }
}


type Props = NodeProps<{
    actions: Action[]
}>

function DraggableActionInsideActionBlock({ action, index, id }: { action: Action, index: number, id: string }) {
    const draggableInPortal = useDraggableInPortal();
    return <Draggable key={id} draggableId={BLOCK_ACTION_DRAGGABLE_ID_PREFIX + id} index={index}>
        {draggableInPortal((provided) => <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className='w-full bg-white border border-gray-100 rounded-lg shadow-md mb-2'>
            {action.name}
        </div>)}
    </Draggable>

}

function ActionBlock({ data: { actions }, id }: Props) {
    return (
        <>
            <Handle type="target" position={Position.Top} />
            <Droppable droppableId={'BLOCK_DROPABLE-' + id}>
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className='w-full h-full min-w-[5rem] min-h-[2rem] flex flex-col items-center justify-center nodrag nopan bg-white'>
                        {actions.map((action, index) => {
                            return <DraggableActionInsideActionBlock id={index.toString()} key={'block_action_' + action.id} action={action} index={index} />
                        })}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
            <Handle type="source" position={Position.Bottom} />
        </>

    )
}
export default ActionBlock
