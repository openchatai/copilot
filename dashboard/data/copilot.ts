import axios from "axios";
import { baseUrl } from "./base-url";

const instance = axios.create({
  baseURL: baseUrl + "/backend/copilot",
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
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
  return await instance.post<CopilotType>('/', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json'
    }
  })
}
// localhost:8888/backend/copilot/5a958877-63b6-47a5-afa3-621dc57e7d1b/variables
export async function getVariablesByBotId(id: string) {
  return (await instance.get<Record<string, string>>(`/${id}/variables`)).data;
}
export type VariableType = {
  name: string;
  value: string;
}
// {{backend_base}}/backend/copilot/:id/variables
export async function createVariable(id: string, variables: VariableType[]) {
  // data = {key1: value1, key2: value2}
  const data = variables.reduce((acc, { name, value }) => ({ ...acc, [name]: value }), {})
  return await instance.post<{ message: string }>(`/${id}/variables`, data)
}
// {{backend_base}}/backend/copilot/:id/variable/:var_name
export async function deleteVariableByKey(id: string, name: string) {
  return await instance.delete<{ message: string }>(`/${id}/variable/${name}`)
}

