import axios from "axios";
import { baseUrl } from "./base-url";

const instance = axios.create({
  baseURL: baseUrl + "/backend/copilot",
});

export type CopilotType = {
  created_at: string;
  deleted_at: null | string;
  enhanced_privacy: boolean;
  id: string;
  name: string;
  prompt_message: string;
  smart_sync: boolean;
  status: "draft" | "live"
  swagger_url: string;
  token: string;
  updated_at: string;
  website: string;
};

export async function listCopilots() {
  return await instance.get<CopilotType[]>("/");
}

export async function getCopilot(id: string) {
  if (!id) throw new Error("Copilot id is required");
  return await instance.get<{ chatbot: CopilotType }>(`/${id}`);
}

// http://localhost:8888/backend/api/copilot/:id
export async function deleteCopilot(id: string) {
  if (!id) throw new Error("Copilot id is required");
  return instance.delete<{
    success: string;
  }>(`/${id}`);
}

export async function updateCopilot(id: string, copilot: Partial<CopilotType>) {
  return instance.post<{
    chatbot: CopilotType;
  }>(`/${id}`, copilot);
}

// {{backend_base}}/copilot
export async function createCopilot(copilot_name: string) {
  const form = new FormData()
  form.append('name', copilot_name)
  return await instance.post<CopilotType>('/', form)
}
// {{backend_base}}/copilot/:id/variables
export async function getVariables(id: string) {
  return (await instance.get<{ variables: any[] }>(`/${id}/variables`)).data;
}
// {{backend_base}}/copilot/:id/variables
export async function createVariable(id: string, name: string, value: string) {
  return await instance.post<{ message: string }>(`/${id}/variables`, { [name]: value })
}