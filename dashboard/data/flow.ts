import axios from "axios";
const instance = axios.create({
  baseURL: "http://localhost:8888/backend/flows",
});
type Flow = {
  name: string;
  description: string;
  requires_confirmation: boolean;
  steps: {
    stepId: string;
    operation: string;
    open_api_operation_id: string;
    description: string;
    parameters?: Record<string, unknown>;
  };
  on_success: {
    handler: string;
  };
  on_failure: {
    handler: string;
  };
};

type Workflow = {
  _id: string;
  opencopilot: string;
  info: {
    title: string;
    version: string;
  };
  swagger_id: string;
  flows: Flow[];
};

interface PaginatedWorkflows {
  workflows: Workflow[];
  page: number;
  page_size: number;
  total_workflows: number;
}
// http://localhost:8888/backend/flows/get/b/:bot_id?page=1
export const getWorkflowsByBotId = async (bot_id: string, page: number = 1) => {
  return await instance.get<PaginatedWorkflows>(
    `/get/b/${bot_id}?page=${page}`,
  );
};
export const getWorkflowById = async (id: string) => {
  return await instance.get<Workflow>(`/${id}`);
};

export const createWorkflowFromSwagger = (
  swaggerUrl: string,
): Promise<Workflow> => {
  return instance.post(`/u/${swaggerUrl}`);
};
// http://localhost:8888/backend/flows/b/:bot_id
export const createWorkflowByBotId = async (bot_id: string, data: any) => {
  return await instance.post<{
    message: "Workflow created";
    workflow_id: string;
  }>(`/b/${bot_id}`, data);
};

export const getWorkflowsBySwagger = (swagger_url: string) => {
  return instance.get<PaginatedWorkflows>(`/b/${swagger_url}`);
};

export const updateWorkflowById = (id: string, data: Partial<Workflow>) => {
  return instance.put<Workflow>(`/${id}`, data);
};

// http://localhost:8888/backend/flows/:workflow_id
export const deleteWorkflowById = async (id: string) => {
  if (!id) {
    throw new Error("id is required");
  }
  return await instance.delete<{
    message: string;
  }>(`/${id}`);
};

export const runWorkflow = (data: any) => {
  return instance.post<{ response: string }>("/run_workflow", data);
};
