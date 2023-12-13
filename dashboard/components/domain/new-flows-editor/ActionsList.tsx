import Loader from "@/components/ui/Loader";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ActionResponseType } from "@/data/actions";
import { cn } from "@/lib/utils";
import { PopoverArrow } from "@radix-ui/react-popover";
import _ from "lodash";
import { useState } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { useController } from "./Controller";
import { methodVariants } from "../MethodRenderer";
import { format } from "timeago.js";


function DropableAsideAction({ action, index }: { action: ActionResponseType, index: number }) {
    const [open, setOpen] = useState(false);
    return (
        <Draggable draggableId={"ACTION-" + action.id} index={index}>
            {
                (provided, snapshot) => {
                    const { isDragging } = snapshot;
                    return <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={cn('w-full', isDragging ? "bg-white shadow" : " !cursor-pointer")}>
                        <Popover open={open && !isDragging} onOpenChange={setOpen}>
                            <PopoverTrigger asChild className="data-[state=open]:!border-l-primary hover:bg-accent shrink-0 !border-transparent transition-colors border-l-2">
                                <div className="flex flex-col w-full px-4 py-2">
                                    <h3 className='text-sm font-semibold'>{action.name}</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium">
                                            Create {" "} {format(action.created_at)}
                                        </span>
                                        <span className={cn(methodVariants({ method: action.request_type }), 'shrink')}>
                                            {action.request_type}
                                        </span>
                                    </div>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent side="right" hidden={isDragging} asChild>
                                <div className="flex flex-col gap-2 text-start overflow-hidden">
                                    <PopoverArrow className="aspect-square w-3 h-2 fill-primary" />
                                    <div className="">
                                        <h3 className="text-sm font-semibold">{action.name}</h3>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-xs">{action.description}</p>
                                    </div>
                                    <ul className="text-xs space-y-2 overflow-hidden [&>li]:overflow-x-auto [&>li]:no-scrollbar">
                                        <li>
                                            <span className="font-medium">Request Type: </span><span>{action.request_type}</span>
                                        </li>
                                        <li>
                                            <span className="font-medium">Request URL: </span><code className="text-xs px-1 py-0.5 overflow-auto bg-accent-foreground max-w-full whitespace-nowrap select-text text-accent text-left text-white rounded">{action.api_endpoint}</code>
                                        </li>
                                        <li>
                                            <span className="font-medium">Operation Id: </span><code className="text-xs px-1 py-0.5 bg-accent-foreground select-text text-accent rounded">{action.operation_id}</code>
                                        </li>
                                    </ul>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                }
            }
        </Draggable>
    )
}
export const ASIDE_DROPABLE_ID = "BASE-ACTIONS";
export function ActionsList() {
    const { state: { actions } } = useController();
    return (
        <Droppable droppableId={ASIDE_DROPABLE_ID}>
            {
                (provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className='w-full shrink-0 divide-y flex overflow-y-hidden flex-col items-center justify-center'>
                        {
                            !actions ? <Loader /> : _.map(actions, (action, index) => <DropableAsideAction key={action.id} action={action} index={index} />)
                        }
                        {provided.placeholder}
                    </div>
                )
            }
        </Droppable>
    )
}
