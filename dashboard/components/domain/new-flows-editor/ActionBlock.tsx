import React, { useEffect, useMemo, useRef } from 'react';
import { Handle, Position, useNodes } from 'reactflow';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

// @patch for the transform issue;
export const useDraggableInPortal = () => {
    const element = useRef<HTMLDivElement>(document.createElement('div')).current

    useEffect(() => {
        if (element) {
            element.style.pointerEvents = 'none'
            element.style.isolation = 'isolate'
            element.style.position = 'absolute'
            element.style.inset = '0'
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
        {draggableInPortal((provided) => <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className='w-full bg-white shrink-0 z-50 border-2 border-accent-foreground border-dotted rounded-md'>
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
    return <AlertDialog>
        <AlertDialogTrigger asChild >
            <button className='p-1 rounded text-white transition-colors'>
                <Trash2 size={18} />
            </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>
                    Are you sure ?
                </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction asChild>
                    <Button variant='destructive' onClick={() => {
                        deleteBlockById(id);
                    }}>
                        Yes,Delete it
                    </Button>
                </AlertDialogAction>
                <AlertDialogCancel asChild>
                    <Button variant='secondary'>
                        Nope
                    </Button>
                </AlertDialogCancel>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
}

function BlockHandle({ type, position, className }: { type: 'source' | 'target', position: Position, className?: string }) {
    return <Handle type={type} position={position} className={cn("!bg-primary !border-accent-foreground", className)} style={{ width: '10px', height: "10px" }} />
}

function ActionBlock({ data: { actions, name, next_on_success }, id, selected }: Props) {
    const nodes = useNodes();
    const { isFirst, isLast } = useMemo(() => {
        const index = _.findIndex(nodes, { id });
        return {
            isFirst: index === 0,
            isLast: index === nodes.length - 1
        }
    }, [nodes, id])
    return (
        <React.Fragment key={id}>

            <BlockHandle type='target' position={Position.Left} />
            <BlockHandle type='source' position={Position.Right} />
            <div data-block-id={id}
                data-next-on-success={next_on_success ?? "is-last-one"}
                data-is-last={isLast} data-is-first={isFirst}
                className={cn('w-[20rem] bg-white border transition-all overflow-hidden rounded-lg h-auto flex flex-col')}>
                <div className={cn('mb-2 p-2 flex items-center justify-between shrink-0 transition-colors', !selected ? "bg-[#607D8B]" : "bg-[#607D8B]/80")}>
                    <UpdateBlock id={id} name={name} />
                    <div className='space-x-2'>
                        <DeleteBlockBtn id={id} />
                    </div>
                </div>
                <Droppable droppableId={'BLOCK_DROPABLE|' + id}>
                    {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className='flex-1 isolate p-2 min-h-0 w-full transition-all nodrag nopan flex shrink-0 flex-col space-y-1 items-start justify-center'>
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
        </React.Fragment>

    )
}
export default ActionBlock
