import axios from "axios";
import { baseUrl } from "./base-url";
import { ActionResponseType } from "./actions";

const instance = axios.create({
    baseURL: baseUrl + "/backend/flows",
});

type Block = {
    actions: ActionResponseType[];
    name: string;
    next_on_success: string | null;
    order: number;
}

type Workflow = {
    name: string;
    description: string;
    blocks: Block[]
}
type Variable = {}
// {{backend_base}}/flows/bot/:bot_id
export function getWorkflowsByBotId(bot_id: string) {
    return instance.get<Workflow[]>(`/bot/${bot_id}`);
}
// {{backend_base}}/flows/bot/:bot_id/
export function createWorkflowByBotId(bot_id: string, data: Workflow) {
    return instance.post<Workflow>(`/bot/${bot_id}/`, data);
}
// {{backend_base}}/flows/:flow_id/
export function saveFlowById(id: string, data: Workflow) {
    return instance.put<Workflow>(`/${id}`, data);
}
// {{backend_base}}/flows/:flow_id/
export function getFlowById(id: string) {
    return instance.get<Workflow>(`/${id}`);
}
// {{backend_base}}/flows/3edb8533-411a-4557-bbeb-70a2caea5d52/variables
export function getFlowVariablesById(id: string) {
    return instance.get<Variable[]>(`/${id}/variables`);
}