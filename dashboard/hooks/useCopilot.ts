import { CopilotType, deleteCopilot, getCopilot, updateCopilot } from "@/data/copilot";
import { useParams } from "next/navigation";
import { useAsyncFn } from "react-use";
import useSWR, { mutate } from "swr";

export function useCopilot() {
    const { copilot_id } = useParams();
    const copilotData = useSWR(copilot_id, getCopilot);

    async function updateCopilotAsync(copilot: Partial<CopilotType>) {
        if (!copilot_id) throw new Error("Copilot id is required");
        const copilotId = copilot_id as string;
        return await updateCopilot(copilotId, copilot).finally(copilotData.mutate);
    }

    async function deleteCopilotAsync() {
        if (!copilot_id) throw new Error("Copilot id is required");
        const copilotId = copilot_id as string;
        deleteCopilot(copilotId).finally(() => mutate('copilots'));
    }

    const [state, update] = useAsyncFn(updateCopilotAsync);
    const [stateDelete, deleteCopilot$] = useAsyncFn(deleteCopilotAsync);

    return { copilotData, updateCopilot: update, deleteCopilot: deleteCopilot$, };
}