'use client'
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetClose, SheetFooter } from "@/components/ui/sheet";
import { atom, useAtom } from "jotai";
import { ActionForm, ActionWithModifiedParameters } from "../action-form/ActionForm";
import { useCreateAction } from "@/hooks/useActions";
import { useCopilot } from "@/app/(authenticated)/(copilot)/copilot/CopilotProvider";

const addActionFormState = atom(false);
export const useActionFormState = () => useAtom(addActionFormState);


export function AddActionDrawer() {
    const [drawerState, setDrawerState] = useActionFormState();
    const { id: copilotId } = useCopilot();
    const [state, createAction] = useCreateAction(copilotId);
    async function handleOnSubmit(values: ActionWithModifiedParameters) {
        const { data } = await createAction(values);
        if (data.id) {
            setDrawerState(false);
        }
    }

    return (
        <Sheet open={drawerState} onOpenChange={setDrawerState}>
            <SheetContent className="overflow-auto pb-0">
                <SheetHeader className="border-b pb-2 w-full">
                    <SheetTitle>
                        Define API action
                    </SheetTitle>
                    <SheetDescription>
                        Crate a new action for your flow
                    </SheetDescription>
                </SheetHeader>
                <ActionForm
                    className="w-full flex-1 space-y-3 py-5 h-fit"
                    onSubmit={handleOnSubmit}
                    footer={
                        () => (
                            <SheetFooter className="sticky w-full py-3 bg-white bottom-0 inset-x-0">
                                <Button loading={state.loading} type="submit">Create</Button>
                                <SheetClose asChild>
                                    <Button variant='ghost'>Cancel</Button>
                                </SheetClose>
                            </SheetFooter>
                        )
                    } />
            </SheetContent>
        </Sheet>

    )
}
