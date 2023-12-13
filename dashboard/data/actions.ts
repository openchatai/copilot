import axios from "axios";
import { baseUrl } from "./base-url";
import { ActionType } from "@/components/domain/action-form/schema";
import { apiMethods } from "@/types/utils";

const instance = axios.create({
    baseURL: baseUrl + "/backend/actions",
});

export type ActionResponseType = {
    name: string;
    description: string;
    api_endpoint: string;
    request_type: typeof apiMethods[number];
    operation_id: string;
    id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    payload?: any;
}

// {{backend_base}}/actions/bot/:chatbot_id
export function getActionsByBotId(bot_id: string) {
    return instance.get<ActionResponseType[]>(`/bot/${bot_id}`);
}

// http://localhost:8888/backend/actions/p/:action_id
export function getActionById(action_id: string) {
    return instance.get<ActionResponseType>(`/p/${action_id}`);
}

// {{backend_base}}/actions/bot/:bot_id
export function createActionByBotId(bot_id: string, data: ActionType) {
    return instance.post<ActionResponseType>(`/bot/${bot_id}`, data);
}

// {{backend_base}}/actions/bot/:bot_id/import-from-swagger
export function importActionsFromSwagger(bot_id: string, swagger: File) {
    const formData = new FormData();
    formData.append('swagger', swagger);
    return instance.post<ActionResponseType[]>(`/bot/${bot_id}/import-from-swagger`, formData);
}