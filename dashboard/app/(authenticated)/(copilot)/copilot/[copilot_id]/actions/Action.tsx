import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { methodVariants } from "@/components/domain/MethodRenderer";
import { useRef } from "react";
import { Row } from "@tanstack/react-table";
import { Stack } from "@/components/ui/Stack";
import { ActionForm } from "@/components/domain/action-form/ActionForm";
import { ActionWithModifiedParametersResponse } from "@/data/actions";
import { useDeleteAction, useUpdateAction } from "@/hooks/useActions";
import { useCopilot } from "../../CopilotProvider";

export function Action({ getValue, original }: Row<ActionWithModifiedParametersResponse>) {
    const {
        id: copilotId
    } = useCopilot();
    const containerRef = useRef<HTMLDivElement>(null);

    const [
        state,
        updateAction
    ] = useUpdateAction(copilotId, original.id)
    const [
        deleteState,
        deleteIt
    ] = useDeleteAction(original.id, copilotId)
    return <Stack
        ref={containerRef}
        ic="start"
        gap={5}
        direction="column"
        className='bg-secondary p-3.5 rounded-lg overflow-hidden transition-all col-span-full lg:col-span-6 xl:col-span-4 border border-primary/20 shadow-sm'>
        <Stack ic="start" gap={10} id="some" direction="row">
            <div className='text-sm font-semibold flex-1'>{getValue("name")}</div>
            {/* @ts-ignore */}
            <div className={methodVariants({ size: "xs", method: String(getValue("request_type")).toUpperCase() })}>{getValue("request_type")}</div>
        </Stack>
        <div className='text-xs text-gray-500'>{getValue("description")}</div>
        <Stack
            direction="row"
            js="between">
            <div>
                <span className="text-secondary-foreground font-medium text-xs text-start whitespace-nowrap">
                    Created {" "}{getValue("created_at")}
                </span>
            </div>
            <Stack className="mt-auto gap-1" js="end">
                <AlertDialog>
                    <AlertDialogContent className="overflow-hidden">
                    </AlertDialogContent>
                    <AlertDialogTrigger asChild>
                        <Button size='fit'>
                            <Settings2 size={15} />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Edit Action</AlertDialogTitle>
                        </AlertDialogHeader>
                        {/*  */}
                        <ActionForm defaultValues={original}
                            className="overflow-auto no-scrollbar"
                            onSubmit={async (data) => {
                                await updateAction(data)
                            }}
                            footer={() => <AlertDialogFooter className="my-4">
                                <AlertDialogCancel asChild>
                                    <Button variant='secondary'>
                                        Cancel
                                    </Button>
                                </AlertDialogCancel>
                                <Button variant='default' type="submit" loading={state.loading}>
                                    Save
                                </Button>
                            </AlertDialogFooter>
                            }
                        />
                        {/*  */}

                    </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Action</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this action? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel asChild>
                                <Button variant='secondary' size='fit'>
                                    Cancel
                                </Button>
                            </AlertDialogCancel>
                            <AlertDialogAction asChild>
                                <Button variant='destructive' size='fit' onClick={deleteIt} loading={deleteState.loading}>
                                    Delete
                                </Button>
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    <AlertDialogTrigger asChild>
                        <Button variant='destructiveOutline' size='fit'>
                            <Trash2 size={15} />
                        </Button>
                    </AlertDialogTrigger>
                </AlertDialog>
            </Stack>
        </Stack>
    </Stack>
}
