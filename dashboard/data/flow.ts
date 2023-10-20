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
  _id: {
    $oid: string;
  };
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
  return await instance.get<PaginatedWorkflows>(`/get/b/${bot_id}?page=${page}`);
};
export const getWorkflowById = (id: string) => {
  return instance.get<Workflow>(`/${id}`);
};

export const createWorkflowFromSwagger = (
  swaggerUrl: string,
): Promise<Workflow> => {
  return instance.post(`/u/${swaggerUrl}`);
};

export const createWorkflowByBotId = (bot_id: string, data: any) => {
  return instance.post<Workflow>(`/b/${bot_id}`, data);
};

export const getWorkflowsBySwagger = (swagger_url: string) => {
  return instance.get<PaginatedWorkflows>(`/b/${swagger_url}`);
};

export const updateWorkflowById = (id: string, data: Partial<Workflow>) => {
  return instance.put<Workflow>(`/${id}`, data);
};

export const deleteWorkflowById = (id: string) => {
  return instance.delete<void>(`/${id}`);
};

export const runWorkflow = (data: any) => {
  return instance.post<{ response: string }>("/run_workflow", data);
};
