import Loader from "@/components/ui/Loader";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ActionResponseType } from "@/data/actions";
import { cn } from "@/lib/utils";
import { PopoverArrow } from "@radix-ui/react-popover";
import _, { uniqueId } from "lodash";
import React, { useState } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { useController } from "./Controller";
import { methodVariants } from "../MethodRenderer";
import { format } from "timeago.js";
import { EmptyBlock } from "../EmptyBlock";

export function Action({ action }: { action: ActionResponseType }) {
    return <div className="flex flex-col gap-1 w-full px-4 shrink-0 transition-all py-2 data-[state=open]:!border-l-primary hover:bg-accent !border-transparent border-l-2">
        <h3 className='text-sm font-semibold'>{action.name}</h3>
        <div className="flex items-center justify-between">
            <span className="text-xs font-medium">
                Created {" "} {format(action.created_at)}
            </span>
            <span className={cn(methodVariants({ method: action.request_type }), 'shrink')}>
                {action.request_type}
            </span>
        </div>
    </div>
}

function DropableAsideAction({ action, index }: { action: ActionResponseType, index: number }) {
    const [open, setOpen] = useState(false);

    return (
        <Draggable draggableId={"ACTION|" + action.id} index={index} disableInteractiveElementBlocking>
            {
                (provided, snapshot) => {
                    const { isDragging } = snapshot;

                    return <React.Fragment>
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="w-full transition-all">
                            <Popover open={open && !isDragging} onOpenChange={setOpen}>

                                <PopoverTrigger asChild>
                                    <div className={cn('w-full bg-white', isDragging ? "shadow" : " !cursor-pointer")}>
                                        <Action action={action} />
                                    </div>
                                </PopoverTrigger>

                                <PopoverContent side="right" hidden={isDragging} asChild>
                                    <div className="flex flex-col gap-2 text-start overflow-hidden backdrop-blur-sm shadow-none bg-opacity-25">
                                        <PopoverArrow className="aspect-square w-3 h-2 fill-primary" />
                                        <div className="">
                                            <h3 className="text-sm font-semibold">{action.name}</h3>
                                            <p className="text-xs">{action.description}</p>
                                        </div>
                                        <ul className="text-xs space-y-1.5 overflow-x-clip [&>li]:overflow-x-auto [&>li]:py-0.5 [&>li]:no-scrollbar">
                                            <li>
                                                <span className="font-medium">Request Type: </span><span>{action.request_type}</span>
                                            </li>
                                            <li>
                                                <span className="font-medium">Request URL: </span><code className="text-xs px-1 py-0.5 bg-black max-w-full whitespace-nowrap select-text text-accent text-left text-white rounded">{action.api_endpoint}</code>
                                            </li>
                                            <li>
                                                <span className="font-medium">Operation Id: </span><code className="text-xs px-1 py-0.5 bg-black select-text text-accent rounded">{action.operation_id}</code>
                                            </li>
                                        </ul>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        {
                            isDragging && <div className="w-full" style={{ transform: 'none !important' }}>
                                <Action action={action} />
                            </div>
                        }
                    </React.Fragment>
                }
            }
        </Draggable>
    )
}
export const ASIDE_DROPABLE_ID = "BASE-ACTIONS";

export function ActionsList({ disabled }: { disabled?: boolean }) {
    const { state: { actions } } = useController();

    return (
        _.isEmpty(actions) ? <EmptyBlock>
            <div className="text-sm text-accent-foreground text-center w-full mt-3.5">
                No actions found <br /> you can create a new one from above or <br /> drag and drop a swagger file here. <br /> <br />
            </div>

        </EmptyBlock> : <Droppable isDropDisabled={disabled} droppableId={ASIDE_DROPABLE_ID} mode="standard">
            {
                (provided) => {
                    return <div ref={provided.innerRef} {...provided.droppableProps} className='w-full shrink-0 divide-y flex overflow-y-hidden min-h-full flex-col items-start justify-start'>
                        {
                            !actions ? <Loader /> : _.map(actions, (action, index) => <DropableAsideAction key={uniqueId('key')} action={action} index={index} />)
                        }
                        {provided.placeholder}
                    </div>
                }
            }
        </Droppable>
    )
}
