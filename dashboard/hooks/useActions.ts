import type { ActionWithModifiedParameters } from "@/components/domain/action-form/ActionForm";
import { toast } from "@/components/ui/use-toast";
import { getActionsByBotId, createActionByBotId, editActionById, deleteActionById } from "@/data/actions";
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
            toast({
                title: "Action created successfully",
                variant: "success"
            })
        }
        return res;
    }
    const [state, createActionAsync] = useAsyncFn(createAction);
    return [
        state,
        createActionAsync,
    ] as const;
}

function useUpdateAction(copilot_id: string, action_id: string) {
    async function updateAction(_: ActionWithModifiedParameters) {
        const data = await editActionById(copilot_id, action_id, _);
        if (data) {
            toast({
                title: "Action Updated Successfully",
                variant: "success"
            })
            revalidateActions(copilot_id);
        } else {
            toast({
                title: "Error occured",
                variant: "destructive"
            })
        }
    }
    const [state, updateActionAsync] = useAsyncFn(updateAction);
    return [
        state,
        updateActionAsync,
    ] as const;
}

function useDeleteAction(action_id: string, copilot_id?: string) {
    async function deleteAction() {
        const { data } = await deleteActionById(action_id);
        if (data) {
            toast({
                title: "Action Deleted Successfully",
                variant: "success"
            })
            copilot_id && revalidateActions(copilot_id);
        } else {
            toast({
                title: "Error occured",
                variant: "destructive"
            })
        }
        return data
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