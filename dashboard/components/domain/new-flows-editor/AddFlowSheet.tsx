'use client'
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { atom, useAtom } from "jotai";
import { ActionForm } from "./ActionForm";

const drawerStateAtom = atom(false);
export const useDrawerState = () => useAtom(drawerStateAtom);


export function AddActionDrawer() {
    const [drawerState, setDrawerState] = useDrawerState();

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
                <div className="w-full flex-1">
                    <ActionForm />
                </div>
                
                <SheetFooter>
                    <Button>Create</Button>
                    <Button variant='ghost' onClick={() => setDrawerState(false)}>Cancel</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>

    )
}
