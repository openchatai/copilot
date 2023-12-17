'use client'
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { atom, useAtom } from "jotai";
import { ActionForm } from "../action-form/ActionForm";
import { ActionType } from "../action-form/schema";
import { createActionByBotId as createActionPromiseByBotId } from "@/data/actions";
import { useCopilot } from "@/app/(copilot)/copilot/_context/CopilotProvider";
import { useAsyncFn } from 'react-use';
import { revalidateActions } from "./Controller";

const addActionFormState = atom(false);
export const useActionFormState = () => useAtom(addActionFormState);


export function AddActionDrawer() {
    const [drawerState, setDrawerState] = useActionFormState();
    const { id: copilotId } = useCopilot();
    const [state, createActionByBotId] = useAsyncFn(createActionPromiseByBotId);
    async function handleOnSubmit(values: ActionType) {
        const { data } = await createActionByBotId(copilotId, values);
        if (data.id) {
            revalidateActions(copilotId);
            setDrawerState(false);
        }
    }

    return (
        <Sheet open={drawerState} onOpenChange={setDrawerState}>
            <SheetContent className="flex flex-col items-start p-0 justify-between sm:max-w-lg w-full [&>div]:p-6">
                <SheetHeader className="border-b w-full">
                    <SheetTitle>
                        Define API action
                    </SheetTitle>
                    <SheetDescription>
                        Crate a new action for your flow
                    </SheetDescription>
                </SheetHeader>
                <div className="w-full flex-1 overflow-auto">
                    <ActionForm onSubmit={handleOnSubmit}
                        className="flex flex-col"
                        footer={
                            (form) => (<div className="space-x-2 mt-4 sticky bottom-2 bg-white z-10 py-5">
                                <Button disabled={!form.formState.isValid} loading={state.loading} type="submit">Create</Button>
                                <Button variant='ghost' onClick={() => setDrawerState(false)}>Cancel</Button>
                            </div>)
                        } />
                </div>
            </SheetContent>
        </Sheet>

    )
}
