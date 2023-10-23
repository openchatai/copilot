import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8888/backend/api",
});

export type CopilotType = {
  id: string;
  name: string;
  token: string;
  website: string;
  status: "draft" | "published" | "archived";
  prompt_message: string;
  enhanced_privacy: boolean;
  smart_sync: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: Date;
  swagger_url: string;
  is_premade_demo_template: boolean;
};
export type EndpointType = {
  operationId: string;
  type: string;
  name: string;
  description: string;
  requestBody: any;
  requestParameters: any;
  responseBody: any;
  path: string;
};
export type ValidatorResponseType = {
  chatbot_id: string;
  all_endpoints: EndpointType[];
  validations: {
    endpoints_without_operation_id: EndpointType[];
    endpoints_without_description: EndpointType[];
    endpoints_without_name: EndpointType[];
    auth_type: any;
  };
};

export async function listCopilots() {
  return await instance.get<CopilotType[]>("/copilots");
}

export async function getCopilot(id: string) {
  if (!id) throw new Error("Copilot id is required");
  return await instance.get<{ chatbot: CopilotType }>(`/copilot/${id}`);
}

export async function deleteCopilot(id: string) {
  if (!id) throw new Error("Copilot id is required");
  return instance.delete(`/copilot/${id}`);
}

export async function updateCopilot(id: string, copilot: Partial<CopilotType>) {
  return instance.post<{
    chatbot: CopilotType;
  }>(`/copilot/${id}`, copilot);
}
export async function validateSwagger(bot_id: string) {
  if (!bot_id) throw new Error("Bot id is required");
  return instance.get<ValidatorResponseType>(`/copilot/${bot_id}/validator`);
}

export async function createCopilot({ swagger_file }: { swagger_file: File }) {
  const data = new FormData();
  data.append("swagger_file", swagger_file);
  return instance.post<{
    chatbot: CopilotType;
  }>("/copilot/swagger", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

// premade Templates

// http://localhost:8888/backend/api/copilot/swagger/pre-made
export type PetStoreCopilotType = {
  swagger_url: string;
  chatbot: CopilotType;
};

export async function createPetstoreTemplate() {
  return await instance.get<PetStoreCopilotType>(`/copilot/swagger/pre-made`);
}
