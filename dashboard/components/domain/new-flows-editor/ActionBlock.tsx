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
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
            return () => {
                // check if the element was removed by something else
                if (element.parentElement) {
                    element.parentElement.removeChild(element)
                }
            }
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
        {draggableInPortal((provided) => <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className='w-full bg-white shrink-0 border-2 border-accent-foreground border-dotted rounded-md'>
            <Action action={action} />
        </div>)}
    </Draggable>
}

function UpdateBlock({ id, name }: { id: string, name: string }) {
    const { updateBlock } = useController();

    function updateBlockName(name: string) {
        updateBlock(id, { name });
    }
    return <DebounceInput required element='input' debounceTimeout={1000 * 2} value={name} onChange={(ev) => {
        updateBlockName(ev.target.value);
    }} type="text" className='outline-none flex-1 w-full text-white font-medium p-0.5 rounded text-sm bg-transparent placeholder:text-white' placeholder='Name' />
}
function DeleteBlockBtn({ id }: { id: string }) {
    const { deleteBlockById } = useController();
    return <button onClick={() => {
        confirm('Are you sure you want to delete this block?') && deleteBlockById(id);
    }} className='p-1 rounded text-white transition-colors'>
        <Trash2 size={18} />
    </button>
}
function BlockHandle({ type, position, className }: { type: 'source' | 'target', position: Position, className?: string }) {
    return <Handle type={type} position={position} className={cn("!bg-white", className)} style={{ width: '10px', height: "10px" }} />
}

function ActionBlock({ data: { actions, name }, id, selected }: Props) {

    return (
        <React.Fragment key={id}>
            <BlockHandle type="target" position={Position.Right} />
            <div className={cn('w-[20rem] bg-white border transition-all nodrag overflow-hidden nopan rounded-lg h-auto flex flex-col')}>
                <div className={cn('mb-2 p-2 flex items-center justify-between shrink-0 transition-colors', !selected ? "bg-[#607D8B]" : "bg-[#607D8B]/80")}>
                    <UpdateBlock id={id} name={name} />
                    <div className='space-x-2'>
                        <DeleteBlockBtn id={id} />
                    </div>
                </div>
                <Droppable droppableId={'BLOCK_DROPABLE|' + id}>
                    {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className='flex-1 p-2 min-h-0 w-full transition-all nodrag nopan flex shrink-0 flex-col space-y-1 items-start justify-center'>
                            {
                                _.isEmpty(actions) ? <div className='text-sm text-gray-400 text-center p-4 w-full'>Drag and drop actions here</div> : actions.map((action, index) => {
                                    return <DraggableActionInsideActionBlock id={action.id} key={uniqueId('block_action_key')} action={action} index={index} />
                                })
                            }
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </div>
            <BlockHandle type="source" position={Position.Left} />
        </React.Fragment>

    )
}
export default ActionBlock
