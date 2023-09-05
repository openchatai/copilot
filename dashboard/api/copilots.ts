import axiosInstance from "utils/axiosInstance";
import * as v from 'valibot';

export const CopilotSchema = v.object({
    id: v.string(),
    name: v.string(),
    token: v.string(),
    website: v.string(),
    status: v.union([
        v.literal("draft"),
        v.literal("published"),
        v.literal("archived"),
    ]),
    prompt_message: v.string(),
    enhanced_privacy: v.boolean(),
    smart_sync: v.boolean(),
    created_at: v.date(),
    updated_at: v.date(),
    deleted_at: v.optional(v.date()),
    swagger_url: v.string(),
    is_premade_demo_template: v.boolean(),
})
export type Copilot = v.Output<typeof CopilotSchema>

type ValidatorResponse = {
    chatbot_id: string
    all_endpoints: {
        operationId: string
        type: string
        name: string
        description: string
        requestBody: any
        requestParameters: any
        responseBody: any
        path: string
    }[],
    validations: {
        endpoints_without_operation_id: any[]
        endpoints_without_description: any[]
        endpoints_without_name: any[]
        auth_type: any
    }
}
export async function getCopilots() {
    return axiosInstance.get<Copilot[] | []>("/copilots")
}

export async function getCopilot(id: string) {
    return axiosInstance.get<{ chatbot: Copilot }>(`/copilot/${id}`)
}

export async function deleteCopilot(id: string) {
    return axiosInstance.delete(`/copilot/${id}`)
}

export async function createCopilot({
    swagger_file,
}: {
    swagger_file: File
}) {
    const data = new FormData()
    data.append("swagger_file", swagger_file)
    return axiosInstance.post<{
        chatbot: Copilot
    }>("/copilot/swagger", data, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
}

export async function validateSwagger(bot_id: string) {
    return axiosInstance.get<ValidatorResponse>(`/copilot/${bot_id}/validator`)
}
export const demoCopilotSchema = v.object({
    swagger_url: v.string(),
    chatbot: v.partial(CopilotSchema)
})
export type DemoCopilot = v.Output<typeof demoCopilotSchema>

export async function createDemoCopilot() {
    return axiosInstance.get<DemoCopilot>("/copilot/swagger/pre-made")
}

export async function updateCopilot(id: string, copilot: Partial<Copilot>) {
    return axiosInstance.post<{
        chatbot: Copilot
    }>(`/copilot/${id}`, copilot)
}