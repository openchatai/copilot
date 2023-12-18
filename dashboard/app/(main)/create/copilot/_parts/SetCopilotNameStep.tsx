'use client';
import { CopilotType, createCopilot } from "@/data/copilot";
import { useWizard } from "react-use-wizard";
import { useCreateCopilot } from "./CreateCopilotProvider";
import { useAsyncFn } from "react-use";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { DebounceInput } from "react-debounce-input";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SetCopilotName() {
    const { state: { copilot_name, createdCopilot }, dispatch } = useCreateCopilot();
    const { nextStep } = useWizard();
    const [value, $createCopilot] = useAsyncFn(createCopilot);

    const setCopilot = (copilot: CopilotType) => {
        dispatch({ type: "SET_COPILOT", payload: copilot });
    };

    async function handleCreateCopilot() {
        if (!copilot_name) {
            toast({
                title: "Please enter copilot name",
                description: "Please enter copilot name",
                variant: "destructive",
            });
            return;
        }
        if (createdCopilot) {
            nextStep();
            return;
        }
        const response = await $createCopilot(copilot_name);
        if (response?.data?.id) {
            setCopilot(response.data);
            nextStep();
        } else {
            toast({
                title: "Something went wrong",
                description: "Please try again later",
                variant: "destructive",
            });
        }
    }
    return <div>
        <h2 className="mb-6 text-3xl font-bold text-accent-foreground">
            Let's give your copilot a name 🤖
        </h2>
        <div className="px-2 my-4">
            <Label htmlFor="copilotName" className="font-semibold">
                Copilot Name
            </Label>
            <DebounceInput
                id="copilotName"
                debounceTimeout={500}
                // @ts-ignore
                element={Input}
                disabled={!!createdCopilot}
                className="mt-1"
                value={copilot_name}
                onChange={(ev) => dispatch({ type: "CHANGE_NAME", payload: ev.target.value })} />
        </div>
        <div className="flex items-center justify-end">
            <Button
                onClick={handleCreateCopilot}
                disabled={!copilot_name}
                loading={value.loading}>Let's do it!</Button>
        </div>
    </div>
}