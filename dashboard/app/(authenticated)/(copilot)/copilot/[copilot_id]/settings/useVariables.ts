import { createVariable, deleteVariableByKey, getVariablesByBotId, type VariableType } from "@/data/copilot";
import { useAsyncFn } from "react-use";
import { toast } from "sonner";
import useSWR from "swr";

export function useVariables(copilot_id: string) {
    const swr = useSWR(copilot_id + '/variables', async () => getVariablesByBotId(copilot_id));

    const [asyncCreateStatus, createVarAsync] = useAsyncFn(async (vars: VariableType[], mutate: boolean = true) => {
        const { data, status } = await createVariable(copilot_id, vars);
        if (data.message && status === 200) {
            mutate && swr.mutate()
            toast.success(data.message)
        }else{
            toast.error("Error occured")
        }
        return data
    })

    const [
        asyncDeleteStatus,
        deleteVarAsync
    ] = useAsyncFn(async (key: string) => {
        const { data, status } = await deleteVariableByKey(copilot_id, key);
        if (data.message && status === 200) {
            swr.mutate()
            toast.success(data.message)
        }else{
            toast.error("Error occured")
        }
        return data
    })

    return {
        swr,
        createVarAsync,
        asyncCreateStatus,
        asyncDeleteStatus,
        deleteVarAsync
    }
}