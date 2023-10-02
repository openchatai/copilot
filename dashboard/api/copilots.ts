import axiosInstance from "utils/axiosInstance";
export type Copilot = {
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
  deleted_at: string;
  swagger_url: string;
  is_premade_demo_template: boolean;
};
type Endpoint = {
  operationId: string;
  type: string;
  name: string;
  description: string;
  requestBody: any;
  requestParameters: any;
  responseBody: any;
  path: string;
};

type ValidatorResponse = {
  chatbot_id: string;
  all_endpoints: Endpoint[];
  validations: {
    endpoints_without_operation_id: Endpoint[];
    endpoints_without_description: Endpoint[];
    endpoints_without_name: Endpoint[];
    auth_type: any;
  };
};
export async function getCopilots() {
  return axiosInstance.get<Copilot[] | []>("/copilots");
}

export async function getCopilot(id: string) {
  if (!id) throw new Error("Copilot id is required");
  return axiosInstance.get<{ chatbot: Copilot }>(`/copilot/${id}`);
}

export async function deleteCopilot(id: string) {
  return axiosInstance.delete(`/copilot/${id}`);
}

export async function createCopilot({ swagger_file }: { swagger_file: File }) {
  const data = new FormData();
  data.append("swagger_file", swagger_file);
  return axiosInstance.post<{
    chatbot: Copilot;
  }>("/copilot/swagger", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function validateSwagger(bot_id: string) {
  return axiosInstance.get<ValidatorResponse>(`/copilot/${bot_id}/validator`);
}

export type DemoCopilot = {
  swagger_url: string;
  chatbot: Copilot;
};

export async function createDemoCopilot() {
  return axiosInstance.get<DemoCopilot>("/copilot/swagger/pre-made");
}

export async function updateCopilot(id: string, copilot: Partial<Copilot>) {
  return axiosInstance.post<{
    chatbot: Copilot;
  }>(`/copilot/${id}`, copilot);
}
