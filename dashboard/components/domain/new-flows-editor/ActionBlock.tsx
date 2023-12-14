import React, { useEffect, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { Draggable, DraggableProvided, Droppable } from 'react-beautiful-dnd';
import { createPortal } from 'react-dom';
import { DraggingStyle } from 'react-beautiful-dnd'
import { ReactElement } from 'react';
import { BLOCK_ACTION_DRAGGABLE_ID_PREFIX } from './consts';
import { ActionResponseType } from '@/data/actions';
import { Action } from './ActionsList';
import _, { uniqueId } from 'lodash';
import { useController } from './Controller';
import { DebounceInput } from 'react-debounce-input';
import { BlockType } from './types/block';

// @patch for the transform issue;
export const useDraggableInPortal = () => {
    const element = useRef<HTMLDivElement>(document.createElement('div')).current

    useEffect(() => {
        if (element) {
            element.style.pointerEvents = 'none'
            element.style.position = 'absolute'
            element.style.inset = '0 0 0 0'
            element.style.zIndex = '9999'
            document.body.appendChild(element)
            return () => { document.body.removeChild(element) }
        }
    }, [element])

    return (render: (provided: DraggableProvided) => ReactElement) => (provided: DraggableProvided) => {
        const result = render(provided,)
        const style = provided.draggableProps.style as DraggingStyle
        if (style.position === 'fixed') {
            return createPortal(result, element)
        }
        return result
    }
}


type Props = NodeProps<BlockType>

function DraggableActionInsideActionBlock({ action, index, id }: { action: ActionResponseType, index: number, id: string }) {
    const draggableInPortal = useDraggableInPortal();
    return <Draggable key={id} draggableId={BLOCK_ACTION_DRAGGABLE_ID_PREFIX + id} index={index}>
        {draggableInPortal((provided) => <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className='w-full bg-white border shrink-0 border-gray-100 rounded-lg shadow-md'>
            <Action action={action} />
        </div>)}
    </Draggable>

}

function ActionBlock({ data: { actions, name }, id }: Props) {
    const { state, updateBlock } = useController();

    function updateBlockName(name: string) {
        _.throttle(() => {
            updateBlock(id, { name });
        }, 1000)
    }

    return (
        <>
            <Handle type="target" position={Position.Top} />
            <div className='min-w-[15rem] bg-white border transition-all nodrag overflow-hidden nopan p-2 rounded-lg h-auto flex flex-col'>
                <div className='mb-2 border-b p-2 shrink-0'>
                    <DebounceInput element='input' value={name} onChange={(ev) => {
                        updateBlockName(ev.target.value);
                    }} type="text" className='outline-none focus-within:bg-accent p-0.5 rounded text-sm' placeholder='Name' />
                </div>
                <Droppable droppableId={'BLOCK_DROPABLE|' + id}>
                    {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className='flex-1 min-h-0 nodrag nopan flex shrink-0 flex-col space-y-1 items-start justify-center'>
                            {
                                _.isEmpty(actions) ? <div className='text-sm text-gray-400 text-center p-4 w-full'>Drag and drop actions here</div> : actions.map((action, index) => {
                                    return <DraggableActionInsideActionBlock id={index.toString()} key={uniqueId('block_action_key')} action={action} index={index} />
                                })
                            }
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </div>
            <Handle type="source" position={Position.Bottom} />
        </>

    )
}
export default ActionBlock
