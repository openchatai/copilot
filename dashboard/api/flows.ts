import axios from "axios";
const axiosInstance = axios.create({
  baseURL: "http://localhost:8888",
});
// @todo to be added by falta
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
export const getWorkflowsByBotId = (bot_id: string, page: number = 1) => {
  return axiosInstance.get<PaginatedWorkflows>(
    `/backend/flows/get/b/${bot_id}?page=${page}`
  );
};

// http://localhost:8888/backend/flows/:workflow_id
export const getWorkflowById = (id: string) => {
  return axiosInstance.get<Workflow>(`/backend/flows/${id}`);
};

export const createWorkflowFromSwagger = (
  swaggerUrl: string
): Promise<Workflow> => {
  return axiosInstance.post(`/backend/flows/u/${swaggerUrl}`);
};


// http://localhost:8888/backend/flows/b/:bot_id
export const createWorkflowByBotId = (bot_id: string, data: any) => {
  return axiosInstance.post<Workflow>(`/backend/flows/b/${bot_id}`, data);
};


export const getWorkflowsBySwagger = (swagger_url: string) => {
  return axiosInstance.get<PaginatedWorkflows>(
    `/backend/flows/b/${swagger_url}`
  );
};

export const updateWorkflowById = (id: string, data: Partial<Workflow>) => {
  return axiosInstance.put<Workflow>(`/backend/flows/${id}`, data);
};

export const deleteWorkflowById = (id: string) => {
  return axiosInstance.delete<void>(`/backend/flows/${id}`);
};

export const runWorkflow = (data: any) => {
  return axiosInstance.post<{ response: string }>(
    "/backend/flows/run_workflow",
    data
  );
};
