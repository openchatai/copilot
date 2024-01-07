import { createVariable, getVariablesByBotId } from "@/data/copilot";
import { useAsyncFn } from "react-use";
import useSWR from "swr";

export function useVariables(copilot_id: string) {
    const swr = useSWR(copilot_id + '/variables', async () => getVariablesByBotId(copilot_id));
    const [asyncStatus, createVar] = useAsyncFn(async (name: string, value: string) => {
        const { data, status } = await createVariable(copilot_id, name, value);
        if (data.message && status === 200) {
            swr.mutate()
        }
        return data
    })
    return [swr, createVar, asyncStatus] as const;
}