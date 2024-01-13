import axios from "axios";
import { baseUrl } from "./base-url";
import { BlockType } from "@/components/domain/new-flows-editor/types/block";
import { ActionWithModifiedParametersResponse } from "./actions";
const instance = axios.create({
    baseURL: baseUrl + "/backend/flows",
});
type Flow = {
    name: string;
    description: string;
    blocks: any[];
}
type FlowResponse = {
    flow_id: string;
    last_saved_at: string;
    name: string;
    description: string;
    blocks: BlockType[];
}
// {{backend_base}}/backend/flows/bot/:bot_id/
export async function createFlowByBotId(copilot_id: string, flow: Partial<Flow>) {
    return await instance.post<{
        flow_id: string;
        last_saved_at: string;
        name: string;
        description: string;
        blocks: any[];
    }>(`/bot/${copilot_id}/`, flow);
}
// {{backend_base}}/flows/bot/:bot_id
export async function getFlowsByBotId(copilot_id: string) {
    return await instance.get<{
        flow_id: string;
        last_saved_at: string;
        name: string;
        description: string;
        blocks: any[];
    }[]>(`/bot/${copilot_id}`);
}
// {{backend_base}}/flows/:flow_id/
export async function getFlowById(flow_id: string) {
    return await instance.get<FlowResponse>(`/${flow_id}`);
}
// {{backend_base}}/flows/:flow_id/
export async function syncWorkflowById(flow_id: string, flow: Partial<Flow>) {
    if (!flow_id) {
        throw new Error("flow_id is required");
    }
    return await instance.put<{
        flow_id: string;
        last_saved_at: string;
        name: string;
        description: string;
        blocks: any[];
    }>(`/${flow_id}/`, flow);
}
// {{backend_base}}/flows/dynamic/bot/:bot_id
export async function createDynamicFlowsByBotId(copilot_id: string, prompt: string) {
    return await instance.post<{ actions: ActionWithModifiedParametersResponse[] }>(`/dynamic/bot/${copilot_id}`, { text: prompt });
}