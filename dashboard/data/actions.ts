import axios from "axios";
import { baseUrl } from "./base-url";
import { apiMethods } from "@/types/utils";
import type { ActionWithModifiedParameters } from "@/components/domain/action-form/ActionForm";

const instance = axios.create({
    baseURL: baseUrl + "/backend/actions",
});

export type PayloadType = {
    parameters: {
        description: string;
        in: string;
        name: string;
        required: boolean;
        schema: {
            type: string;
        }
    }[];
    request_body: any;
}

export type ActionResponseType = {
    api_endpoint: string;
    bot_id: string;
    id: string;
    name: string;
    description: string;
    request_type: typeof apiMethods[number];
    operation_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    status: string;
    payload?: PayloadType;
}
export type ActionWithModifiedParametersResponse = ActionWithModifiedParameters & {
    id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}
// {{backend_base}}/actions/bot/:chatbot_id
export function getActionsByBotId(bot_id: string) {
    return instance.get<ActionWithModifiedParametersResponse[]>(`/bot/${bot_id}`);
}

// http://localhost:8888/backend/actions/p/:action_id
export function getActionById(action_id: string) {
    return instance.get<ActionWithModifiedParametersResponse>(`/p/${action_id}`);
}

// {{backend_base}}/actions/bot/:bot_id
export function createActionByBotId(bot_id: string, data: ActionWithModifiedParameters) {
    return instance.post<ActionWithModifiedParametersResponse>(`/bot/${bot_id}`, data);
}

// {{backend_base}}/actions/bot/:bot_id/import-from-swagger
export function importActionsFromSwagger(bot_id: string, swagger: File) {
    const formData = new FormData();
    formData.append('file', swagger);
    return instance.put<{
        is_error: boolean;
        message: string;
    }>(`/bot/${bot_id}/import-from-swagger`, formData);
}
// {{backend_base}}/backend/actions/:action_id
export async function editActionById(bot_id: string, action_id: string, data: ActionWithModifiedParameters) {
    return (await instance.patch<ActionWithModifiedParametersResponse>(`/bot/${bot_id}/action/${action_id}`, data)).data;
}

// @action.route("/<string:action_id>", methods=["DELETE"])
export async function deleteActionById(action_id: string) {
    return await instance.delete<{ message: string }>(`/${action_id}`)
}
