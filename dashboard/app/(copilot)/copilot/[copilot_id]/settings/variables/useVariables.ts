import { getVariables } from "@/data/copilot";
import useSWR from "swr";

export function useVariables(copilot_id: string) {
    return useSWR(copilot_id + '/variables', async () => getVariables(copilot_id))
}