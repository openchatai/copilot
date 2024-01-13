import type { ActionWithModifiedParameters } from "@/components/domain/action-form/ActionForm";
import { getActionsByBotId, createActionByBotId } from "@/data/actions";
import { useAsyncFn } from "react-use";
import useSWR, { mutate } from "swr";

const revalidateActions = (copilot_id: string) => mutate(copilot_id + "/actions")

function useListActions(copilot_id: string) {
    return useSWR(copilot_id ? (copilot_id + "/actions") : null, async () => (await getActionsByBotId(copilot_id)).data)
}

function useCreateAction(copilot_id: string) {
    async function createAction(data: ActionWithModifiedParameters) {
        const res = await createActionByBotId(copilot_id, data);
        if (typeof res.data.id === 'string') {
            revalidateActions(copilot_id);
        }
        return res;
    }
    const [state, createActionAsync] = useAsyncFn(createAction);
    return [
        state,
        createActionAsync,
    ] as const;
}

function useUpdateAction() {
    async function updateAction() {

    }
    const [state, updateActionAsync] = useAsyncFn(updateAction);
    return [
        state,
        updateActionAsync,
    ] as const;
}

function useDeleteAction() {
    async function deleteAction() {

    }
    const [state, deleteActionAsync] = useAsyncFn(deleteAction);
    return [
        state,
        deleteActionAsync,
    ] as const;
}
// @TODO: group all action related hooks in this file including (./useAddSwagger)
export {
    useListActions,
    useCreateAction,
    useUpdateAction,
    useDeleteAction,
}