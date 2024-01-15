import React, { useMemo } from 'react';
import { Handle, Position, useNodes } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { ActionWithModifiedParametersResponse } from '@/data/actions';
import { Action } from './ActionsList';
import _, { uniqueId } from 'lodash';
import { SelectedActionPosition, useController } from './Controller';
import { DebounceInput } from 'react-debounce-input';
import { BlockType } from './types/block';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useDraggableInPortal } from './useDraginPortal';
import { getStyle } from './utils';
import { useInView } from 'framer-motion';
export const BLOCK_ACTION_DRAGGABLE_ID_PREFIX = 'block-action-draggable|';

type Props = NodeProps<BlockType>

function DraggableActionInsideActionBlock({ action, index, id, position }: { action: ActionWithModifiedParametersResponse, index: number, id: string, position: SelectedActionPosition }) {
    const draggableInPortal = useDraggableInPortal();
    const { selectedActions } = useController();
    const isSelected = selectedActions.isSelected(position);

    return <Draggable key={id} draggableId={BLOCK_ACTION_DRAGGABLE_ID_PREFIX + id} index={index}>
        {draggableInPortal((provided, snapshot) =>
            <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={getStyle(provided.draggableProps.style, snapshot)}
                className={cn('w-full shrink-0 border border-dotted rounded-md transition-colors', isSelected ? 'border-primary/50 bg-accent' : 'border-accent bg-white')}>
                <div
                    className='contents cursor-pointer'
                    onClickCapture={() => selectedActions.toggleSelectAction(position)}>
                    <Action action={action} />
                </div>
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
    const containerRef = React.useRef<HTMLDivElement>(null);
    const inView = useInView(containerRef, { amount: "all" });
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
                ref={containerRef}
                data-next-on-success={next_on_success ?? "is-last-one"}
                data-is-last={isLast} data-is-first={isFirst}
                className={cn('w-[20rem] bg-white border transition-all overflow-hidden rounded-lg h-auto flex flex-col')}>
                <div className={cn('mb-2 p-2 flex items-center justify-between shrink-0 transition-colors', !selected ? "bg-[#607D8B]" : "bg-[#607D8B]/80")}>
                    <UpdateBlock id={id} name={name} />
                    <div className='space-x-2'>
                        <DeleteBlockBtn id={id} />
                    </div>
                </div>
                <Droppable
                    isDropDisabled={!inView}
                    droppableId={'BLOCK_DROPABLE|' + id}>
                    {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className='flex-1 isolate p-2 w-full transition-all nodrag nopan flex shrink-0 flex-col space-y-1 items-start justify-center'>
                            {
                                _.isEmpty(actions) ? <div className='text-sm text-gray-400 text-center p-4 w-full'>Drag and drop actions here</div> : actions.map((action, index) => (
                                    <DraggableActionInsideActionBlock position={`${id}.${action.id}`} id={action.id} key={uniqueId('block_action_key')} action={action} index={index} />)
                                )
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
